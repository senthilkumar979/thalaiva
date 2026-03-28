import type { MatchHighlights } from "@/lib/buildMatchHighlights";

interface CompetitionMatchHighlightGridProps {
  highlights: MatchHighlights | null;
}

function Cell({
  label,
  pick,
  suffix,
}: {
  label: string;
  pick: { name: string; franchiseShortCode: string; value: number } | null;
  suffix: string;
}) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/[0.05] p-4 ring-1 ring-white/10">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">{label}</p>
      {pick ? (
        <>
          <p className="mt-2 font-semibold text-white">{pick.name}</p>
          <p className="text-xs text-white/50">{pick.franchiseShortCode}</p>
          <p className="mt-2 text-lg font-bold tabular-nums text-amber-200/95">
            {pick.value}
            {suffix}
          </p>
        </>
      ) : (
        <p className="mt-2 text-sm text-white/45">—</p>
      )}
    </div>
  );
}

export const CompetitionMatchHighlightGrid = ({ highlights }: CompetitionMatchHighlightGridProps) => {
  if (!highlights) return null;
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">Match highlights</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Cell label="Top batting (fantasy)" pick={highlights.topBattingFantasy} suffix=" pts" />
        <Cell label="Top bowling (fantasy)" pick={highlights.topBowlingFantasy} suffix=" pts" />
        <Cell label="Top fielding (fantasy)" pick={highlights.topFieldingFantasy} suffix=" pts" />
        <Cell label="Top total fantasy" pick={highlights.topTotalFantasy} suffix=" pts" />
        <Cell label="Highest runs" pick={highlights.highestRuns} suffix=" runs" />
        <Cell label="Most wickets" pick={highlights.highestWickets} suffix=" wkts" />
      </div>
    </div>
  );
};
