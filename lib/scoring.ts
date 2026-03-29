import type { IBattingStats, IBowlingStats, IFieldingStats } from "@/models/PlayerMatchScore";
import { FANTASY_SCORING_POINT_VALUES as P } from "@/lib/updatedScoring";

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

  /** Run milestones stack: 30+, 50+, and 100+ tiers all apply when thresholds are met. */
  if (b.runs >= 30) addBreakdown(breakdown, "30-run milestone", P.MILESTONE_30);
  if (b.runs >= 50) addBreakdown(breakdown, "50-run milestone", P.MILESTONE_50);
  if (b.runs >= 100) addBreakdown(breakdown, "100-run milestone", P.MILESTONE_100);

  if (b.isOut && b.runs === 0) {
    addBreakdown(breakdown, "Duck", -5);
  }

  const wkPts = bw.wickets * 25;
  addBreakdown(breakdown, "Wickets", wkPts);

  addBreakdown(breakdown, "Maiden overs", bw.maidenOvers * 10);
  addBreakdown(breakdown, "Dot balls", bw.dotBalls * 4);

  /** Wicket haul bonuses stack: 3+, 5+, and 6+ tiers all apply when thresholds are met. */
  if (bw.wickets >= 3) addBreakdown(breakdown, "3-wicket haul", P.HAUL_3W);
  if (bw.wickets >= 5) addBreakdown(breakdown, "5-wicket haul", P.HAUL_5W);
  if (bw.wickets >= 6) addBreakdown(breakdown, "6-wicket haul", P.HAUL_6W);

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

/** Flat bonus when the player is selected as part of the playing XI for this match. */
export const MATCH_PARTICIPATION_POINTS = 2;

export function playerMatchFantasyPoints(stats: IPlayerMatchScoreInput, participated: boolean): number {
  const base = calculateFantasyPoints(stats);
  return base + (participated ? MATCH_PARTICIPATION_POINTS : 0);
}

/** @deprecated Use playerMatchFantasyPoints(stats, true) — kept for quick migration references */
export function totalPlayerMatchFantasyPoints(stats: IPlayerMatchScoreInput): number {
  return playerMatchFantasyPoints(stats, true);
}

export function getPlayerMatchFantasyPointsBreakdown(
  stats: IPlayerMatchScoreInput,
  participated: boolean
): {
  total: number;
  breakdown: FantasyPointsBreakdown[];
} {
  const { total, breakdown } = calculateFantasyPointsWithBreakdown(stats);
  if (!participated) {
    return { total, breakdown };
  }
  return {
    total: total + MATCH_PARTICIPATION_POINTS,
    breakdown: [...breakdown, { label: "Match participation", points: MATCH_PARTICIPATION_POINTS }],
  };
}

/** Fantasy points attributed to batting / bowling / fielding (excludes match participation bonus). */
export function sectionFantasyPoints(stats: IPlayerMatchScoreInput): {
  batting: number;
  bowling: number;
  fielding: number;
} {
  const b = stats.Batting;
  const bw = stats.Bowling;
  const f = stats.Fielding;
  let batting = 0;
  batting += b.runs * 1;
  batting += b.fours * 4;
  batting += b.sixes * 6;
  if (b.runs >= 30) batting += P.MILESTONE_30;
  if (b.runs >= 50) batting += P.MILESTONE_50;
  if (b.runs >= 100) batting += P.MILESTONE_100;
  if (b.isOut && b.runs === 0) batting -= 5;
  if (b.ballsFaced >= 10) {
    const sr = (b.runs / b.ballsFaced) * 100;
    if (sr > 150) batting += 6;
    else if (sr >= 130) batting += 4;
  }
  let bowling = 0;
  bowling += bw.wickets * 25;
  bowling += bw.maidenOvers * 10;
  bowling += bw.dotBalls * 4;
  if (bw.wickets >= 3) bowling += P.HAUL_3W;
  if (bw.wickets >= 5) bowling += P.HAUL_5W;
  if (bw.wickets >= 6) bowling += P.HAUL_6W;
  const oversDec = cricketOversToDecimal(bw.oversBowled);
  if (oversDec >= 2 && oversDec > 0) {
    const economy = bw.runsConceded / oversDec;
    if (economy < 5) bowling += 10;
    else if (economy <= 6) bowling += 6;
  }
  const fielding = f.catches * 10 + f.stumpings * 15 + f.runOuts * 10;
  return { batting, bowling, fielding };
}

const BATTING_BREAKDOWN_LABELS = new Set([
  "Runs",
  "Fours",
  "Sixes",
  "30-run milestone",
  "50-run milestone",
  "100-run milestone",
  "Duck",
  "Strike rate bonus (>150)",
  "Strike rate bonus (130–150)",
]);

const BOWLING_BREAKDOWN_LABELS = new Set([
  "Wickets",
  "Maiden overs",
  "Dot balls",
  "3-wicket haul",
  "5-wicket haul",
  "6-wicket haul",
  "Economy bonus (<5)",
  "Economy bonus (5–6)",
]);

const FIELDING_BREAKDOWN_LABELS = new Set(["Catches", "Stumpings", "Run-outs"]);

export function groupBreakdownBySection(breakdown: FantasyPointsBreakdown[]): {
  batting: FantasyPointsBreakdown[];
  bowling: FantasyPointsBreakdown[];
  fielding: FantasyPointsBreakdown[];
  participation: FantasyPointsBreakdown[];
} {
  const batting: FantasyPointsBreakdown[] = [];
  const bowling: FantasyPointsBreakdown[] = [];
  const fielding: FantasyPointsBreakdown[] = [];
  const participation: FantasyPointsBreakdown[] = [];
  for (const row of breakdown) {
    if (row.label === "Match participation") {
      participation.push(row);
      continue;
    }
    if (BATTING_BREAKDOWN_LABELS.has(row.label)) batting.push(row);
    else if (BOWLING_BREAKDOWN_LABELS.has(row.label)) bowling.push(row);
    else if (FIELDING_BREAKDOWN_LABELS.has(row.label)) fielding.push(row);
  }
  return { batting, bowling, fielding, participation };
}
