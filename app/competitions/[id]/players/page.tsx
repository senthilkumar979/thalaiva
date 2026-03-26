"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { CompetitionBreadcrumb } from "@/components/competitions/CompetitionBreadcrumb";
import {
  SubmittedPlayersTable,
  type SubmittedPlayerRow,
} from "@/components/competitions/SubmittedPlayersTable";

const THEME_BG = "#19398a";

export default function CompetitionSubmittedPlayersPage() {
  const params = useParams();
  const id = String(params.id);
  const { data: session } = useSession();
  const [compName, setCompName] = useState<string | null>(null);
  const [entriesFrozen, setEntriesFrozen] = useState<boolean | undefined>(undefined);
  const [rows, setRows] = useState<SubmittedPlayerRow[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [playersError, setPlayersError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(false);
      setPlayersError(null);
      try {
        const cRes = await fetch(`/api/competitions/${id}`);
        const cData = await cRes.json();
        if (!cRes.ok) {
          if (!cancelled) {
            setLoadError(true);
            setCompName(null);
          }
          return;
        }
        if (!cancelled) {
          setCompName((cData as { name: string }).name);
          setEntriesFrozen((cData as { entriesFrozen?: boolean }).entriesFrozen);
        }

        const pRes = await fetch(`/api/competitions/${id}/submitted-players`);
        const pData = await pRes.json();
        if (!cancelled) {
          if (pRes.status === 401) {
            setPlayersError("log_in");
            setRows([]);
          } else if (pRes.ok && Array.isArray(pData)) {
            setRows(pData as SubmittedPlayerRow[]);
          } else {
            setRows([]);
          }
        }
      } catch {
        if (!cancelled) {
          setLoadError(true);
          setCompName(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const isAdmin = session?.user?.role === "admin";
  const revealAllSquads = entriesFrozen === true || isAdmin;

  const shell = (children: React.ReactNode) => (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/10 px-2 py-8 text-white shadow-2xl sm:px-8 sm:py-10"
      style={{ backgroundColor: THEME_BG }}
    >
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-[#0c1f5c]/80 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(100%,28rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      <div className="relative mx-auto max-w-6xl">{children}</div>
    </div>
  );

  if (loading) {
    return shell(
      <div className="flex min-h-[40vh] items-center justify-center text-white/80">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  if (loadError || !compName) {
    return shell(
      <p className="py-12 text-center text-sm text-white/80">Competition not found.</p>
    );
  }

  return shell(
    <div className="space-y-8">
      <CompetitionBreadcrumb
        variant="dark"
        items={[
          { label: "Home", href: "/" },
          { label: "Competitions", href: "/competitions" },
          { label: compName, href: `/competitions/${id}` },
          { label: revealAllSquads ? "Submitted players" : "My squad" },
        ]}
      />
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {revealAllSquads ? "Submitted players" : "My squad"}
        </h1>
        <p className="text-sm text-white/65">
          {revealAllSquads
            ? "All picks across teams — points from scored matches in this competition (0 if none yet)."
            : "Your picks only — other squads stay hidden until an admin freezes entries."}
        </p>
      </header>

      {playersError === "log_in" ? (
        <p className="rounded-xl border border-white/15 bg-white/5 px-4 py-8 text-center text-sm text-white/80">
          Log in to view your squad for this competition.
        </p>
      ) : rows.length === 0 ? (
        <p className="rounded-xl border border-white/15 bg-white/5 px-4 py-8 text-center text-sm text-white/70">
          No squad data yet.
        </p>
      ) : (
        <div className="rounded-xl border border-white/15 bg-white p-3 text-slate-900 shadow-xl sm:p-5">
          <SubmittedPlayersTable rows={rows} variant={revealAllSquads ? "full" : "entryOnly"} />
        </div>
      )}

      <Link
        href={`/competitions/${id}`}
        className="inline-block text-sm font-medium text-amber-200/90 underline-offset-4 hover:underline"
      >
        ← Back to competition
      </Link>
    </div>
  );
}
