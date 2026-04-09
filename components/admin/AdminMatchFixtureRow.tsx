import Link from "next/link";
import { ArrowUpRight, Calendar, Home, MapPin, Pencil, Plane } from "lucide-react";
import { AdminScoreTeamLogo } from "@/components/admin/AdminScoreTeamLogo";
import { Button } from "@/components/ui/button";
import { formatVenueLabel } from "@/lib/matchVenue";
import { cn } from "@/lib/utils";
import type { AdminMatchRow } from "@/components/admin/adminMatchTypes";

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

interface AdminMatchFixtureRowProps {
  m: AdminMatchRow;
  onEdit?: (m: AdminMatchRow) => void;
}

export const AdminMatchFixtureRow = ({ m, onEdit }: AdminMatchFixtureRowProps) => (
  <li>
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-1 shadow-sm transition-all duration-300",
        "hover:border-emerald-400/25 hover:shadow-md hover:shadow-black/20"
      )}
    >
      <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-gradient-to-b from-emerald-500 to-teal-600 opacity-90" />
      <div className="relative flex flex-col gap-4 rounded-xl bg-gradient-to-br from-white/[0.06] to-transparent p-4 pl-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-white/10 px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-white/60">
              #{m.matchNumber}
            </span>
            {m.isScored ? (
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-200">
                Scored
              </span>
            ) : (
              <span className="rounded-full border border-amber-400/30 bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-100">
                Pending
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-base font-semibold tracking-tight sm:text-lg">
            <span className="inline-flex items-center gap-2 text-white">
              <span
                className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-white/55"
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
            <span className="text-xs font-normal text-white/45">vs</span>
            <span className="inline-flex items-center gap-2 text-white">
              <span
                className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-white/55"
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

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/60 sm:text-sm">
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
              className="rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10"
              onClick={() => onEdit(m)}
            >
              <Pencil className="size-3.5" aria-hidden />
              Edit
            </Button>
          ) : null}
          <Link
            href={`/admin/matches/${m._id}/score`}
            className={cn(
              "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-100 transition-all",
              "hover:border-emerald-400/40 hover:bg-emerald-500/20 hover:text-white",
              "group-hover:border-emerald-400/35"
            )}
          >
            Score
            <ArrowUpRight className="size-4 opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  </li>
);
