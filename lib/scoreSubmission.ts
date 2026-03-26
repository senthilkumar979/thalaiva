import mongoose, { type ClientSession, type Types } from "mongoose";
import { connectDb } from "@/lib/db";
import { totalPlayerMatchFantasyPoints } from "@/lib/scoring";
import { Competition } from "@/models/Competition";
import { CompetitionMatchScore } from "@/models/CompetitionMatchScore";
import { Entry, type IEntry } from "@/models/Entry";
import { Match } from "@/models/Match";
import { Player } from "@/models/Player";
import {
  PlayerMatchScore,
  type IBattingStats,
  type IBowlingStats,
  type IFieldingStats,
} from "@/models/PlayerMatchScore";

export interface PlayerStatInput {
  playerId: string;
  Batting: IBattingStats;
  Bowling: IBowlingStats;
  Fielding: IFieldingStats;
}

function entryPlayerIds(entry: IEntry): Types.ObjectId[] {
  return [
    ...entry.tier1Players,
    ...entry.tier2Players,
    ...entry.tier3Players,
  ];
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
  matchScoresByPlayer: Map<string, number>,
  session: ClientSession
): Promise<void> {
  const entries = await Entry.find({ competition: competitionId }).session(session).lean();
  const cmsRows: {
    entryId: Types.ObjectId;
    userId: Types.ObjectId;
    playersWithPoints: {
      player: Types.ObjectId;
      isCaptain: boolean;
      rawPoints: number;
      captainMultiplied: number;
    }[];
    totalPointsThisMatch: number;
    rankThisMatch: number;
  }[] = [];

  for (const e of entries) {
    const playerIds = entryPlayerIds(e);
    const playersWithPoints: (typeof cmsRows)[0]["playersWithPoints"] = [];
    let total = 0;
    for (const pid of playerIds) {
      const key = String(pid);
      const raw = matchScoresByPlayer.get(key) ?? 0;
      if (raw === 0) continue;
      const isCaptain = String(e.captain) === key;
      const captainMultiplied = isCaptain ? raw * 2 : raw;
      playersWithPoints.push({
        player: pid,
        isCaptain,
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
      { upsert: true, session }
    );
    await Entry.updateOne(
      { _id: row.entryId },
      { $inc: { totalScore: row.totalPointsThisMatch } },
      { session }
    );
  }
}

export async function submitMatchScores(matchId: string, stats: PlayerStatInput[]): Promise<void> {
  await connectDb();
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const match = await Match.findById(matchId).session(session);
    if (!match) throw new Error("Match not found");
    if (match.isScored) throw new Error("Match already scored");

    for (const s of stats) {
      const pts = totalPlayerMatchFantasyPoints({
        Batting: s.Batting,
        Bowling: s.Bowling,
        Fielding: s.Fielding,
      });
      await PlayerMatchScore.findOneAndUpdate(
        { player: s.playerId, match: matchId },
        {
          $set: {
            Batting: s.Batting,
            Bowling: s.Bowling,
            Fielding: s.Fielding,
            fantasyPoints: pts,
          },
        },
        { upsert: true, session }
      );
      await Player.updateOne(
        { _id: s.playerId },
        { $inc: { totalFantasyPoints: pts } },
        { session }
      );
    }

    const allPms = await PlayerMatchScore.find({ match: matchId }).session(session).lean();
    const matchScoresByPlayer = new Map<string, number>();
    for (const p of allPms) matchScoresByPlayer.set(String(p.player), p.fantasyPoints);

    const competitions = await Competition.find({ isActive: true }).session(session).lean();
    for (const c of competitions) {
      await scoreEntriesForCompetition(c._id, match._id, matchScoresByPlayer, session);
    }

    await Match.updateOne({ _id: matchId }, { $set: { isScored: true } }, { session });

    await session.commitTransaction();
  } catch (e) {
    await session.abortTransaction();
    throw e;
  } finally {
    session.endSession();
  }
}
