import { CalendarDays, ClipboardList, MapPin } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
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

export const AdminScoreMatchPageHero = ({ loading, match }: AdminScoreMatchPageHeroProps) => {
  const footer =
    loading ? (
      <div className="h-20 animate-pulse rounded-xl bg-white/10" aria-hidden />
    ) : match ? (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-base font-semibold tracking-tight text-white sm:text-lg">
          <span className="inline-flex items-center gap-2">
            <AdminScoreTeamLogo logoUrl={match.franchiseA.logoUrl} shortCode={match.franchiseA.shortCode} />
            {match.franchiseA.shortCode}
          </span>
          <span className="text-sm font-normal text-white/50">vs</span>
          <span className="inline-flex items-center gap-2">
            <AdminScoreTeamLogo logoUrl={match.franchiseB.logoUrl} shortCode={match.franchiseB.shortCode} />
            {match.franchiseB.shortCode}
          </span>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/70">
          {match.matchNumber != null ? (
            <span className="font-mono text-xs font-semibold uppercase tracking-wide text-white/90">
              Match #{match.matchNumber}
            </span>
          ) : null}
          {match.date ? (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5 shrink-0 text-amber-300/85" aria-hidden />
              {formatMatchDate(match.date)}
            </span>
          ) : null}
          {match.venue ? (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0 opacity-80" aria-hidden />
              {formatVenueLabel(match.venue)}
            </span>
          ) : null}
        </div>
      </div>
    ) : null;

  return (
    <AdminPageHeader
      accent="emerald"
      segment="Admin · Match scoring"
      title="Record fantasy stats"
      description="Per-fixture data entry for both squads. Point math matches Scoring rules on each competition — playing XI (including Impact Player), then batting, bowling, and fielding."
      icon={ClipboardList}
      footer={footer}
    />
  );
};
