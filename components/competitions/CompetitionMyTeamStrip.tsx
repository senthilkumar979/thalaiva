"use client";

import Link from "next/link";
import { BarChart3, Crown, Shuffle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CompetitionMyTeamStripProps {
  competitionId: string;
  teamName: string;
  totalScore: number;
  rank: number | null;
  /** When true, show shortcut to edit squad while entries are open. */
  entriesOpen?: boolean;
  /** After entries close — link to player swap flow (optional). */
  swapsHref?: string;
}

export const CompetitionMyTeamStrip = ({
  competitionId,
  teamName,
  totalScore,
  rank,
  entriesOpen = false,
  swapsHref,
}: CompetitionMyTeamStripProps) => (
  <section className="relative overflow-hidden rounded-2xl border border-amber-400/25 bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent p-[1px] shadow-lg">
    <div className="rounded-[15px] bg-[#0a2469]/40 px-5 py-5 backdrop-blur-md sm:px-6 sm:py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400/20 ring-1 ring-amber-400/35">
            <Crown className="size-6 text-amber-200" />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200/70">Your squad</p>
            <p className="mt-0.5 text-lg font-semibold tracking-tight text-white">{teamName}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-6 sm:gap-8">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-white/45">Total points</p>
            <p className="mt-0.5 flex items-baseline gap-1.5 text-3xl font-bold tabular-nums tracking-tight text-white">
              <TrendingUp className="size-5 text-emerald-400/90" />
              {totalScore}
            </p>
          </div>
          {rank != null && (
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-white/45">Rank</p>
              <p className="mt-0.5 text-3xl font-bold tabular-nums text-amber-200">#{rank}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {entriesOpen && (
              <Link href={`/competitions/${competitionId}/my-team?edit=1`} className="inline-flex">
                <Button
                  type="button"
                  size="sm"
                  className="gap-2 bg-white font-semibold text-[#19398a] hover:bg-white/90"
                >
                  Edit squad
                </Button>
              </Link>
            )}
            <Link href={`/competitions/${competitionId}/my-team`} className="inline-flex">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-2 border-white/25 bg-white/10 text-white hover:bg-white/15"
              >
                <BarChart3 className="size-4" />
                Match breakdown
              </Button>
            </Link>
            {swapsHref ? (
              <Link href={swapsHref} className="inline-flex">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="gap-2 border-amber-400/35 bg-amber-500/10 text-amber-100 hover:bg-amber-500/15"
                >
                  <Shuffle className="size-4" />
                  Player swaps
                </Button>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  </section>
);
