"use client";

import Link from "next/link";
import { SwapCaptainControls } from "@/components/swaps/SwapCaptainControls";
import { SwapQueueDialog } from "@/components/swaps/SwapQueueDialog";
import { Button } from "@/components/ui/button";
import type { SwapEligibility } from "@/hooks/useSwapEligibility";

interface PlayerLite {
  _id: string;
  name: string;
}

interface SwapEntryActionsProps {
  competitionId: string;
  entry: Record<string, unknown> | null;
  eligibility: SwapEligibility;
  squad: PlayerLite[];
  dialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
  newCaptainId: string;
  newViceCaptainId: string;
  onCaptainChange: (v: string) => void;
  onViceChange: (v: string) => void;
  onSwapSuccess: () => void;
}

export const SwapEntryActions = ({
  competitionId,
  entry,
  eligibility,
  squad,
  dialogOpen,
  onDialogOpenChange,
  newCaptainId,
  newViceCaptainId,
  onCaptainChange,
  onViceChange,
  onSwapSuccess,
}: SwapEntryActionsProps) => (
  <>
    {!entry ? (
      <p className="rounded-xl border border-white/15 bg-white/5 px-4 py-6 text-center text-sm text-white/80">
        No team submitted.{" "}
        <Link href={`/competitions/${competitionId}/enter`} className="text-amber-200/90 underline">
          Enter the competition
        </Link>
      </p>
    ) : null}

    {entry && eligibility.canSwap ? (
      <>
        <SwapCaptainControls
          squad={squad}
          captainChangeAvailable={eligibility.captainChangeAvailable}
          viceCaptainChangeAvailable={eligibility.viceCaptainChangeAvailable}
          newCaptainId={newCaptainId}
          newViceCaptainId={newViceCaptainId}
          onCaptainChange={onCaptainChange}
          onViceChange={onViceChange}
        />
        <Button
          type="button"
          className="bg-amber-400 font-semibold text-[#0a2469] hover:bg-amber-300"
          onClick={() => onDialogOpenChange(true)}
        >
          Queue swaps
        </Button>
        <SwapQueueDialog
          open={dialogOpen}
          onOpenChange={onDialogOpenChange}
          competitionId={competitionId}
          entry={entry as never}
          eligibility={eligibility}
          newCaptainId={newCaptainId}
          newViceCaptainId={newViceCaptainId}
          onSuccess={onSwapSuccess}
        />
      </>
    ) : null}
  </>
);
