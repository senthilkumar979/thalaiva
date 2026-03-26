"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export default function AdminPlayersPage() {
  const [csv, setCsv] = useState("name,franchise,tier,role");
  const [loading, setLoading] = useState(false);

  const upload = async () => {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Player pool</h1>
        <p className="text-muted-foreground">CSV columns: name, franchise (short code), tier (1|3|5), role.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Upload CSV</CardTitle>
          <CardDescription>Franchise must match a seeded IPL short code (e.g. CSK).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea value={csv} onChange={(e) => setCsv(e.target.value)} rows={12} className="font-mono text-xs" />
          <Button type="button" onClick={upload} disabled={loading}>
            {loading ? "Uploading…" : "Upload"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
