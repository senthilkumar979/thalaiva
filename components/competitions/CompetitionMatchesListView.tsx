"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { CompetitionBreadcrumb } from "@/components/competitions/CompetitionBreadcrumb";
import { CompetitionMatchListCard } from "@/components/competitions/CompetitionMatchListCard";
import { CompetitionSubpageShell } from "@/components/competitions/CompetitionSubpageShell";

interface FranchiseLite {
  _id: string;
  name: string;
  shortCode: string;
  logoUrl?: string;
}

interface MatchListItem {
  match: {
    _id: string;
    matchNumber: number;
    date: string;
    venue: string;
    isScored: boolean;
  };
  franchiseA: FranchiseLite;
  franchiseB: FranchiseLite;
}

interface ApiList {
  competition: { _id: string; name: string };
  matches: MatchListItem[];
}

interface CompetitionMatchesListViewProps {
  competitionId: string;
}

export const CompetitionMatchesListView = ({ competitionId }: CompetitionMatchesListViewProps) => {
  const [data, setData] = useState<ApiList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetch(`/api/competitions/${competitionId}/matches`)
      .then(async (r) => {
        if (!r.ok) throw new Error("bad");
        return r.json() as Promise<ApiList>;
      })
      .then((j) => {
        if (!cancelled) setData(j);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [competitionId]);

  const compName = data?.competition.name ?? "League";

  if (loading) {
    return (
      <CompetitionSubpageShell>
        <div className="flex min-h-[40vh] items-center justify-center text-white/80">
          <Loader2 className="size-8 animate-spin" />
        </div>
      </CompetitionSubpageShell>
    );
  }

  if (error || !data) {
    return (
      <CompetitionSubpageShell>
        <p className="py-12 text-center text-sm text-white/80">Could not load matches.</p>
      </CompetitionSubpageShell>
    );
  }

  return (
    <CompetitionSubpageShell>
      <div className="mx-auto max-w-3xl space-y-8">
        <CompetitionBreadcrumb
          variant="dark"
          items={[
            { label: "Home", href: "/" },
            { label: "Competitions", href: "/competitions" },
            { label: compName, href: `/competitions/${competitionId}` },
            { label: "Matches" },
          ]}
        />

        <header className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="h-1 w-12 rounded-full bg-gradient-to-r from-amber-300 to-amber-500/40" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">Fixtures</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">All matches</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-white/65">
              Ordered by match number. Open a fixture for scoreboard, highlights, and player breakdowns.
            </p>
          </div>
        </header>

        {data.matches.length === 0 ? (
          <p className="rounded-xl border border-white/15 bg-white/5 px-4 py-10 text-center text-sm text-white/70">
            No matches scheduled yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {data.matches.map((item) => (
              <li key={item.match._id}>
                <CompetitionMatchListCard
                  competitionId={competitionId}
                  match={item.match}
                  franchiseA={item.franchiseA}
                  franchiseB={item.franchiseB}
                />
              </li>
            ))}
          </ul>
        )}

        <Link
          href={`/competitions/${competitionId}`}
          className="inline-block text-sm font-medium text-amber-200/90 underline-offset-4 hover:underline"
        >
          ← Back to competition
        </Link>
      </div>
    </CompetitionSubpageShell>
  );
};
