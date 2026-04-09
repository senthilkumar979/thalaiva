"use client";

import { Clock, Shield, Sparkles, Trophy } from "lucide-react";
import type { SwapEligibility } from "@/hooks/useSwapEligibility";

interface SwapStatusCardProps {
  eligibility: SwapEligibility;
}

export const SwapStatusCard = ({ eligibility }: SwapStatusCardProps) => {
  const windowOpen = eligibility.swapWindowOpen && eligibility.activeSwapWindowId;
  const canAct = eligibility.canSwap;

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0c2d7a]/90 to-[#061a47]/95 shadow-lg shadow-black/20">
      <div className="border-b border-white/10 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-amber-200/80">Swap window</p>
            <p className="mt-0.5 text-lg font-semibold text-white">
              {windowOpen ? "Open" : "Closed"}
            </p>
          </div>
          <div
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              canAct
                ? "bg-emerald-500/20 text-emerald-200"
                : "bg-white/10 text-white/60"
            }`}
          >
            {canAct ? "You can make changes" : "Changes blocked"}
          </div>
        </div>
        {!canAct && eligibility.reason ? (
          <p className="mt-3 text-sm text-amber-200/90">{eligibility.reason}</p>
        ) : null}
      </div>

      <div className="grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex gap-3 bg-[#0a2469]/80 p-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-amber-200">
            <Sparkles className="size-5" aria-hidden />
          </div>
          <div>
            <p className="text-xs text-white/55">Player swaps left</p>
            <p className="text-xl font-semibold tabular-nums text-white">
              {eligibility.swapsRemaining}
              <span className="text-sm font-normal text-white/45"> / 6</span>
            </p>
            <p className="mt-1 text-[11px] leading-snug text-white/45">
              Per slot: {eligibility.tierRemaining[1]} · {eligibility.tierRemaining[2]} ·{" "}
              {eligibility.tierRemaining[3]}
            </p>
          </div>
        </div>

        <div className="flex gap-3 bg-[#0a2469]/80 p-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-400/15 text-violet-200">
            <Shield className="size-5" aria-hidden />
          </div>
          <div>
            <p className="text-xs text-white/55">Captain / vice change</p>
            <p className="text-sm font-medium text-white">
              {eligibility.leadershipChangeAvailable ? "Available once (−200)" : "Already used"}
            </p>
          </div>
        </div>

        <div className="flex gap-3 bg-[#0a2469]/80 p-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-400/15 text-sky-200">
            <Trophy className="size-5" aria-hidden />
          </div>
          <div>
            <p className="text-xs text-white/55">Total score</p>
            <p className="text-xl font-semibold tabular-nums text-white">{eligibility.totalScore}</p>
            <p className="mt-0.5 text-[11px] text-white/45">Includes swap penalties</p>
          </div>
        </div>

        <div className="flex gap-3 bg-[#0a2469]/80 p-4 sm:col-span-2 lg:col-span-1">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white/80">
            <Clock className="size-5" aria-hidden />
          </div>
          <div>
            <p className="text-xs text-white/55">Schedule</p>
            <p className="text-sm text-white/85">
              {eligibility.entriesClosed ? "Entries closed" : "Entries open"} ·{" "}
              <span className="tabular-nums">{eligibility.scoredMatches}</span> matches scored
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
