import { FANTASY_SCORING_POINT_VALUES as P } from "@/lib/updatedScoring";
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

  const runPts = b.runs * P.PER_RUN;
  addBreakdown(breakdown, "Runs", runPts);

  const fourPts = b.fours * P.PER_FOUR;
  addBreakdown(breakdown, "Fours", fourPts);

  const sixPts = b.sixes * P.PER_SIX;
  addBreakdown(breakdown, "Sixes", sixPts);

  /** Run milestones stack: 30+, 50+, and 100+ tiers all apply when thresholds are met. */
  if (b.runs >= 30) addBreakdown(breakdown, "30-run milestone", P.MILESTONE_30);
  if (b.runs >= 50) addBreakdown(breakdown, "50-run milestone", P.MILESTONE_50);
  if (b.runs >= 100) addBreakdown(breakdown, "100-run milestone", P.MILESTONE_100);

  if (b.isOut && b.runs === 0) {
    // addBreakdown(breakdown, "Duck", -5);
  }

  /** Full overs only (e.g. 3.4 → 3 overs) — same as `updatedScoring` `overPoints`. */
  const fullOversBowled = Math.floor(bw.oversBowled + 1e-9);
  addBreakdown(breakdown, "Overs bowled", fullOversBowled * P.PER_OVER);

  const wkPts = bw.wickets * P.PER_WICKET;
  addBreakdown(breakdown, "Wickets", wkPts);

  addBreakdown(breakdown, "Maiden overs", bw.maidenOvers * P.PER_MAIDEN);
  addBreakdown(breakdown, "Dot balls", bw.dotBalls * P.PER_DOT_BALL);

  /** Wicket haul bonuses stack: 3+, 5+, and 6+ tiers all apply when thresholds are met. */
  if (bw.wickets >= 3) addBreakdown(breakdown, "3-wicket haul", P.HAUL_3W);
  if (bw.wickets >= 5) addBreakdown(breakdown, "5-wicket haul", P.HAUL_5W);
  if (bw.wickets >= 6) addBreakdown(breakdown, "6-wicket haul", P.HAUL_6W);

  const oversDec = cricketOversToDecimal(bw.oversBowled);
  if (oversDec >= 2 && oversDec > 0) {
    const economy = bw.runsConceded / oversDec;
    if (economy < P.ECONOMY_THRESHOLD) addBreakdown(breakdown, "Economy bonus (<6)", P.ECONOMY_BONUS);
  }

  addBreakdown(breakdown, "Catches", f.catches * P.PER_CATCH);
  addBreakdown(breakdown, "Stumpings", f.stumpings * P.PER_STUMPING);
  addBreakdown(breakdown, "Run-outs", f.runOuts * P.PER_DIRECT_RUNOUT);

  if (b.ballsFaced >= 10) {
    const sr = (b.runs / b.ballsFaced) * 100;
    if (sr > P.STRIKE_RATE_THRESHOLD) addBreakdown(breakdown, "Strike rate bonus (>200)", P.STRIKE_RATE_BONUS);
  }

  const total = breakdown.reduce((s, x) => s + x.points, 0);
  return { total, breakdown };
}

export function calculateFantasyPoints(stats: IPlayerMatchScoreInput): number {
  return calculateFantasyPointsWithBreakdown(stats).total;
}

/** Flat bonus when the player is selected as part of the playing XI for this match. */
export const MATCH_PARTICIPATION_POINTS = 2;

/** Official player of the match — only when in playing XI (see `Match.playerOfMatch`). */
export const PLAYER_OF_MATCH_POINTS = P.PLAYER_OF_MATCH;

export function playerMatchFantasyPoints(
  stats: IPlayerMatchScoreInput,
  participated: boolean,
  isPlayerOfMatch = false
): number {
  const base = calculateFantasyPoints(stats);
  if (!participated) return base;
  let extra = MATCH_PARTICIPATION_POINTS;
  if (isPlayerOfMatch) extra += PLAYER_OF_MATCH_POINTS;
  return base + extra;
}

/** @deprecated Use playerMatchFantasyPoints(stats, true) — kept for quick migration references */
export function totalPlayerMatchFantasyPoints(stats: IPlayerMatchScoreInput): number {
  return playerMatchFantasyPoints(stats, true);
}

export function getPlayerMatchFantasyPointsBreakdown(
  stats: IPlayerMatchScoreInput,
  participated: boolean,
  isPlayerOfMatch = false
): {
  total: number;
  breakdown: FantasyPointsBreakdown[];
} {
  const { total, breakdown } = calculateFantasyPointsWithBreakdown(stats);
  if (!participated) {
    return { total, breakdown };
  }
  const extras: FantasyPointsBreakdown[] = [
    { label: "Match participation", points: MATCH_PARTICIPATION_POINTS },
  ];
  if (isPlayerOfMatch) {
    extras.push({ label: "Player of the match", points: PLAYER_OF_MATCH_POINTS });
  }
  const extrasSum = MATCH_PARTICIPATION_POINTS + (isPlayerOfMatch ? PLAYER_OF_MATCH_POINTS : 0);
  return {
    total: total + extrasSum,
    breakdown: [...breakdown, ...extras],
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
  batting += b.runs * P.PER_RUN;
  batting += b.fours * P.PER_FOUR;
  batting += b.sixes * P.PER_SIX;
  if (b.runs >= 30) batting += P.MILESTONE_30;
  if (b.runs >= 50) batting += P.MILESTONE_50;
  if (b.runs >= 100) batting += P.MILESTONE_100;
  // if (b.isOut && b.runs === 0) batting -= 5;
  if (b.ballsFaced >= 10) {
    const sr = (b.runs / b.ballsFaced) * 100;
    if (sr > P.STRIKE_RATE_THRESHOLD) batting += P.STRIKE_RATE_BONUS;
    else if (sr >= P.STRIKE_RATE_THRESHOLD - 20) batting += P.STRIKE_RATE_BONUS;
  }
  let bowling = 0;
  bowling += Math.floor(bw.oversBowled + 1e-9) * P.PER_OVER;
  bowling += bw.wickets * P.PER_WICKET;
  bowling += bw.maidenOvers * P.PER_MAIDEN;
  bowling += bw.dotBalls * P.PER_DOT_BALL;
  if (bw.wickets >= 3) bowling += P.HAUL_3W;
  if (bw.wickets >= 5) bowling += P.HAUL_5W;
  if (bw.wickets >= 6) bowling += P.HAUL_6W;
  const oversDec = cricketOversToDecimal(bw.oversBowled);
  if (oversDec >= 2 && oversDec > 0) {
    const economy = bw.runsConceded / oversDec;
    if (economy <= P.ECONOMY_THRESHOLD) bowling += P.ECONOMY_BONUS;
  }
  const fielding = f.catches * P.PER_CATCH + f.stumpings * P.PER_STUMPING + f.runOuts * P.PER_DIRECT_RUNOUT;
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
  "Strike rate bonus (>200)",
]);

const BOWLING_BREAKDOWN_LABELS = new Set([
  "Overs bowled",
  "Wickets",
  "Maiden overs",
  "Dot balls",
  "3-wicket haul",
  "5-wicket haul",
  "6-wicket haul",
  "Economy bonus (<6)",
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
    if (row.label === "Match participation" || row.label === "Player of the match") {
      participation.push(row);
      continue;
    }
    if (BATTING_BREAKDOWN_LABELS.has(row.label)) batting.push(row);
    else if (BOWLING_BREAKDOWN_LABELS.has(row.label)) bowling.push(row);
    else if (FIELDING_BREAKDOWN_LABELS.has(row.label)) fielding.push(row);
  }
  return { batting, bowling, fielding, participation };
}
