import type { IBattingStats, IBowlingStats, IFieldingStats } from "@/models/PlayerMatchScore";

export interface IPlayerMatchScoreInput {
  Batting: IBattingStats;
  Bowling: IBowlingStats;
  Fielding: IFieldingStats;
}

export interface FantasyPointsBreakdown {
  label: string;
  points: number;
}

/** e.g. 3.4 → 3 overs + 4 balls → 3.666... overs */
export function cricketOversToDecimal(overs: number): number {
  const whole = Math.floor(overs + 1e-9);
  const frac = overs - whole;
  const balls = Math.round(frac * 10 + 1e-9);
  return whole + Math.min(balls, 5) / 6;
}

function addBreakdown(
  breakdown: FantasyPointsBreakdown[],
  label: string,
  points: number
): void {
  if (points === 0) return;
  breakdown.push({ label, points });
}

export function calculateFantasyPointsWithBreakdown(
  stats: IPlayerMatchScoreInput
): { total: number; breakdown: FantasyPointsBreakdown[] } {
  const breakdown: FantasyPointsBreakdown[] = [];
  const { Batting: b, Bowling: bw, Fielding: f } = stats;

  const runPts = b.runs * 1;
  addBreakdown(breakdown, "Runs", runPts);

  const fourPts = b.fours * 4;
  addBreakdown(breakdown, "Fours", fourPts);

  const sixPts = b.sixes * 6;
  addBreakdown(breakdown, "Sixes", sixPts);

  if (b.runs >= 100) {
    addBreakdown(breakdown, "100-run milestone", 40);
    addBreakdown(breakdown, "50-run milestone", 20);
  } else if (b.runs >= 50) {
    addBreakdown(breakdown, "50-run milestone", 20);
  }

  if (b.isOut && b.runs === 0) {
    addBreakdown(breakdown, "Duck", -5);
  }

  const wkPts = bw.wickets * 25;
  addBreakdown(breakdown, "Wickets", wkPts);

  addBreakdown(breakdown, "Maiden overs", bw.maidenOvers * 10);
  addBreakdown(breakdown, "Dot balls", bw.dotBalls * 4);

  if (bw.wickets >= 5) addBreakdown(breakdown, "5-wicket haul", 20);
  else if (bw.wickets >= 3) addBreakdown(breakdown, "3-wicket haul", 10);

  const oversDec = cricketOversToDecimal(bw.oversBowled);
  if (oversDec >= 2 && oversDec > 0) {
    const economy = bw.runsConceded / oversDec;
    if (economy < 5) addBreakdown(breakdown, "Economy bonus (<5)", 10);
    else if (economy <= 6) addBreakdown(breakdown, "Economy bonus (5–6)", 6);
  }

  addBreakdown(breakdown, "Catches", f.catches * 10);
  addBreakdown(breakdown, "Stumpings", f.stumpings * 15);
  addBreakdown(breakdown, "Run-outs", f.runOuts * 10);

  if (b.ballsFaced >= 10) {
    const sr = (b.runs / b.ballsFaced) * 100;
    if (sr > 150) addBreakdown(breakdown, "Strike rate bonus (>150)", 6);
    else if (sr >= 130) addBreakdown(breakdown, "Strike rate bonus (130–150)", 4);
  }

  const total = breakdown.reduce((s, x) => s + x.points, 0);
  return { total, breakdown };
}

export function calculateFantasyPoints(stats: IPlayerMatchScoreInput): number {
  return calculateFantasyPointsWithBreakdown(stats).total;
}

/** Flat bonus for being in the playing squad for this match (applied to stored fantasy total). */
export const MATCH_PARTICIPATION_POINTS = 2;

export function totalPlayerMatchFantasyPoints(stats: IPlayerMatchScoreInput): number {
  return calculateFantasyPoints(stats) + MATCH_PARTICIPATION_POINTS;
}

export function getPlayerMatchFantasyPointsBreakdown(stats: IPlayerMatchScoreInput): {
  total: number;
  breakdown: FantasyPointsBreakdown[];
} {
  const { total, breakdown } = calculateFantasyPointsWithBreakdown(stats);
  const participation = MATCH_PARTICIPATION_POINTS;
  return {
    total: total + participation,
    breakdown: [...breakdown, { label: "Match participation", points: participation }],
  };
}
