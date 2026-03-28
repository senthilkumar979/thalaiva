"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ExternalLink, Loader2, Trophy } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
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

  if (status === "loading") {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-white/50" aria-hidden />
      </div>
    );
  }

  if (status === "unauthenticated" || session?.user?.role !== "admin") {
    return <p className="text-white/70">Admin access only.</p>;
  }

  return (
    <div className="space-y-8 sm:space-y-10">
      <AdminPageHeader
        accent="amber"
        segment="Admin · Leagues"
        title="Competitions"
        description="Open a league to freeze entries or edit details — the same controls are available on each competition page. Mirrors the public competition hub, in admin context."
        icon={Trophy}
      />

      {error ? (
        <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/[0.04]">
          <Loader2 className="size-8 animate-spin text-white/50" aria-hidden />
        </div>
      ) : (
        <div className="grid gap-4">
          {rows.map((c) => (
            <Card
              key={c._id}
              className="border-white/10 bg-white/[0.04] shadow-sm ring-1 ring-white/10 transition-shadow hover:border-white/15 hover:shadow-lg hover:shadow-black/15"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-white">{c.name}</CardTitle>
                <CardDescription className="text-white/65">
                  Deadline: {new Date(c.entryDeadline).toLocaleString()}
                  {c.entriesFrozen ? " · Entries frozen" : ""}
                  {!c.isActive ? " · Inactive" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/competitions/${c._id}`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-sky-200 underline-offset-4 hover:text-white hover:underline"
                >
                  Open competition
                  <ExternalLink className="size-3.5 opacity-70" aria-hidden />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && rows.length === 0 && !error ? (
        <p className="rounded-xl border border-dashed border-white/20 px-4 py-10 text-center text-sm text-white/65">
          No competitions yet.
        </p>
      ) : null}
    </div>
  );
}
