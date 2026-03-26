"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface LeaderboardRow {
  rank: number;
  totalScore: number;
  customTeamName: string;
  user: { name?: string; email?: string };
}

interface LeaderboardTableProps {
  rows: LeaderboardRow[];
  highlightEmail?: string | null;
}

export const LeaderboardTable = ({ rows, highlightEmail }: LeaderboardTableProps) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="w-16">#</TableHead>
        <TableHead>Team</TableHead>
        <TableHead>User</TableHead>
        <TableHead className="text-right">Pts</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {rows.map((r) => {
        const email = r.user?.email ?? "";
        const isMe = highlightEmail && email === highlightEmail;
        return (
          <TableRow key={`${r.rank}-${email}-${r.customTeamName}`} className={isMe ? "bg-muted/60" : ""}>
            <TableCell>{r.rank}</TableCell>
            <TableCell className="font-medium">{r.customTeamName}</TableCell>
            <TableCell className="text-muted-foreground">{r.user?.name ?? email}</TableCell>
            <TableCell className="text-right tabular-nums">{r.totalScore}</TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  </Table>
);
