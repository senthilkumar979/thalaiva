import type { PointsBreakdown } from "@/lib/updatedScoring";

const LINE_KEYS: { key: keyof PointsBreakdown; label: string }[] = [
  { key: "playerOfSeries", label: "Player of the series" },
  { key: "orangeCap", label: "Orange Cap" },
  { key: "purpleCap", label: "Purple Cap" },
  { key: "emergingPlayer", label: "Emerging player" },
  { key: "xi", label: "Playing XI / Impact Player" },
  { key: "playerOfMatch", label: "Player of the match" },
  { key: "topScorer", label: "Top scorer of the match" },
  { key: "topWicketTaker", label: "Top wicket-taker of the match" },
  { key: "runPoints", label: "Runs" },
  { key: "fourPoints", label: "Fours" },
  { key: "sixPoints", label: "Sixes" },
  { key: "strikeRateBonus", label: "Strike rate bonus" },
  { key: "milestone30", label: "30-run milestone" },
  { key: "milestone50", label: "50-run milestone" },
  { key: "milestone100", label: "100-run milestone" },
  { key: "overPoints", label: "Overs bowled (full overs)" },
  { key: "wicketPoints", label: "Wickets" },
  { key: "dotBallPoints", label: "Dot balls" },
  { key: "maidenPoints", label: "Maiden overs" },
  { key: "economyBonus", label: "Economy bonus" },
  { key: "hattrickBonus", label: "Hat-trick" },
  { key: "haul3wBonus", label: "3+ wicket haul" },
  { key: "haul5wBonus", label: "5+ wicket haul" },
  { key: "haul6wBonus", label: "6+ wicket haul" },
  { key: "catchPoints", label: "Catches" },
  { key: "stumpingPoints", label: "Stumpings" },
  { key: "directRunOutPoints", label: "Direct run-outs" },
  { key: "assistedRunOutPoints", label: "Assisted run-outs" },
];

/** Line items with non-zero, finite points (for admin breakdown UI). */
export function getUpdatedScoreBreakdownLines(b: PointsBreakdown): { label: string; points: number }[] {
  const rows: { label: string; points: number }[] = [];
  for (const { key, label } of LINE_KEYS) {
    const v = b[key] as number;
    if (!Number.isFinite(v) || v === 0) continue;
    rows.push({ label, points: v });
  }
  return rows;
}
