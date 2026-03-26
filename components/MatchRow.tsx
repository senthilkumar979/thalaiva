"use client";

import Link from "next/link";
import { TableCell, TableRow } from "@/components/ui/table";

interface MatchRowProps {
  competitionId: string;
  matchId: string;
  label: string;
  points: number;
  rank: number;
  cumulative: number;
}

export const MatchRow = ({ competitionId, matchId, label, points, rank, cumulative }: MatchRowProps) => (
  <TableRow>
    <TableCell>
      <Link href={`/competitions/${competitionId}/my-team/matches/${matchId}`} className="text-primary hover:underline">
        {label}
      </Link>
    </TableCell>
    <TableCell className="text-right tabular-nums">{points}</TableCell>
    <TableCell className="text-right tabular-nums">{rank}</TableCell>
    <TableCell className="text-right tabular-nums">{cumulative}</TableCell>
  </TableRow>
);
