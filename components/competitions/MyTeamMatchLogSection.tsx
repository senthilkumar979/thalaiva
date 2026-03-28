import { MatchRow } from "@/components/MatchRow";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MyTeamMatchRow } from "@/hooks/useMyTeamPageData";
import { formatVenueLabel } from "@/lib/matchVenue";

interface MyTeamMatchLogSectionProps {
  competitionId: string;
  rows: MyTeamMatchRow[];
}

export const MyTeamMatchLogSection = ({ competitionId, rows }: MyTeamMatchLogSectionProps) => (
  <section className="space-y-3">
    <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">Match log</h2>
    {rows.length === 0 ? (
      <p className="rounded-xl border border-white/15 bg-white/5 px-4 py-8 text-center text-sm text-white/70">
        No scored matches yet — check back after the first result.
      </p>
    ) : (
      <div className="rounded-xl border border-white/15 bg-white p-3 text-slate-900 shadow-xl sm:p-5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Match</TableHead>
              <TableHead className="text-right">Pts</TableHead>
              <TableHead className="text-right">Rank</TableHead>
              <TableHead className="text-right">Cumulative</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <MatchRow
                key={String(r.match._id)}
                competitionId={competitionId}
                matchId={String(r.match._id)}
                label={`#${r.match.matchNumber} — ${new Date(r.match.date).toLocaleDateString()} @ ${formatVenueLabel(r.match.venue)}`}
                points={r.totalPointsThisMatch}
                rank={r.rankThisMatch}
                cumulative={r.cumulative}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    )}
  </section>
);
