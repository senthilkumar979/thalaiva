import { CalendarDays, ClipboardList, MapPin } from "lucide-react";
import { AdminScoreTeamLogo } from "@/components/admin/AdminScoreTeamLogo";
import { formatVenueLabel } from "@/lib/matchVenue";

export interface AdminScoreMatchHeroData {
  franchiseA: { shortCode: string; logoUrl?: string };
  franchiseB: { shortCode: string; logoUrl?: string };
  matchNumber?: number;
  date?: string;
  venue?: string;
}

function formatMatchDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface AdminScoreMatchPageHeroProps {
  loading: boolean;
  match: AdminScoreMatchHeroData | null;
}

export const AdminScoreMatchPageHero = ({ loading, match }: AdminScoreMatchPageHeroProps) => (
  <header className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-slate-950/[0.03] via-transparent to-emerald-950/[0.06] px-6 py-8 dark:from-slate-950/40 dark:to-emerald-950/20 sm:px-8 sm:py-10">
    <div
      className="pointer-events-none absolute -right-12 top-0 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl dark:bg-emerald-500/10"
      aria-hidden
    />
    <div className="relative space-y-6">
      <div className="flex gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/25 bg-emerald-500/10 shadow-inner">
          <ClipboardList className="size-5 text-emerald-700 dark:text-emerald-400/90" aria-hidden />
        </span>
        <div className="min-w-0 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Admin · Match scoring
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Record fantasy stats</h1>
          <p className="max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            Per-fixture data entry for both squads. Point math matches{" "}
            <strong className="font-medium text-foreground">Scoring rules</strong> on each competition — playing
            XI (including Impact Player), then batting, bowling, and fielding.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="h-20 animate-pulse rounded-xl bg-muted/50" aria-hidden />
      ) : match ? (
        <div className="space-y-4 border-t border-border/50 pt-6">
          <div className="flex flex-wrap items-center gap-3 text-base font-semibold tracking-tight sm:text-lg">
            <span className="inline-flex items-center gap-2 text-foreground">
              <AdminScoreTeamLogo logoUrl={match.franchiseA.logoUrl} shortCode={match.franchiseA.shortCode} />
              {match.franchiseA.shortCode}
            </span>
            <span className="text-sm font-normal text-muted-foreground">vs</span>
            <span className="inline-flex items-center gap-2 text-foreground">
              <AdminScoreTeamLogo logoUrl={match.franchiseB.logoUrl} shortCode={match.franchiseB.shortCode} />
              {match.franchiseB.shortCode}
            </span>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {match.matchNumber != null ? (
              <span className="font-mono text-xs font-semibold uppercase tracking-wide text-foreground/85">
                Match #{match.matchNumber}
              </span>
            ) : null}
            {match.date ? (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-3.5 shrink-0 opacity-70" aria-hidden />
                {formatMatchDate(match.date)}
              </span>
            ) : null}
            {match.venue ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5 shrink-0 opacity-70" aria-hidden />
                {formatVenueLabel(match.venue)}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  </header>
);
