import type { StatFormValues } from "@/components/AdminScorePlayerRow";

export function emptyPlayerScoreStats(playerId: string): StatFormValues {
  return {
    playerId,
    Batting: { runs: 0, ballsFaced: 0, fours: 0, sixes: 0, isOut: false },
    Bowling: { wickets: 0, oversBowled: 0, maidenOvers: 0, runsConceded: 0, dotBalls: 0 },
    Fielding: { catches: 0, stumpings: 0, runOuts: 0 },
  };
}
