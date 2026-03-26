"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { CompetitionBreadcrumb } from "@/components/competitions/CompetitionBreadcrumb";
import { MatchRow } from "@/components/MatchRow";
import { useCompetitionName } from "@/hooks/useCompetitionName";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MatchRowData {
  match: {
    _id: string;
    matchNumber: number;
    date: string;
    venue: string;
  };
  totalPointsThisMatch: number;
  rankThisMatch: number;
  cumulative: number;
}

export default function MyTeamMatchesPage() {
  const params = useParams();
  const id = String(params.id);
  const { status } = useSession();
  const compName = useCompetitionName(id);
  const [rows, setRows] = useState<MatchRowData[]>([]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch(`/api/competitions/${id}/entries/me/matches`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setRows(data);
      })
      .catch(() => undefined);
  }, [id, status]);

  if (status === "unauthenticated") {
    return <p className="text-sm text-muted-foreground">Log in to view your team breakdown.</p>;
  }

  return (
    <div className="space-y-4">
      <CompetitionBreadcrumb
        variant="light"
        items={[
          { label: "Home", href: "/" },
          { label: "Competitions", href: "/competitions" },
          { label: compName ?? "League", href: `/competitions/${id}` },
          { label: "My team" },
        ]}
      />
      <div>
        <h1 className="text-2xl font-semibold">My team — matches</h1>
        <p className="text-muted-foreground">Points and ranks update after each scored match.</p>
      </div>
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
              competitionId={id}
              matchId={String(r.match._id)}
              label={`#${r.match.matchNumber} — ${new Date(r.match.date).toLocaleDateString()} @ ${r.match.venue}`}
              points={r.totalPointsThisMatch}
              rank={r.rankThisMatch}
              cumulative={r.cumulative}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
