"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { CompetitionBreadcrumb } from "@/components/competitions/CompetitionBreadcrumb";
import { CompetitionDetailHero } from "@/components/competitions/CompetitionDetailHero";
import { CompetitionDetailLoading } from "@/components/competitions/CompetitionDetailLoading";
import { CompetitionDetailNotFound } from "@/components/competitions/CompetitionDetailNotFound";
import { CompetitionLeaderboardSection } from "@/components/competitions/CompetitionLeaderboardSection";
import { CompetitionMyTeamStrip } from "@/components/competitions/CompetitionMyTeamStrip";
import type { LeaderboardRow } from "@/components/LeaderboardTable";
import { Button } from "@/components/ui/button";

interface Competition {
  _id: string;
  name: string;
  description?: string;
  entryDeadline: string;
  participants?: unknown[];
}

interface MyEntry {
  totalScore: number;
  customTeamName: string;
}

export default function CompetitionDetailPage() {
  const params = useParams();
  const id = String(params.id);
  const { data: session } = useSession();
  const [comp, setComp] = useState<Competition | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [board, setBoard] = useState<LeaderboardRow[]>([]);
  const [mine, setMine] = useState<MyEntry | null>(null);
  const [myRank, setMyRank] = useState<number | null>(null);

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
            setComp(null);
          }
          return;
        }
        if (!cancelled) setComp(data as Competition);
      } catch {
        if (!cancelled) {
          setLoadError(true);
          setComp(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!comp) return;
    fetch(`/api/competitions/${id}/leaderboard`)
      .then((r) => r.json())
      .then((rows: LeaderboardRow[]) => {
        setBoard(Array.isArray(rows) ? rows : []);
        if (session?.user?.email) {
          const me = rows.find((x) => x.user?.email === session.user?.email);
          setMyRank(me?.rank ?? null);
        }
      })
      .catch(() => undefined);
  }, [id, comp, session?.user?.email]);

  useEffect(() => {
    if (!session?.user) {
      setMine(null);
      return;
    }
    fetch(`/api/competitions/${id}/entries/me`)
      .then((r) => (r.ok ? r.json() : null))
      .then((e) => setMine(e && e.customTeamName ? e : null))
      .catch(() => setMine(null));
  }, [id, session?.user]);

  if (loading) return <CompetitionDetailLoading />;
  if (loadError || !comp) return <CompetitionDetailNotFound />;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 text-white shadow-2xl">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0a1f4a] via-[#19398a] to-[#071229]"
        aria-hidden
      />
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-sky-500/12 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(100%,28rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="relative space-y-8 px-4 py-10 sm:px-8 sm:py-12">
        <CompetitionBreadcrumb
          variant="dark"
          items={[
            { label: "Home", href: "/" },
            { label: "Competitions", href: "/competitions" },
            { label: comp.name },
          ]}
        />

        <CompetitionDetailHero competition={comp} />

        {mine && (
          <CompetitionMyTeamStrip
            competitionId={id}
            teamName={mine.customTeamName}
            totalScore={mine.totalScore}
            rank={myRank}
          />
        )}

        <div className="flex flex-wrap gap-3">
          <Link href={`/competitions/${id}/enter`} className="inline-flex">
            <Button
              type="button"
              className="h-11 rounded-xl bg-white px-6 font-semibold text-[#19398a] shadow-lg hover:bg-white/90"
            >
              Enter / edit team
            </Button>
          </Link>
          <Link href={`/competitions/${id}/my-team`} className="inline-flex">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl border-white/25 bg-white/5 text-white hover:bg-white/10"
            >
              My team & matches
            </Button>
          </Link>
        </div>

        <CompetitionLeaderboardSection rows={board} highlightEmail={session?.user?.email ?? null} />
      </div>
    </div>
  );
}
