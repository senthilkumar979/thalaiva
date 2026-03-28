import Link from "next/link";
import { AdminScoreTeamLogo } from "@/components/admin/AdminScoreTeamLogo";
import { Badge } from "@/components/ui/badge";
import { formatVenueLabel } from "@/lib/matchVenue";

interface FranchiseLite {
  _id: string;
  name: string;
  shortCode: string;
  logoUrl?: string;
}

interface CompetitionMatchListCardProps {
  competitionId: string;
  match: {
    _id: string;
    matchNumber: number;
    date: string;
    venue: string;
    isScored: boolean;
  };
  franchiseA: FranchiseLite;
  franchiseB: FranchiseLite;
}

export const CompetitionMatchListCard = ({
  competitionId,
  match,
  franchiseA,
  franchiseB,
}: CompetitionMatchListCardProps) => {
  const href = `/competitions/${competitionId}/matches/${match._id}`;
  return (
    <Link
      href={href}
      className="flex w-full items-stretch gap-3 rounded-2xl border border-white/15 bg-white/[0.05] p-4 shadow-lg ring-1 ring-white/10 transition-colors hover:bg-white/[0.08] sm:gap-5 sm:p-5"
    >
      <div className="flex shrink-0 items-center">
        <AdminScoreTeamLogo
          logoUrl={franchiseA.logoUrl}
          shortCode={franchiseA.shortCode}
          size="lg"
          className="ring-white/25 bg-white/10 !text-white"
        />
      </div>

      <div className="min-w-0 flex flex-1 flex-col justify-center gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-lg font-bold tabular-nums text-white sm:text-xl">Match #{match.matchNumber}</span>
          {match.isScored ? (
            <Badge className="border-emerald-400/30 bg-emerald-500/20 text-emerald-100">Scored</Badge>
          ) : (
            <Badge variant="secondary" className="border-white/20 bg-white/10 text-white/80">
              Not scored
            </Badge>
          )}
        </div>
        <p className="text-sm font-medium text-white/90">
          {franchiseA.shortCode} <span className="text-white/45">vs</span> {franchiseB.shortCode}
        </p>
        <p className="text-xs text-white/50 sm:text-sm">
          {new Date(match.date).toLocaleDateString()} · {formatVenueLabel(match.venue)}
        </p>
        <p className="pt-1 text-xs font-medium text-amber-200/90 sm:text-sm">View match →</p>
      </div>

      <div className="flex shrink-0 items-center">
        <AdminScoreTeamLogo
          logoUrl={franchiseB.logoUrl}
          shortCode={franchiseB.shortCode}
          size="lg"
          className="ring-white/25 bg-white/10 !text-white"
        />
      </div>
    </Link>
  );
};
