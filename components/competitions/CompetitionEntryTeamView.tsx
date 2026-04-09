'use client'

import { TeamPlayersDialogHero } from '@/components/competitions/TeamPlayersDialogHero'
import { TeamPlayersDialogLoading } from '@/components/competitions/TeamPlayersDialogLoading'
import { TeamPlayersDialogTabs } from '@/components/competitions/TeamPlayersDialogTabs'
import { useCompetitionEntryTeamData } from '@/hooks/useCompetitionEntryTeamData'
import { cn } from '@/lib/utils'
import { TeamPlayerStats } from './TeamPlayerStats'

interface CompetitionEntryTeamViewProps {
  competitionId: string
  entryId: string
  /** From URL or leaderboard click; leaderboard fetch may override. */
  initialTeamName?: string | null
  initialTotalFantasyPoints?: number
  rank?: number
}

export const CompetitionEntryTeamView = ({
  competitionId,
  entryId,
  initialTeamName,
  rank,
  initialTotalFantasyPoints,
}: CompetitionEntryTeamViewProps) => {
  const {
    rows,
    swapRows,
    loading,
    displayName,
    competitionTotalFantasyPoints,
    penaltyTotal,
  } = useCompetitionEntryTeamData(
    competitionId,
    entryId,
    initialTeamName,
    initialTotalFantasyPoints,
  )

  return (
    <div
      className={cn(
        'flex min-h-0 w-full flex-col gap-0 overflow-hidden',
        'rounded-xl border border-white/15 bg-blue-950/[10] text-white shadow-2xl ring-1 ring-white/10 sm:rounded-2xl',
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <TeamPlayersDialogHero
          displayName={displayName}
          penaltyTotal={penaltyTotal}
          totalFantasyPoints={competitionTotalFantasyPoints}
          rank={rank}
        />
        {!loading ? (
          <TeamPlayerStats
            squadCount={rows.length}
            transferCount={swapRows.length}
            penaltyTotal={penaltyTotal}
            competitionTotalFantasyPoints={competitionTotalFantasyPoints}
          />
        ) : null}
        {loading ? (
          <TeamPlayersDialogLoading />
        ) : (
          <TeamPlayersDialogTabs rows={rows} swapRows={swapRows} />
        )}
      </div>
    </div>
  )
}
