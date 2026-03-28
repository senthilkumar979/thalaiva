"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AuditRow {
  _id: string;
  createdAt?: string;
  tierSlot: number;
  effectiveFromMatchNumber: number;
  swapsRemainingAfter: number;
  captainUpdated?: boolean;
  viceCaptainUpdated?: boolean;
  playerOut: { name?: string } | null;
  playerIn: { name?: string } | null;
  swapWindow?: { blockSequence?: number; openedAt?: string } | null;
}

interface SwapAuditTableProps {
  rows: AuditRow[];
}

export const SwapAuditTable = ({ rows }: SwapAuditTableProps) => {
  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-white/15 px-4 py-8 text-center text-sm text-white/60">
        No swaps recorded yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <Table>
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-transparent">
            <TableHead className="text-white/70">When</TableHead>
            <TableHead className="text-white/70">Window</TableHead>
            <TableHead className="text-white/70">Tier</TableHead>
            <TableHead className="text-white/70">Out → In</TableHead>
            <TableHead className="text-white/70">From match #</TableHead>
            <TableHead className="text-white/70">Swaps left</TableHead>
            <TableHead className="text-white/70">C / VC</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r._id} className="border-white/10">
              <TableCell className="text-white/90">
                {r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}
              </TableCell>
              <TableCell className="text-white/80">
                Block {r.swapWindow?.blockSequence ?? "—"}
              </TableCell>
              <TableCell className="text-white/80">{r.tierSlot}</TableCell>
              <TableCell className="text-white/90">
                {r.playerOut?.name ?? "?"} → {r.playerIn?.name ?? "?"}
              </TableCell>
              <TableCell className="tabular-nums text-white/80">{r.effectiveFromMatchNumber}</TableCell>
              <TableCell className="tabular-nums text-white/80">{r.swapsRemainingAfter}</TableCell>
              <TableCell className="text-xs text-white/70">
                {r.captainUpdated ? "C " : ""}
                {r.viceCaptainUpdated ? "VC" : ""}
                {!r.captainUpdated && !r.viceCaptainUpdated ? "—" : ""}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
