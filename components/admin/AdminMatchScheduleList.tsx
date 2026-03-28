import Link from "next/link";
import { ArrowUpRight, Calendar, Home, MapPin, Pencil, Plane } from "lucide-react";
import { AdminScoreTeamLogo } from "@/components/admin/AdminScoreTeamLogo";
import { Button } from "@/components/ui/button";
import { formatVenueLabel } from "@/lib/matchVenue";
import { cn } from "@/lib/utils";

interface Franchise {
  _id: string;
  name: string;
  shortCode: string;
  logoUrl?: string;
}

export interface AdminMatchRow {
  _id: string;
  matchNumber: number;
  date: string;
  venue: string;
  isScored: boolean;
  franchiseA: Franchise;
  franchiseB: Franchise;
}

interface AdminMatchScheduleListProps {
  matches: AdminMatchRow[];
  onEdit?: (m: AdminMatchRow) => void;
}

function formatMatchDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export const AdminMatchScheduleList = ({ matches, onEdit }: AdminMatchScheduleListProps) => (
  <section className="space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Fixture list</h2>
        <p className="mt-1 text-lg font-semibold tracking-tight text-foreground">Scheduled matches</p>
      </div>
      <span className="rounded-full border border-border/80 bg-muted/50 px-3 py-1 text-xs font-medium tabular-nums text-muted-foreground">
        {matches.length} {matches.length === 1 ? "match" : "matches"}
      </span>
    </div>

    <ul className="grid gap-4">
      {matches.map((m) => (
        <li key={m._id}>
          <div
            className={cn(
              "group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-1 shadow-sm transition-all duration-300",
              "hover:border-emerald-500/25 hover:shadow-md hover:shadow-emerald-950/5",
              "dark:hover:shadow-emerald-950/20"
            )}
          >
            <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-gradient-to-b from-emerald-500 to-teal-600 opacity-90" />
            <div className="relative flex flex-col gap-4 rounded-xl bg-gradient-to-br from-muted/30 to-transparent p-4 pl-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5">
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-foreground/5 px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    #{m.matchNumber}
                  </span>
                  {m.isScored ? (
                    <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                      Scored
                    </span>
                  ) : (
                    <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-200/90">
                      Pending
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-base font-semibold tracking-tight sm:text-lg">
                  <span className="inline-flex items-center gap-2 text-foreground">
                    <span
                      className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                      title="Home"
                    >
                      <Home className="size-3.5 shrink-0 opacity-70" aria-hidden />
                      Home
                    </span>
                    <AdminScoreTeamLogo
                      logoUrl={m.franchiseA?.logoUrl}
                      shortCode={m.franchiseA?.shortCode ?? "—"}
                      size="sm"
                    />
                    <span>{m.franchiseA?.shortCode}</span>
                  </span>
                  <span className="text-xs font-normal text-muted-foreground">vs</span>
                  <span className="inline-flex items-center gap-2 text-foreground">
                    <span
                      className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                      title="Away"
                    >
                      <Plane className="size-3.5 shrink-0 opacity-70" aria-hidden />
                      Away
                    </span>
                    <AdminScoreTeamLogo
                      logoUrl={m.franchiseB?.logoUrl}
                      shortCode={m.franchiseB?.shortCode ?? "—"}
                      size="sm"
                    />
                    <span>{m.franchiseB?.shortCode}</span>
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground sm:text-sm">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="size-3.5 shrink-0 opacity-60" aria-hidden />
                    {formatMatchDate(m.date)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-3.5 shrink-0 opacity-60" aria-hidden />
                    {formatVenueLabel(m.venue)}
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                {onEdit ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => onEdit(m)}
                  >
                    <Pencil className="size-3.5" aria-hidden />
                    Edit
                  </Button>
                ) : null}
                <Link
                  href={`/admin/matches/${m._id}/score`}
                  className={cn(
                    "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-border/80 bg-background px-4 py-2.5 text-sm font-semibold transition-all",
                    "hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-800 dark:hover:text-emerald-200",
                    "group-hover:border-emerald-500/30"
                  )}
                >
                  Score
                  <ArrowUpRight className="size-4 opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>

    {matches.length === 0 && (
      <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-16 text-center">
        <p className="text-sm font-medium text-foreground/80">No fixtures yet</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Click &quot;Schedule match&quot; above to add the first fixture.
        </p>
      </div>
    )}
  </section>
);
