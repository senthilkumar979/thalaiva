'use client'

import Link from 'next/link'
import { CompetitionBreadcrumb } from '@/components/competitions/CompetitionBreadcrumb'
import { CompetitionScoringRulesContent } from '@/components/competitions/CompetitionScoringRulesContent'
import { CompetitionSubpageShell } from '@/components/competitions/CompetitionSubpageShell'
import { useCompetitionName } from '@/hooks/useCompetitionName'

interface CompetitionScoringRulesViewProps {
  competitionId: string
}

export const CompetitionScoringRulesView = ({
  competitionId,
}: CompetitionScoringRulesViewProps) => {
  const compName = useCompetitionName(competitionId) ?? 'League'

  return (
    <CompetitionSubpageShell>
      <div className="space-y-8">
        <CompetitionBreadcrumb
          variant="dark"
          items={[
            { label: 'Home', href: '/' },
            { label: 'Competitions', href: '/competitions' },
            { label: compName, href: `/competitions/${competitionId}` },
            { label: 'Scoring rules' },
          ]}
        />

        <header className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="h-1 w-12 rounded-full bg-gradient-to-r from-amber-300 to-amber-500/40" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">
              Fantasy points
            </span>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Scoring rules
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-white/65">
              Point values and bonuses for this competition.
            </p>
          </div>
        </header>

        <CompetitionScoringRulesContent />

        <Link
          href={`/competitions/${competitionId}`}
          className="inline-block text-sm font-medium text-amber-200/90 underline-offset-4 hover:underline"
        >
          ← Back to competition
        </Link>
      </div>
    </CompetitionSubpageShell>
  )
}
