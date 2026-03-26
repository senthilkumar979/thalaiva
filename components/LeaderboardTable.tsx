"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface LeaderboardRow {
  entryId: string;
  rank: number;
  totalScore: number;
  customTeamName: string;
  user: { name?: string; email?: string };
}

interface LeaderboardTableProps {
  rows: LeaderboardRow[];
  highlightEmail?: string | null;
  onTeamClick?: (row: LeaderboardRow) => void;
}

export const LeaderboardTable = ({
  rows,
  highlightEmail,
  onTeamClick,
}: LeaderboardTableProps) => (
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
        const interactive = Boolean(onTeamClick);
        return (
          <TableRow
            key={r.entryId}
            className={cn(
              isMe && "bg-muted/60",
              interactive && "cursor-pointer hover:bg-muted/80"
            )}
            onClick={interactive ? () => onTeamClick?.(r) : undefined}
            role={interactive ? "button" : undefined}
            tabIndex={interactive ? 0 : undefined}
            onKeyDown={
              interactive
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onTeamClick?.(r);
                    }
                  }
                : undefined
            }
          >
            <TableCell>{r.rank}</TableCell>
            <TableCell className="font-medium text-primary">{r.customTeamName}</TableCell>
            <TableCell className="text-muted-foreground">{r.user?.name ?? email}</TableCell>
            <TableCell className="text-right tabular-nums">{r.totalScore}</TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  </Table>
);
