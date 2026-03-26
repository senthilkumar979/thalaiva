"use client";

import {
  canConfirmPreview,
  type PlayerPreviewRow,
} from "@/lib/parseXlsxPlayers";
import { tierLabel } from "@/lib/playerExcelMap";
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
        <p className="text-sm text-muted-foreground">
          {rows.length} row{rows.length === 1 ? "" : "s"} parsed. Fix any issues before importing.
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isUploading}>
            Clear
          </Button>
          <Button type="button" onClick={onConfirm} disabled={!canSave || isUploading}>
            {isUploading ? "Importing…" : "Confirm import to database"}
          </Button>
        </div>
      </div>
      {!canSave && (
        <p className="text-sm text-amber-700 dark:text-amber-400">
          Resolve all row errors (or remove bad rows in Excel) before confirming.
        </p>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player Name</TableHead>
              <TableHead>Team Name</TableHead>
              <TableHead>Value → tier</TableHead>
              <TableHead>Player Category → role</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => {
              const ok = r.errors.length === 0 && r.tier !== null && r.role !== null;
              return (
                <TableRow key={`${r.name}-${r.franchise}-${i}`}>
                  <TableCell className="font-medium">{r.name || "—"}</TableCell>
                  <TableCell>{r.franchise || "—"}</TableCell>
                  <TableCell>{tierLabel(r.tier)}</TableCell>
                  <TableCell>{r.role ?? "—"}</TableCell>
                  <TableCell>
                    {ok ? (
                      <Badge variant="secondary">OK</Badge>
                    ) : (
                      <ul className="max-w-[240px] list-inside list-disc text-xs text-destructive">
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
