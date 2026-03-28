'use client'

import type {
  IBattingStats,
  IBowlingStats,
  IFieldingStats,
} from '@/models/PlayerMatchScore'
import { Dialog } from '@/components/ui/dialog'
import { FantasyDetailDialogShell } from '@/components/competitions/FantasyDetailDialogShell'
import { PlayerMatchScoreDetailPanel } from '@/components/competitions/PlayerMatchScoreDetailPanel'

interface PlayerMatchScoreDetailDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  playerName: string
  matchTitle: string
  franchiseShortCode: string
  franchiseLogoUrl?: string
  franchiseName?: string
  role: string
  Batting: IBattingStats
  Bowling: IBowlingStats
  Fielding: IFieldingStats
  participated: boolean
}

export const PlayerMatchScoreDetailDrawer = (
  props: PlayerMatchScoreDetailDrawerProps,
) => {
  const { open, onOpenChange, ...panel } = props
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FantasyDetailDialogShell>
        <PlayerMatchScoreDetailPanel {...panel} />
      </FantasyDetailDialogShell>
    </Dialog>
  )
}
