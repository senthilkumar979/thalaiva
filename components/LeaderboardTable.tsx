"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LeaderboardRankBadge } from "@/components/LeaderboardRankBadge";
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
  /** Dark glass styling for competition detail pages */
  variant?: "default" | "competition";
}

const HEADER_COMP =
  "text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45";

export const LeaderboardTable = ({
  rows,
  highlightEmail,
  onTeamClick,
  variant = "default",
}: LeaderboardTableProps) => {
  const competition = variant === "competition";
  const headers = competition
    ? (["Rank", "Team", "Manager", "Pts"] as const)
    : (["#", "Team", "User", "Pts"] as const);
  const thClass = (i: number) =>
    cn(
      i === 0 && "w-20",
      i === 3 && "text-right",
      competition && HEADER_COMP
    );

  return (
    <Table
      className={cn(
        "w-full min-w-[18rem] sm:min-w-0",
        competition && "text-white",
      )}
    >
      <TableHeader>
        <TableRow
          className={cn(
            "border-0 hover:bg-transparent",
            competition ? "border-b border-white/10" : "border-b"
          )}
        >
          {headers.map((label, i) => (
            <TableHead key={label} className={thClass(i)}>
              {label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => {
          const email = r.user?.email ?? "";
          const isMe = Boolean(highlightEmail && email === highlightEmail);
          const interactive = Boolean(onTeamClick);
          return (
            <TableRow
              key={r.entryId}
              className={cn(
                "border-0 transition-colors",
                competition && "border-b border-white/[0.06] last:border-0",
                !competition && isMe && "bg-muted/60",
                competition && isMe && "bg-amber-500/[0.12] ring-1 ring-inset ring-amber-400/25",
                interactive && !competition && "cursor-pointer hover:bg-muted/80",
                interactive && competition && "cursor-pointer hover:bg-white/[0.06]"
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
              <TableCell className="py-3 align-middle">
                <LeaderboardRankBadge rank={r.rank} competition={competition} />
              </TableCell>
              <TableCell
                className={cn(
                  "py-3 align-middle font-semibold",
                  competition ? "text-white" : "font-medium text-primary"
                )}
              >
                {r.customTeamName}
              </TableCell>
              <TableCell
                className={cn(
                  "py-3 align-middle text-sm",
                  competition ? "text-white/65" : "text-muted-foreground"
                )}
              >
                {r.user?.name ?? email}
              </TableCell>
              <TableCell
                className={cn(
                  "py-3 text-right align-middle tabular-nums",
                  competition && "font-semibold text-amber-200/95"
                )}
              >
                {r.totalScore}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
