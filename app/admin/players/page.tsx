"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { FileSpreadsheet, Table2, Users } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
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
    <div className="space-y-8 sm:space-y-10">
      <AdminPageHeader
        accent="violet"
        segment="Admin · Roster"
        title="Player pool"
        description="Upload Excel (.xlsx) with columns Team Name, Player Name, Player Category, Value — or paste CSV for bulk import."
        icon={Users}
      />

      <Card className="overflow-hidden border-white/10 bg-white/[0.04] shadow-sm ring-1 ring-white/10">
        <CardHeader className="border-b border-white/10 bg-white/[0.04]">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg border border-white/15 bg-white/5">
              <FileSpreadsheet className="size-4 text-white/80" aria-hidden />
            </span>
            <div>
              <CardTitle className="text-lg text-white">Upload Excel (.xlsx)</CardTitle>
              <CardDescription className="text-white/65 [&_strong]:text-white/80">
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
            className="text-sm text-white/80 file:mr-3 file:rounded-md file:border-0 file:bg-white/15 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-white/25"
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

      <Card className="overflow-hidden border-white/10 bg-white/[0.04] shadow-sm ring-1 ring-white/10">
        <CardHeader className="border-b border-white/10 bg-white/[0.04]">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg border border-white/15 bg-white/5">
              <Table2 className="size-4 text-white/80" aria-hidden />
            </span>
            <div>
              <CardTitle className="text-lg text-white">Upload CSV (legacy)</CardTitle>
              <CardDescription className="text-white/65">
                Columns: name, franchise (short code), tier (1|3|5), role.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-6">
          <Textarea
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            rows={12}
            className="border-white/15 bg-white/5 font-mono text-xs text-white placeholder:text-white/40"
          />
          <Button
            type="button"
            onClick={uploadCsv}
            disabled={loading}
            className="border-white/20 bg-white/10 text-white hover:bg-white/15"
            variant="outline"
          >
            {loading ? "Uploading…" : "Upload CSV"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
