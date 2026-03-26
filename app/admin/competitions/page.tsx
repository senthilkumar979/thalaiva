"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ExternalLink, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminCompetition {
  _id: string;
  name: string;
  entryDeadline: string;
  entriesFrozen?: boolean;
  isActive: boolean;
}

export default function AdminCompetitionsPage() {
  const { data: session, status } = useSession();
  const [rows, setRows] = useState<AdminCompetition[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated" || session?.user?.role !== "admin") {
      setLoading(false);
      return;
    }
    fetch("/api/admin/competitions")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError((data as { error?: string }).error ?? "Failed to load");
          setRows([]);
          return;
        }
        setRows(Array.isArray(data) ? data : []);
        setError(null);
      })
      .catch(() => {
        setError("Failed to load");
        setRows([]);
      })
      .finally(() => setLoading(false));
  }, [status, session?.user?.role]);

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status === "unauthenticated" || session?.user?.role !== "admin") {
    return <p className="text-muted-foreground">Admin access only.</p>;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Competitions</h1>
        <p className="max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          Open a league to freeze entries or edit details — the same controls are available on each competition
          page.
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="grid gap-4">
        {rows.map((c) => (
          <Card key={c._id} className="border-border/80 shadow-sm transition-shadow hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{c.name}</CardTitle>
              <CardDescription>
                Deadline: {new Date(c.entryDeadline).toLocaleString()}
                {c.entriesFrozen ? " · Entries frozen" : ""}
                {!c.isActive ? " · Inactive" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href={`/competitions/${c._id}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Open competition
                <ExternalLink className="size-3.5 opacity-70" aria-hidden />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {rows.length === 0 && !error && (
        <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
          No competitions yet.
        </p>
      )}
    </div>
  );
}
