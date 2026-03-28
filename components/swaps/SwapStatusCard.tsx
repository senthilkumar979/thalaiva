"use client";

import type { SwapEligibility } from "@/hooks/useSwapEligibility";

interface SwapStatusCardProps {
  eligibility: SwapEligibility;
}

export const SwapStatusCard = ({ eligibility }: SwapStatusCardProps) => (
  <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm text-white/80">
    <p className="font-medium text-white">Status</p>
    <ul className="mt-2 list-inside list-disc space-y-1">
      <li>Swaps remaining: {eligibility.swapsRemaining} / 6</li>
      <li>Swap window: {eligibility.swapWindowOpen ? "Open" : "Closed"}</li>
      <li>Entries: {eligibility.entriesClosed ? "Closed (swaps allowed)" : "Open"}</li>
      <li>Scored matches (global order): {eligibility.scoredMatches}</li>
      {!eligibility.canSwap && eligibility.reason ? (
        <li className="text-amber-200/90">Not available: {eligibility.reason}</li>
      ) : null}
    </ul>
  </section>
);
