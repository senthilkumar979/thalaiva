"use client";

import {
  canConfirmPreview,
  type PlayerPreviewRow,
} from "@/lib/parseXlsxPlayers";
import { tierLabel } from "@/lib/playerExcelMap";
import { RoleIcon } from "@/components/RoleIcon";
import { playerRoleLabel } from "@/lib/playerRoleLabel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PlayersPreviewProps {
  rows: PlayerPreviewRow[];
  onConfirm: () => void;
  onCancel: () => void;
  isUploading: boolean;
}

export const PlayersPreview = ({ rows, onConfirm, onCancel, isUploading }: PlayersPreviewProps) => {
  const canSave = canConfirmPreview(rows);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-white/65">
          {rows.length} row{rows.length === 1 ? "" : "s"} parsed. Fix any issues before importing.
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="border-white/20 bg-white/5 text-white hover:bg-white/10"
            onClick={onCancel}
            disabled={isUploading}
          >
            Clear
          </Button>
          <Button
            type="button"
            className="bg-white text-[#0a1f4a] hover:bg-white/90"
            onClick={onConfirm}
            disabled={!canSave || isUploading}
          >
            {isUploading ? "Importing…" : "Confirm import to database"}
          </Button>
        </div>
      </div>
      {!canSave && (
        <p className="text-sm text-amber-200/90">
          Resolve all row errors (or remove bad rows in Excel) before confirming.
        </p>
      )}
      <div className="overflow-hidden rounded-md border border-white/15 bg-white/[0.03]">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white/70">Player Name</TableHead>
              <TableHead className="text-white/70">Team Name</TableHead>
              <TableHead className="text-white/70">Value → tier</TableHead>
              <TableHead className="text-white/70">Player Category → role</TableHead>
              <TableHead className="text-white/70">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => {
              const ok = r.errors.length === 0 && r.tier !== null && r.role !== null;
              return (
                <TableRow key={`${r.name}-${r.franchise}-${i}`} className="border-white/10 hover:bg-white/[0.04]">
                  <TableCell className="font-medium text-white">{r.name || "—"}</TableCell>
                  <TableCell className="text-white/85">{r.franchise || "—"}</TableCell>
                  <TableCell className="text-white/85">{tierLabel(r.tier)}</TableCell>
                  <TableCell className="text-white/85">
                    {r.role ? (
                      <span className="inline-flex items-center gap-2">
                        <RoleIcon role={r.role} size="sm" />
                        {playerRoleLabel(r.role)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-white/90">
                    {ok ? (
                      <Badge variant="secondary" className="border-white/15 bg-emerald-500/20 text-emerald-100">
                        OK
                      </Badge>
                    ) : (
                      <ul className="max-w-[240px] list-inside list-disc text-xs text-red-200">
                        {r.errors.map((e) => (
                          <li key={e}>{e}</li>
                        ))}
                      </ul>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
