"use client";

import { SwapQueueConfirmDialog } from "@/components/swaps/SwapQueueConfirmDialog";
import { SwapQueueRulesCallout } from "@/components/swaps/SwapQueueRulesCallout";
import {
  labelForPlayerId,
  type PlayerOptionNorm,
} from "@/components/swaps/swapSelectLabels";
import { SwapTierColumn } from "@/components/swaps/SwapTierColumn";
import { Button } from "@/components/ui/button";
import type { SwapEligibility } from "@/hooks/useSwapEligibility";
import { useSwapQueue, type SwapQueueEntry } from "@/hooks/useSwapQueue";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

interface SwapQueueBoardProps {
  competitionId: string;
  entry: SwapQueueEntry;
  eligibility: SwapEligibility;
  squad: PlayerOptionNorm[];
  newCaptainId: string;
  newViceCaptainId: string;
  onSuccess: () => void;
}

export const SwapQueueBoard = ({
  competitionId,
  entry,
  eligibility,
  squad,
  newCaptainId,
  newViceCaptainId,
  onSuccess,
}: SwapQueueBoardProps) => {
  const q = useSwapQueue({
    competitionId,
    entry,
    eligibility,
    newCaptainId,
    newViceCaptainId,
    onSuccess,
  });
  const [confirmOpen, setConfirmOpen] = useState(false);

  const leadershipSummary = useMemo(() => {
    if (newCaptainId?.trim()) {
      return `Change captain to ${labelForPlayerId(newCaptainId, squad) ?? "selected player"}`;
    }
    if (newViceCaptainId?.trim()) {
      return `Change vice-captain to ${labelForPlayerId(newViceCaptainId, squad) ?? "selected player"}`;
    }
    return null;
  }, [newCaptainId, newViceCaptainId, squad]);

  const handleReviewClick = async () => {
    const ok = await q.validateForConfirm();
    if (ok) setConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    const ok = await q.submitAll();
    if (ok) setConfirmOpen(false);
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white">Player swaps</h2>
        <p className="mt-1 text-sm text-white/55">
          Use one column per squad tier. Add swaps to the queue, then submit. New picks count from{" "}
          {q.nextLabel}.
        </p>
      </div>

      <SwapQueueRulesCallout eligibility={eligibility} />

      {q.error && <div className="bg-red-500/20 p-3 rounded-lg border border-red-500/50">
        <p className="text-sm text-red-500 font-bold">{q.error}</p> </div>}

      <div className="grid gap-4 lg:grid-cols-3">
        {([1, 2, 3] as const).map((slot) => {
          const rows = q.pendingWithIndex.filter((x) => x.row.tierSlot === slot);
          const queuedInTier = q.pending.filter((p) => p.tierSlot === slot).length;
          const swapsLeftInTier = eligibility.tierRemaining[slot] - queuedInTier;
          return (
            <SwapTierColumn
              key={slot}
              tierSlot={slot}
              squadNorm={q.squadNormByTier[slot]}
              poolFiltered={q.poolFilteredByTier[slot]}
              loadingPools={q.loadingPools}
              playerOutId={q.draft[slot].out}
              playerInId={q.draft[slot].in}
              onPlayerOutChange={(id) => q.setDraftTier(slot, "out", id)}
              onPlayerInChange={(id) => q.setDraftTier(slot, "in", id)}
              onAddToQueue={() => q.addToQueueForTier(slot)}
              swapsLeftInTier={Math.max(0, swapsLeftInTier)}
              queuedInTier={queuedInTier}
              rows={rows}
              onRemovePending={q.removePending}
            />
          );
        })}
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-[#050f28] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-white/45">Total penalty if you submit</p>
          <p className="text-3xl font-semibold tabular-nums text-amber-200">
            {q.penaltyPreview === 0 ? "0" : q.penaltyPreview}
            <span className="text-sm font-normal text-white/50"> pts</span>
          </p>
          <p className="mt-1 text-xs text-white/45">
            Player swaps: {q.playerPenaltyTotal}
            {q.hasLeadership ? ` · Leadership: ${q.leadershipPenalty}` : ""}
          </p>
        </div>
        <Button
          type="button"
          className="bg-amber-400 font-semibold text-[#0a2469] hover:bg-amber-300 sm:min-w-[200px]"
          disabled={
            q.submitting ||
            q.validating ||
            (q.pending.length === 0 && !q.hasLeadership)
          }
          onClick={handleReviewClick}
        >
          {q.submitting || q.validating ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Review & submit"
          )}
        </Button>
      </div>

      <SwapQueueConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        pending={q.pending}
        leadershipSummary={leadershipSummary}
        leadershipPenalty={q.leadershipPenalty}
        playerPenaltyTotal={q.playerPenaltyTotal}
        totalPenalty={q.penaltyPreview}
        nextLabel={q.nextLabel}
        submitting={q.submitting}
        onConfirm={handleConfirmSubmit}
      />
    </section>
  );
};

/** @deprecated Use {@link SwapQueueBoard} — swaps are inline on the page. */
export const SwapQueueDialog = SwapQueueBoard;
