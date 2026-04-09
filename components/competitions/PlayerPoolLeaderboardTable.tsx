"use client";

import { RoleIcon } from "@/components/RoleIcon";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { PlayerLeaderboardRow } from "@/lib/playerPoolLeaderboard";

const TH = "text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45";

const ROLE_LABEL: Record<string, string> = {
  bat: "Batter",
  bowl: "Bowler",
  allrounder: "All-rounder",
  wk: "WK",
};

function TierBadge({ tier }: { tier: number }) {
  if (tier === 1)
    return (
      <span className="inline-flex rounded-full border border-amber-400/30 bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-100">
        T1
      </span>
    );
  if (tier === 3)
    return (
      <span className="inline-flex rounded-full border border-sky-400/30 bg-sky-500/15 px-2 py-0.5 text-[11px] font-semibold text-sky-100">
        T3
      </span>
    );
  return (
    <span className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-100">
      T5
    </span>
  );
}

interface PlayerPoolLeaderboardTableProps {
  rows: PlayerLeaderboardRow[];
  onRowClick?: (row: PlayerLeaderboardRow) => void;
}

export const PlayerPoolLeaderboardTable = ({ rows, onRowClick }: PlayerPoolLeaderboardTableProps) => (
  <div className="overflow-x-auto rounded-lg">
    <Table className="text-white">
      <TableHeader>
        <TableRow className="border-b border-white/10 hover:bg-transparent">
          <TableHead className={cn("w-14", TH)}>#</TableHead>
          <TableHead className={TH}>Player</TableHead>
          <TableHead className={TH}>Team</TableHead>
          <TableHead className={TH}>Role</TableHead>
          <TableHead className={TH}>Tier</TableHead>
          <TableHead className={cn("text-right", TH)}>Pts</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r, i) => (
          <TableRow
            key={r._id}
            tabIndex={onRowClick ? 0 : undefined}
            aria-label={onRowClick ? `View match scores for ${r.name}` : undefined}
            onClick={() => onRowClick?.(r)}
            onKeyDown={(e) => {
              if (!onRowClick) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onRowClick(r);
              }
            }}
            className={cn(
              "border-b border-white/[0.06] last:border-0",
              onRowClick
                ? "cursor-pointer hover:bg-white/[0.06] focus-visible:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/35"
                : "hover:bg-white/[0.03]"
            )}
          >
            <TableCell className="tabular-nums text-white/50">{i + 1}</TableCell>
            <TableCell className="font-medium text-white">{r.name}</TableCell>
            <TableCell>
              <span className="inline-flex min-w-0 items-center gap-2">
                {r.franchise?.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.franchise.logoUrl}
                    alt=""
                    width={22}
                    height={22}
                    className="size-5 shrink-0 rounded object-contain"
                  />
                ) : (
                  <span className="flex size-5 shrink-0 items-center justify-center rounded bg-white/10 text-[9px] font-bold text-white/70">
                    {r.franchise?.shortCode?.slice(0, 2) ?? "—"}
                  </span>
                )}
                <span className="truncate text-white/90">{r.franchise?.name ?? "—"}</span>
              </span>
            </TableCell>
            <TableCell>
              <span className="inline-flex items-center gap-2 capitalize text-white/75">
                <RoleIcon role={r.role} size="sm" />
                {ROLE_LABEL[r.role] ?? r.role}
              </span>
            </TableCell>
            <TableCell>
              <TierBadge tier={r.tier} />
            </TableCell>
            <TableCell className="text-right font-semibold tabular-nums text-amber-200/95">
              {r.totalFantasyPoints.toLocaleString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);
