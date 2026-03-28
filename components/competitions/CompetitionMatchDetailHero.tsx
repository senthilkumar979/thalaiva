import { AdminScoreTeamLogo } from "@/components/admin/AdminScoreTeamLogo";
import type { FranchiseLite } from "@/components/competitions/CompetitionMatchScoresAccordion";
import { formatVenueLabel } from "@/lib/matchVenue";

interface CompetitionMatchDetailHeroProps {
  matchNumber: number;
  franchiseA: FranchiseLite;
  franchiseB: FranchiseLite;
  date: string;
  venue: string;
  scored: boolean;
}

export const CompetitionMatchDetailHero = ({
  matchNumber,
  franchiseA,
  franchiseB,
  date,
  venue,
  scored,
}: CompetitionMatchDetailHeroProps) => (
  <header className="space-y-4 border-b border-white/10 pb-6">
    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">Fixture</p>

    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/15 bg-white/[0.05] px-4 py-5 ring-1 ring-white/10 sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
        <AdminScoreTeamLogo
          logoUrl={franchiseA.logoUrl}
          shortCode={franchiseA.shortCode}
          size="lg"
          className="ring-white/25 bg-white/10 !text-white"
        />
        <div className="min-w-0 text-left">
          <p className="text-xs font-medium uppercase tracking-wider text-white/45">{franchiseA.shortCode}</p>
          <p className="truncate text-[11px] text-white/40">{franchiseA.name}</p>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-center gap-1 px-2 text-center">
        <span className="text-2xl font-bold tabular-nums text-white">#{matchNumber}</span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">vs</span>
      </div>

      <div className="flex min-w-0 flex-1 flex-row-reverse items-center gap-3 sm:gap-4">
        <AdminScoreTeamLogo
          logoUrl={franchiseB.logoUrl}
          shortCode={franchiseB.shortCode}
          size="lg"
          className="ring-white/25 bg-white/10 !text-white"
        />
        <div className="min-w-0 text-right">
          <p className="text-xs font-medium uppercase tracking-wider text-white/45">{franchiseB.shortCode}</p>
          <p className="truncate text-[11px] text-white/40">{franchiseB.name}</p>
        </div>
      </div>
    </div>

    <div className="space-y-1">
      <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
        {franchiseA.shortCode} <span className="text-white/50">vs</span> {franchiseB.shortCode}
      </h1>
      <p className="text-sm text-white/60">
        {new Date(date).toLocaleString()} · {formatVenueLabel(venue)}
      </p>
    </div>

    {!scored ? (
      <p className="rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90">
        This match has not been scored yet — check back after admin submits scores.
      </p>
    ) : null}
  </header>
);
