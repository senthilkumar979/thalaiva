"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PendingSwapRow } from "@/components/swaps/swapPendingTypes";
import { playerSwapPenaltyForTierSlot } from "@/lib/swapPenaltyRules";

interface SwapQueueConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pending: PendingSwapRow[];
  leadershipSummary: string | null;
  leadershipPenalty: number;
  playerPenaltyTotal: number;
  totalPenalty: number;
  nextLabel: string;
  submitting: boolean;
  onConfirm: () => void;
}

export const SwapQueueConfirmDialog = ({
  open,
  onOpenChange,
  pending,
  leadershipSummary,
  leadershipPenalty,
  playerPenaltyTotal,
  totalPenalty,
  nextLabel,
  submitting,
  onConfirm,
}: SwapQueueConfirmDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[85vh] overflow-y-auto border-white/15 bg-[#071a45] text-white sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Confirm swap request</DialogTitle>
        <DialogDescription className="text-white/60">
          This will update your squad and deduct points from your total score. New player points apply
          from {nextLabel}.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-3 text-sm">
        {pending.length > 0 ? (
          <div>
            <p className="mb-1.5 font-medium text-white/90">Player swaps</p>
            <ul className="space-y-1.5 rounded-lg border border-white/10 bg-black/20 p-3 text-xs">
              {pending.map((s, i) => (
                <li key={`${s.playerOutId}-${s.playerInId}-${i}`} className="flex justify-between gap-2">
                  <span className="text-white/85">
                    Slot {s.tierSlot}: {s.playerOutName} → {s.playerInName}
                  </span>
                  <span className="shrink-0 tabular-nums text-amber-200/90">
                    {playerSwapPenaltyForTierSlot(s.tierSlot)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-white/50">
              Subtotal (player swaps): <span className="tabular-nums text-white/80">{playerPenaltyTotal}</span>
            </p>
          </div>
        ) : null}
        {leadershipSummary ? (
          <div className="rounded-lg border border-violet-400/30 bg-violet-500/10 px-3 py-2 text-xs">
            <p className="font-medium text-violet-100/95">Leadership</p>
            <p className="text-white/80">{leadershipSummary}</p>
            <p className="mt-1 tabular-nums text-amber-200/90">{leadershipPenalty} pts</p>
          </div>
        ) : null}
        <div className="border-t border-white/10 pt-3">
          <p className="text-xs text-white/50">Total deduction from your score</p>
          <p className="text-2xl font-semibold tabular-nums text-amber-200">{totalPenalty} pts</p>
        </div>
      </div>
      <DialogFooter className="gap-2 sm:justify-end">
        <Button type="button" variant="outline" className="border-white/25 text-black hover:text-slate-500" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          type="button"
          className="bg-amber-400 font-semibold text-[#0a2469] hover:bg-amber-300"
          disabled={submitting}
          onClick={onConfirm}
        >
          {submitting ? <Loader2 className="size-4 animate-spin" /> : "Confirm & save"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
