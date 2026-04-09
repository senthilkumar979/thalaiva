import mongoose, { type ClientSession, type Types } from "mongoose";
import { adminStatInputToFantasyPoints } from "@/lib/adminScoreToUpdatedStats";
import { connectDb, isMongoTransactionUnsupportedError } from "@/lib/db";
import { Competition } from "@/models/Competition";
import { CompetitionMatchScore } from "@/models/CompetitionMatchScore";
import { Entry } from "@/models/Entry";
import { Match } from "@/models/Match";
import { Player } from "@/models/Player";
import {
  PlayerMatchScore,
  type IBattingStats,
  type IBowlingStats,
  type IFieldingStats,
} from "@/models/PlayerMatchScore";
import { FANTASY_SCORING_POINT_VALUES as P } from "@/lib/updatedScoring";
import { resolveEntryRosterForMatch } from "@/lib/resolveEntryRosterForMatch";

export interface PlayerStatInput {
  playerId: string;
  /** Playing XI — +2 participation only when true. */
  participated: boolean;
  Batting: IBattingStats;
  Bowling: IBowlingStats;
  Fielding: IFieldingStats;
}

function assignRanks(rows: { totalPointsThisMatch: number; rankThisMatch: number }[]): void {
  let rank = 1;
  for (let i = 0; i < rows.length; i++) {
    if (i > 0 && rows[i].totalPointsThisMatch < rows[i - 1].totalPointsThisMatch) rank = i + 1;
    rows[i].rankThisMatch = rank;
  }
}

async function scoreEntriesForCompetition(
  competitionId: Types.ObjectId,
  matchId: Types.ObjectId,
  matchNumber: number,
  matchScoresByPlayer: Map<string, number>,
  session?: ClientSession
): Promise<void> {
  const entries = session
    ? await Entry.find({ competition: competitionId }).session(session).lean()
    : await Entry.find({ competition: competitionId }).lean();
  const cmsRows: {
    entryId: Types.ObjectId;
    userId: Types.ObjectId;
    playersWithPoints: {
      player: Types.ObjectId;
      isCaptain: boolean;
      isViceCaptain: boolean;
      rawPoints: number;
      captainMultiplied: number;
    }[];
    totalPointsThisMatch: number;
    rankThisMatch: number;
  }[] = [];

  for (const e of entries) {
    const roster = await resolveEntryRosterForMatch(e._id, matchNumber, e, session);
    const playerIds = roster.playerIds;
    const playersWithPoints: (typeof cmsRows)[0]["playersWithPoints"] = [];
    let total = 0;
    for (const pid of playerIds) {
      const key = String(pid);
      const raw = matchScoresByPlayer.get(key) ?? 0;
      if (raw === 0) continue;
      const isCaptain = String(roster.captain) === key;
      const isViceCaptain = Boolean(roster.viceCaptain && String(roster.viceCaptain) === key);
      let mult = 1;
      if (isCaptain) mult = P.CAPTAIN_MULTIPLIER;
      else if (isViceCaptain) mult = P.VICE_CAPTAIN_MULTIPLIER;
      const captainMultiplied = raw * mult;
      playersWithPoints.push({
        player: pid,
        isCaptain,
        isViceCaptain,
        rawPoints: raw,
        captainMultiplied,
      });
      total += captainMultiplied;
    }
    cmsRows.push({
      entryId: e._id,
      userId: e.user,
      playersWithPoints,
      totalPointsThisMatch: total,
      rankThisMatch: 0,
    });
  }

  cmsRows.sort((a, b) => b.totalPointsThisMatch - a.totalPointsThisMatch);
  assignRanks(cmsRows);

  for (let i = 0; i < cmsRows.length; i++) {
    const row = cmsRows[i];
    await CompetitionMatchScore.findOneAndUpdate(
      { competition: competitionId, match: matchId, entry: row.entryId },
      {
        $set: {
          user: row.userId,
          playersWithPoints: row.playersWithPoints,
          totalPointsThisMatch: row.totalPointsThisMatch,
          rankThisMatch: row.rankThisMatch,
        },
      },
      session ? { upsert: true, session } : { upsert: true }
    );
    await Entry.updateOne(
      { _id: row.entryId },
      { $inc: { totalScore: row.totalPointsThisMatch } },
      session ? { session } : {}
    );
  }
}

async function rollBackMatchScoring(matchId: string, session?: ClientSession): Promise<void> {
  const mid = new mongoose.Types.ObjectId(matchId);
  const pms = session
    ? await PlayerMatchScore.find({ match: mid }).session(session).lean()
    : await PlayerMatchScore.find({ match: mid }).lean();
  for (const row of pms) {
    await Player.updateOne(
      { _id: row.player },
      { $inc: { totalFantasyPoints: -row.fantasyPoints } },
      session ? { session } : {}
    );
  }
  const cms = session
    ? await CompetitionMatchScore.find({ match: mid }).session(session).lean()
    : await CompetitionMatchScore.find({ match: mid }).lean();
  for (const row of cms) {
    await Entry.updateOne(
      { _id: row.entry },
      { $inc: { totalScore: -row.totalPointsThisMatch } },
      session ? { session } : {}
    );
  }
  await (session
    ? CompetitionMatchScore.deleteMany({ match: mid }).session(session)
    : CompetitionMatchScore.deleteMany({ match: mid }));
  await (session
    ? PlayerMatchScore.deleteMany({ match: mid }).session(session)
    : PlayerMatchScore.deleteMany({ match: mid }));
}

async function submitMatchScoresWithSession(
  matchId: string,
  stats: PlayerStatInput[],
  options: { playerOfMatchPlayerId?: string | null } | undefined,
  session?: ClientSession
): Promise<void> {
  const match = session
    ? await Match.findById(matchId).session(session)
    : await Match.findById(matchId);
  if (!match) throw new Error("Match not found");
  if (match.isScored) await rollBackMatchScoring(matchId, session);

  const pomId = options?.playerOfMatchPlayerId?.trim() || null;

  for (const s of stats) {
    const isPlayerOfTheMatch = Boolean(
      pomId && String(s.playerId) === pomId && s.participated
    );
    const pts = adminStatInputToFantasyPoints(matchId, { ...s, isPlayerOfTheMatch });
    await PlayerMatchScore.findOneAndUpdate(
      { player: s.playerId, match: matchId },
      {
        $set: {
          Batting: s.Batting,
          Bowling: s.Bowling,
          Fielding: s.Fielding,
          participated: s.participated,
          fantasyPoints: pts,
        },
      },
      session ? { upsert: true, session } : { upsert: true }
    );
    await Player.updateOne(
      { _id: s.playerId },
      { $inc: { totalFantasyPoints: pts } },
      session ? { session } : {}
    );
  }

  const allPms = session
    ? await PlayerMatchScore.find({ match: matchId }).session(session).lean()
    : await PlayerMatchScore.find({ match: matchId }).lean();
  const matchScoresByPlayer = new Map<string, number>();
  for (const p of allPms) matchScoresByPlayer.set(String(p.player), p.fantasyPoints);

  const competitions = session
    ? await Competition.find({ isActive: true }).session(session).lean()
    : await Competition.find({ isActive: true }).lean();
  for (const c of competitions) {
    await scoreEntriesForCompetition(c._id, match._id, match.matchNumber, matchScoresByPlayer, session);
  }

  if (pomId) {
    await Match.updateOne(
      { _id: matchId },
      { $set: { isScored: true, playerOfMatch: new mongoose.Types.ObjectId(pomId) } },
      session ? { session } : {}
    );
  } else {
    await Match.updateOne(
      { _id: matchId },
      { $set: { isScored: true }, $unset: { playerOfMatch: "" } },
      session ? { session } : {}
    );
  }
}

export async function submitMatchScores(
  matchId: string,
  stats: PlayerStatInput[],
  options?: { playerOfMatchPlayerId?: string | null }
): Promise<void> {
  await connectDb();
  const session = await mongoose.startSession();
  let transactionStarted = false;
  try {
    session.startTransaction();
    transactionStarted = true;
  } catch (e) {
    session.endSession();
    if (!isMongoTransactionUnsupportedError(e)) throw e;
    await submitMatchScoresWithSession(matchId, stats, options, undefined);
    return;
  }

  if (transactionStarted) {
    let sessionEnded = false;
    try {
      await submitMatchScoresWithSession(matchId, stats, options, session);
      await session.commitTransaction();
    } catch (e) {
      await session.abortTransaction().catch(() => {});
      session.endSession();
      sessionEnded = true;
      if (isMongoTransactionUnsupportedError(e)) {
        await submitMatchScoresWithSession(matchId, stats, options, undefined);
      } else {
        throw e;
      }
    }
    if (!sessionEnded) {
      session.endSession();
    }
  }
}
