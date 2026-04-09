import { Sparkles } from 'lucide-react'
import type {
  IBattingStats,
  IBowlingStats,
  IFieldingStats,
} from '@/models/PlayerMatchScore'
import { DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { PlayerScoreIdentityBlock } from '@/components/PlayerScoreIdentityBlock'
import { cn } from '@/lib/utils'
import {
  getPlayerMatchFantasyPointsBreakdown,
  groupBreakdownBySection,
} from '@/lib/scoring'
import {
  FantasySectionCard,
  RawBlock,
  RawDl,
} from '@/components/competitions/playerMatchFantasyDetailBlocks'

export interface PlayerMatchScoreDetailPanelProps {
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
  /** Aligns with `Match.playerOfMatch` when the player was in the XI. */
  isPlayerOfMatch?: boolean
}

export const PlayerMatchScoreDetailPanel = ({
  playerName,
  matchTitle,
  franchiseShortCode,
  franchiseLogoUrl,
  franchiseName,
  role,
  Batting,
  Bowling,
  Fielding,
  participated,
  isPlayerOfMatch = false,
}: PlayerMatchScoreDetailPanelProps) => {
  const { total, breakdown } = getPlayerMatchFantasyPointsBreakdown(
    { Batting, Bowling, Fielding },
    participated,
    isPlayerOfMatch,
  )
  const grouped = groupBreakdownBySection(breakdown)

  return (
    <>
      <DialogHeader className="relative z-10 shrink-0 space-y-3 border-b border-white/10 px-5 py-5 text-left">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white/55">
            <Sparkles className="size-3 text-amber-300/90" aria-hidden />
            Fantasy
          </span>
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1',
              participated
                ? 'bg-emerald-500/15 text-emerald-200 ring-emerald-400/25'
                : 'bg-white/10 text-white/45 ring-white/15',
            )}
          >
            {participated ? 'Played in XI' : 'Bench / DNP'}
          </span>
        </div>
        <div className="space-y-1">
          <DialogTitle className="text-xl font-bold leading-tight tracking-tight text-white">
            {playerName}
          </DialogTitle>
          <p className="text-sm font-normal leading-snug text-white/65">
            {matchTitle}
          </p>
        </div>
        <PlayerScoreIdentityBlock
          franchiseShortCode={franchiseShortCode}
          franchiseLogoUrl={franchiseLogoUrl}
          franchiseLine={franchiseName}
          role={role}
        />
      </DialogHeader>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col space-y-5 overflow-y-auto px-5 py-5 text-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
          Raw stats
        </p>

        <RawBlock title="Batting">
          <RawDl
            items={[
              { label: 'Runs', value: Batting.runs },
              { label: 'Balls', value: Batting.ballsFaced },
              {
                label: '4s / 6s',
                value: (
                  <>
                    {Batting.fours} / {Batting.sixes}
                  </>
                ),
              },
              { label: 'Out', value: Batting.isOut ? 'Yes' : 'No' },
            ]}
          />
        </RawBlock>

        <RawBlock title="Bowling">
          <RawDl
            items={[
              { label: 'Wickets', value: Bowling.wickets },
              { label: 'Overs', value: Bowling.oversBowled },
              { label: 'Runs conc.', value: Bowling.runsConceded },
              {
                label: 'Maidens / Dots',
                value: (
                  <>
                    {Bowling.maidenOvers} / {Bowling.dotBalls}
                  </>
                ),
              },
            ]}
          />
        </RawBlock>

        <RawBlock title="Fielding">
          <RawDl
            items={[
              { label: 'Catches', value: Fielding.catches },
              { label: 'Stumpings', value: Fielding.stumpings },
              { label: 'Run-outs', value: Fielding.runOuts },
            ]}
          />
        </RawBlock>

        <p className="pt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
          Fantasy points
        </p>

        <FantasySectionCard
          title="Batting"
          rows={grouped.batting}
          accent="amber"
        />
        <FantasySectionCard
          title="Bowling"
          rows={grouped.bowling}
          accent="sky"
        />
        <FantasySectionCard
          title="Fielding"
          rows={grouped.fielding}
          accent="emerald"
        />

        {grouped.participation.length > 0 ? (
          <FantasySectionCard
            title="Match bonuses"
            rows={grouped.participation}
            accent="violet"
          />
        ) : null}

        <div className="flex items-center justify-between rounded-xl border border-emerald-400/25 bg-emerald-500/15 px-4 py-3 font-semibold tabular-nums text-emerald-100 shadow-inner shadow-black/20">
          <span>Total fantasy</span>
          <span className="text-lg">{total}</span>
        </div>
      </div>
    </>
  )
}
