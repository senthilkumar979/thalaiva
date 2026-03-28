import type { StatFormValues } from "@/components/AdminScorePlayerRow";
import { calculateFantasyPoints, type PlayerMatchStats } from "@/lib/updatedScoring";
import type { IBattingStats, IBowlingStats, IFieldingStats } from "@/models/PlayerMatchScore";

function fin(n: unknown): number {
  const x = typeof n === "number" ? n : Number(n);
  return Number.isFinite(x) ? x : 0;
}

export function statFormToPlayerMatchStats(
  stats: StatFormValues,
  playedInXI: boolean,
  matchId: string
): PlayerMatchStats {
  return {
    playerId: stats.playerId,
    matchId,
    playedInXI,
    runs: fin(stats.Batting.runs),
    ballsFaced: fin(stats.Batting.ballsFaced),
    fours: fin(stats.Batting.fours),
    sixes: fin(stats.Batting.sixes),
    isDismissed: Boolean(stats.Batting.isOut),
    wickets: fin(stats.Bowling.wickets),
    oversBowled: fin(stats.Bowling.oversBowled),
    runsConceded: fin(stats.Bowling.runsConceded),
    dotBalls: fin(stats.Bowling.dotBalls),
    maidenOvers: fin(stats.Bowling.maidenOvers),
    hasHattrick: Boolean(stats.Bowling.hasHattrick),
    catches: fin(stats.Fielding.catches),
    stumpings: fin(stats.Fielding.stumpings),
    directRunOuts: fin(stats.Fielding.runOuts),
    assistedRunOuts: fin(stats.Fielding.assistedRunOuts),
    isCaptain: false,
    isViceCaptain: false,
    isPlayoffMatch: false,
  };
}

export function adminStatInputToFantasyPoints(
  matchId: string,
  input: {
    playerId: string;
    participated: boolean;
    Batting: IBattingStats;
    Bowling: IBowlingStats;
    Fielding: IFieldingStats;
  }
): number {
  const stats: StatFormValues = {
    playerId: input.playerId,
    Batting: input.Batting,
    Bowling: input.Bowling,
    Fielding: input.Fielding,
  };
  return calculateFantasyPoints(statFormToPlayerMatchStats(stats, input.participated, matchId)).finalScore;
}
