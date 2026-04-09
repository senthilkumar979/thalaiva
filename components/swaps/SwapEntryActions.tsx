'use client'

import Link from 'next/link'
import { SwapCaptainControls } from '@/components/swaps/SwapCaptainControls'
import type { SwapEligibility } from '@/hooks/useSwapEligibility'

interface PlayerLite {
  _id: string
  name: string
  role: string
  franchise: {
    _id: string
    name: string
    shortCode: string
    logoUrl: string
  }
}

interface SwapEntryActionsProps {
  competitionId: string
  entry: Record<string, unknown> | null
  eligibility: SwapEligibility
  squad: PlayerLite[]
  newCaptainId: string
  newViceCaptainId: string
  onCaptainChange: (v: string) => void
  onViceChange: (v: string) => void
}

export const SwapEntryActions = ({
  competitionId,
  entry,
  eligibility,
  squad,
  newCaptainId,
  newViceCaptainId,
  onCaptainChange,
  onViceChange,
}: SwapEntryActionsProps) => (
  <>
    {!entry ? (
      <p className="rounded-xl border border-white/15 bg-white/5 px-4 py-6 text-center text-sm text-white/80">
        No team submitted.{' '}
        <Link
          href={`/competitions/${competitionId}/enter`}
          className="text-amber-200/90 underline"
        >
          Enter the competition
        </Link>
      </p>
    ) : null}

    {entry && eligibility.canSwap ? (
      <SwapCaptainControls
        squad={squad}
        leadershipChangeAvailable={eligibility.leadershipChangeAvailable}
        newCaptainId={newCaptainId}
        newViceCaptainId={newViceCaptainId}
        onCaptainChange={onCaptainChange}
        onViceChange={onViceChange}
      />
    ) : null}
  </>
)
