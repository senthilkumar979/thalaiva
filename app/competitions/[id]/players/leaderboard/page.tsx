"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2, Trophy } from "lucide-react";
import { CompetitionBreadcrumb } from "@/components/competitions/CompetitionBreadcrumb";
import { CompetitionPlayerPoolLeaderboard } from "@/components/competitions/CompetitionPlayerPoolLeaderboard";

const THEME_SHELL = "relative overflow-hidden rounded-2xl border border-white/10 text-white shadow-2xl";

export default function CompetitionPlayerPoolLeaderboardPage() {
  const params = useParams();
  const id = String(params.id);
  const [compName, setCompName] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const res = await fetch(`/api/competitions/${id}`);
        const data = await res.json();
        if (!res.ok) {
          if (!cancelled) {
            setLoadError(true);
            setCompName(null);
          }
          return;
        }
        if (!cancelled) setCompName((data as { name: string }).name);
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

  const shell = (children: ReactNode) => (
    <div className={THEME_SHELL}>
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0a1f4a] via-[#19398a] to-[#071229]"
        aria-hidden
      />
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-sky-500/12 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(100%,28rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="relative space-y-10 px-4 py-10 sm:px-8 sm:py-12">
        <div className="mx-auto max-w-5xl">{children}</div>
      </div>
    </div>
  );

  if (loading) {
    return shell(
      <div className="flex min-h-[40vh] items-center justify-center text-white/80">
        <Loader2 className="size-8 animate-spin" aria-hidden />
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
          { label: "Player points" },
        ]}
      />

      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">
          <Trophy className="size-3.5 text-amber-300/90" aria-hidden />
          Player pool
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Fantasy points leaderboard</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-white/60 sm:text-base">
          Every active IPL player in the pool, ranked by total fantasy points from scored matches. Narrow the
          list by franchise, role, or draft tier, then sort by name or points.
        </p>
      </header>

      <CompetitionPlayerPoolLeaderboard competitionId={id} />

      <Link
        href={`/competitions/${id}`}
        className="inline-block text-sm font-medium text-amber-200/90 underline-offset-4 hover:underline"
      >
        ← Back to competition
      </Link>
    </div>
  );
}
