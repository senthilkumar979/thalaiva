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

export interface TeamSwapAuditRow {
  _id: string;
  createdAt?: string;
  recordKind?: string;
  tierSlot: number;
  effectiveFromMatchNumber: number;
  swapsRemainingAfter: number;
  penaltyPoints?: number;
  captainUpdated?: boolean;
  viceCaptainUpdated?: boolean;
  playerOut?: {
    name?: string;
    tier?: number;
    role?: string;
    franchise?: { name?: string; shortCode?: string; logoUrl?: string } | null;
  } | null;
  playerIn?: {
    name?: string;
    tier?: number;
    role?: string;
    franchise?: { name?: string; shortCode?: string; logoUrl?: string } | null;
  } | null;
  swapWindow?: { blockSequence?: number; openedAt?: string } | null;
}

function tierSlotLabel(slot: number, recordKind?: string): string {
  if (recordKind === "leadership" || slot === 0) return "Leadership";
  if (slot === 1) return "Slot 1 (tier 1)";
  if (slot === 2) return "Slot 2 (tier 3)";
  if (slot === 3) return "Slot 3 (tier 5)";
  return `Slot ${slot}`;
}

const TH_AUDIT = "text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45";

function PlayerCell({
  label,
  player,
  competition,
}: {
  label: string;
  player?: TeamSwapAuditRow["playerOut"];
  competition: boolean;
}) {
  if (!player?.name) {
    return (
      <div>
        <p
          className={cn(
            "text-[10px] font-medium uppercase tracking-wide",
            competition ? "text-white/45" : "text-muted-foreground"
          )}
        >
          {label}
        </p>
        <p className={cn("text-sm", competition ? "text-white/40" : "text-muted-foreground")}>—</p>
      </div>
    );
  }
  return (
    <div className="space-y-0.5">
      <p
        className={cn(
          "text-[10px] font-medium uppercase tracking-wide",
          competition ? "text-white/45" : "text-muted-foreground"
        )}
      >
        {label}
      </p>
      <p className={cn("text-sm font-medium", competition ? "text-white" : "text-foreground")}>
        {player.name}
      </p>
      <p className={cn("text-xs", competition ? "text-white/55" : "text-muted-foreground")}>
        {player.role ? `${player.role}` : ""}
        {player.role && player.tier != null ? " · " : ""}
        {player.tier != null ? `P-tier ${player.tier}` : ""}
        {player.franchise?.shortCode ? ` · ${player.franchise.shortCode}` : ""}
      </p>
    </div>
  );
}

export function totalPenaltyPointsDeducted(rows: TeamSwapAuditRow[]): number {
  const sum = rows.reduce((s, r) => s + (r.penaltyPoints ?? 0), 0);
  return Math.abs(sum);
}

interface TeamSwapAuditSectionProps {
  rows: TeamSwapAuditRow[];
  /** Hide section heading when used inside a tab or parent title. */
  showTitle?: boolean;
  /** Match competition detail / leaderboard dark glass UI. */
  appearance?: "default" | "competition";
}

export const TeamSwapAuditSection = ({
  rows,
  showTitle = true,
  appearance = "default",
}: TeamSwapAuditSectionProps) => {
  const competition = appearance === "competition";

  if (rows.length === 0) {
    return (
      <div
        className={cn(
          "rounded-xl border border-dashed px-4 py-10 text-center text-sm",
          competition
            ? "border-white/15 bg-white/[0.02] text-white/55"
            : "border-border/80 bg-muted/20 text-muted-foreground"
        )}
      >
        No player swaps or leadership changes recorded for this team yet.
      </div>
    );
  }

  const total = totalPenaltyPointsDeducted(rows);

  return (
    <div className="space-y-3">
      {showTitle ? (
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3
            className={cn("text-sm font-semibold", competition ? "text-white" : "text-foreground")}
          >
            Swaps & score penalties
          </h3>
          <p className={cn("text-sm", competition ? "text-white/60" : "text-muted-foreground")}>
            Total deducted from fantasy score:{" "}
            <span
              className={cn(
                "font-semibold tabular-nums",
                competition ? "text-amber-200/95" : "text-foreground"
              )}
            >
              {total}
            </span>{" "}
            pts
          </p>
        </div>
      ) : (
        <p className={cn("text-xs", competition ? "text-white/55" : "text-muted-foreground")}>
          Total deducted:{" "}
          <span
            className={cn(
              "font-semibold tabular-nums",
              competition ? "text-amber-200/95" : "text-foreground"
            )}
          >
            {total}
          </span>{" "}
          pts · Penalties reduce the team fantasy total; new players score from the listed match onward.
        </p>
      )}
      {showTitle ? (
        <p className={cn("text-xs", competition ? "text-white/45" : "text-muted-foreground")}>
          Each line is one change. Penalties are applied to the team&apos;s total score. New players earn
          points from the effective match onward.
        </p>
      ) : null}
      <div
        className={cn(
          "overflow-x-auto rounded-lg border",
          competition ? "border-white/10 bg-black/25 p-1 backdrop-blur-sm" : "border-border"
        )}
      >
        <Table className={cn(competition && "text-white")}>
          <TableHeader>
            <TableRow
              className={cn(
                "hover:bg-transparent",
                competition && "border-b border-white/10"
              )}
            >
              <TableHead className={cn(competition ? TH_AUDIT : "text-muted-foreground")}>When</TableHead>
              <TableHead className={cn(competition ? TH_AUDIT : "text-muted-foreground")}>Window</TableHead>
              <TableHead className={cn(competition ? TH_AUDIT : "text-muted-foreground")}>Type</TableHead>
              <TableHead className={cn(competition ? TH_AUDIT : "text-muted-foreground")}>Penalty</TableHead>
              <TableHead
                className={cn("min-w-[200px]", competition ? TH_AUDIT : "text-muted-foreground")}
              >
                Players
              </TableHead>
              <TableHead className={cn(competition ? TH_AUDIT : "text-muted-foreground")}>
                From match
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow
                key={r._id}
                className={cn(
                  competition && "border-b border-white/[0.06] last:border-0 hover:bg-white/[0.03]"
                )}
              >
                <TableCell
                  className={cn(
                    "align-top text-xs",
                    competition ? "text-white/85" : "text-foreground"
                  )}
                >
                  {r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}
                </TableCell>
                <TableCell
                  className={cn(
                    "align-top text-xs",
                    competition ? "text-white/50" : "text-muted-foreground"
                  )}
                >
                  Block {r.swapWindow?.blockSequence ?? "—"}
                </TableCell>
                <TableCell
                  className={cn(
                    "align-top text-xs",
                    competition ? "text-white/90" : "text-foreground"
                  )}
                >
                  {tierSlotLabel(r.tierSlot, r.recordKind)}
                </TableCell>
                <TableCell
                  className={cn(
                    "align-top tabular-nums text-sm",
                    competition ? "text-amber-200/90" : "text-foreground"
                  )}
                >
                  {r.penaltyPoints != null ? r.penaltyPoints : "—"}
                </TableCell>
                <TableCell className="align-top">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <PlayerCell label="Out" player={r.playerOut} competition={competition} />
                    <PlayerCell label="In" player={r.playerIn} competition={competition} />
                  </div>
                  {(r.captainUpdated || r.viceCaptainUpdated) && (
                    <p
                      className={cn(
                        "mt-2 text-[10px]",
                        competition ? "text-white/45" : "text-muted-foreground"
                      )}
                    >
                      {r.captainUpdated ? "Captain updated. " : ""}
                      {r.viceCaptainUpdated ? "Vice-captain updated." : ""}
                    </p>
                  )}
                </TableCell>
                <TableCell
                  className={cn(
                    "align-top tabular-nums text-xs",
                    competition ? "text-white/50" : "text-muted-foreground"
                  )}
                >
                  #{r.effectiveFromMatchNumber}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
