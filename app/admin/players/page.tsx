"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { FileSpreadsheet, Table2 } from "lucide-react";
import { PlayersPreview } from "./PlayersPreview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  parseXlsxToPlayerPreviewRows,
  previewRowsToBulkPayload,
  type PlayerPreviewRow,
} from "@/lib/parseXlsxPlayers";

export default function AdminPlayersPage() {
  const [csv, setCsv] = useState("name,franchise,tier,role");
  const [loading, setLoading] = useState(false);
  const [previewRows, setPreviewRows] = useState<PlayerPreviewRow[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadCsv = async () => {
    setLoading(true);
    const res = await fetch("/api/players/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv }),
    });
    setLoading(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(data.error ?? "Upload failed");
      return;
    }
    toast.success(`Imported ${data.created} players`);
  };

  const onXlsx = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const buf = await file.arrayBuffer();
      const rows = parseXlsxToPlayerPreviewRows(buf);
      setPreviewRows(rows);
      toast.success(`Loaded ${rows.length} rows from ${file.name}`);
    } catch (err) {
      toast.error((err as Error).message ?? "Could not read Excel file");
      setPreviewRows(null);
    }
    e.target.value = "";
  };

  const confirmXlsx = async () => {
    if (!previewRows) return;
    const payload = previewRowsToBulkPayload(previewRows);
    if (!payload.length) {
      toast.error("No valid rows to import");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/players/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows: payload }),
    });
    setLoading(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(data.error ?? "Upload failed");
      return;
    }
    toast.success(`Imported ${data.created} players`);
    setPreviewRows(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clearPreview = () => {
    setPreviewRows(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Player pool</h1>
        <p className="max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          Upload Excel (.xlsx) with columns Team Name, Player Name, Player Category, Value — or paste CSV for
          bulk import.
        </p>
      </div>

      <Card className="overflow-hidden border-border/80 shadow-sm">
        <CardHeader className="border-b border-border/60 bg-muted/25">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg border border-border bg-background">
              <FileSpreadsheet className="size-4 text-foreground/80" aria-hidden />
            </span>
            <div>
              <CardTitle className="text-lg">Upload Excel (.xlsx)</CardTitle>
              <CardDescription>
                <strong>Value</strong>: Good → 1 pt, Super → 3 pt, Excellent → 5 pt.{" "}
                <strong>Player Category</strong> maps to bat / bowl / wk / allrounder.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-6">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
            onChange={onXlsx}
          />
          {previewRows && (
            <PlayersPreview
              rows={previewRows}
              onConfirm={confirmXlsx}
              onCancel={clearPreview}
              isUploading={loading}
            />
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border/80 shadow-sm">
        <CardHeader className="border-b border-border/60 bg-muted/25">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg border border-border bg-background">
              <Table2 className="size-4 text-foreground/80" aria-hidden />
            </span>
            <div>
              <CardTitle className="text-lg">Upload CSV (legacy)</CardTitle>
              <CardDescription>Columns: name, franchise (short code), tier (1|3|5), role.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-6">
          <Textarea value={csv} onChange={(e) => setCsv(e.target.value)} rows={12} className="font-mono text-xs" />
          <Button type="button" onClick={uploadCsv} disabled={loading}>
            {loading ? "Uploading…" : "Upload CSV"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
