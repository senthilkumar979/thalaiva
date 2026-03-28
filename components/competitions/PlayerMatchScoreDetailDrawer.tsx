'use client'

import type {
  IBattingStats,
  IBowlingStats,
  IFieldingStats,
} from '@/models/PlayerMatchScore'
import { Dialog } from '@/components/ui/dialog'
import { FantasyDetailDialogShell } from '@/components/competitions/FantasyDetailDialogShell'
import { PlayerMatchScoreDetailPanel } from '@/components/competitions/PlayerMatchScoreDetailPanel'
import { FANTASY_SCORING_POINT_VALUES as P } from '@/lib/updatedScoring'

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
        <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
          <PlayerMatchScoreDetailPanel {...panel} />
          <p className="shrink-0 border-t border-white/10 px-5 py-3 text-xs leading-relaxed text-white/55">
            Totals here are match fantasy from stats only.{' '}
            <span className="text-white/70">
              Captain (×{P.CAPTAIN_MULTIPLIER}) and vice-captain (×{P.VICE_CAPTAIN_MULTIPLIER})
            </span>{' '}
            multiply your squad entry points for this player in this match — not shown in this view.{' '}
            <span className="text-white/70">Player of the match (+{P.PLAYER_OF_MATCH})</span> is added when this
            player is named in the official score.
          </p>
        </div>
      </FantasyDetailDialogShell>
    </Dialog>
  )
}
