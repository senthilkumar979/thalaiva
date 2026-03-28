import type { MatchScorePlayerRow } from "@/components/competitions/CompetitionMatchScoresAccordion";

export interface HighlightPick {
  playerId: string;
  name: string;
  franchiseShortCode: string;
  value: number;
}

export interface MatchHighlights {
  topBattingFantasy: HighlightPick | null;
  topBowlingFantasy: HighlightPick | null;
  topFieldingFantasy: HighlightPick | null;
  topTotalFantasy: HighlightPick | null;
  highestRuns: HighlightPick | null;
  highestWickets: HighlightPick | null;
}

function pick(p: MatchScorePlayerRow, value: number): HighlightPick {
  return {
    playerId: p.playerId,
    name: p.name,
    franchiseShortCode: p.franchiseShortCode,
    value,
  };
}

function maxBy(players: MatchScorePlayerRow[], score: (p: MatchScorePlayerRow) => number): HighlightPick | null {
  if (players.length === 0) return null;
  let best = players[0];
  let bestV = score(best);
  for (let i = 1; i < players.length; i++) {
    const v = score(players[i]);
    if (v > bestV) {
      best = players[i];
      bestV = v;
    }
  }
  return pick(best, bestV);
}

export function buildMatchHighlights(players: MatchScorePlayerRow[]): MatchHighlights {
  if (players.length === 0) {
    return {
      topBattingFantasy: null,
      topBowlingFantasy: null,
      topFieldingFantasy: null,
      topTotalFantasy: null,
      highestRuns: null,
      highestWickets: null,
    };
  }
  return {
    topBattingFantasy: maxBy(players, (p) => p.sectionPoints.batting),
    topBowlingFantasy: maxBy(players, (p) => p.sectionPoints.bowling),
    topFieldingFantasy: maxBy(players, (p) => p.sectionPoints.fielding),
    topTotalFantasy: maxBy(players, (p) => p.fantasyPoints),
    highestRuns: maxBy(players, (p) => p.Batting.runs),
    highestWickets: maxBy(players, (p) => p.Bowling.wickets),
  };
}
