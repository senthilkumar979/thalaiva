"use client";

import { AlertTriangle } from "lucide-react";
import type { SwapEligibility } from "@/hooks/useSwapEligibility";

interface SwapQueueRulesCalloutProps {
  eligibility: SwapEligibility;
}

export const SwapQueueRulesCallout = ({ eligibility }: SwapQueueRulesCalloutProps) => (
  <div className="mb-4 rounded-lg border-l-4 border-amber-400/80 bg-amber-500/[0.08] p-3">
    <div className="flex gap-2">
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-200" aria-hidden />
      <div className="space-y-1 text-xs leading-relaxed text-white/75">
        <p className="font-medium text-amber-100/95">Penalties (deducted from total score)</p>
        <ul className="list-inside list-disc space-y-0.5">
          <li>Slot 1 (tier 1 players): −50 each · max 2 swaps in this slot</li>
          <li>Slot 2 (tier 3 players): −100 each · max 2 swaps</li>
          <li>Slot 3 (tier 5 players): −200 each · max 2 swaps</li>
          <li>Change captain or vice-captain once per competition: −200 (set above the queue)</li>
        </ul>
        <p className="pt-1 text-white/55">
          Player swaps left:{" "}
          <span className="font-semibold tabular-nums text-white">{eligibility.swapsRemaining}</span> of
          6 · per tier: {eligibility.tierRemaining[1]} / {eligibility.tierRemaining[2]} /{" "}
          {eligibility.tierRemaining[3]}
        </p>
      </div>
    </div>
  </div>
);
