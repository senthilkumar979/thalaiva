'use client'

import { CompetitionBreadcrumb } from '@/components/competitions/CompetitionBreadcrumb'
import { CompetitionSubpageShell } from '@/components/competitions/CompetitionSubpageShell'
import { SwapAuditTable } from '@/components/swaps/SwapAuditTable'
import { SwapEntryActions } from '@/components/swaps/SwapEntryActions'
import { SwapQueueBoard } from '@/components/swaps/SwapQueueDialog'
import { SwapStatusCard } from '@/components/swaps/SwapStatusCard'
import type { SwapEligibility } from '@/hooks/useSwapEligibility'
import { useSwapEligibility } from '@/hooks/useSwapEligibility'
import { useSwapQueue, type SwapQueueEntry } from '@/hooks/useSwapQueue'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

interface SwapPageClientProps {
  competitionId: string
}

function SwapPageContent({
  competitionId,
  eligibility,
  refetchEligibility,
}: {
  competitionId: string
  eligibility: SwapEligibility
  refetchEligibility: () => void
}) {
  const [entry, setEntry] = useState<Record<string, unknown> | null>(null)
  const [auditRows, setAuditRows] = useState<unknown[]>([])
  const [compName, setCompName] = useState<string>('League')
  const [newCaptainId, setNewCaptainId] = useState('')
  const [newViceCaptainId, setNewViceCaptainId] = useState('')

  const refresh = useCallback(() => {
    fetch(`/api/competitions/${competitionId}/entries/me`)
      .then((r) => r.json())
      .then((j) => setEntry(j))
      .catch(() => setEntry(null))
    fetch(`/api/competitions/${competitionId}/swap/audit`)
      .then((r) => r.json())
      .then((j) => setAuditRows(Array.isArray(j.rows) ? j.rows : []))
      .catch(() => setAuditRows([]))
  }, [competitionId])

  useEffect(() => {
    fetch(`/api/competitions/${competitionId}`)
      .then((r) => r.json())
      .then((c) => {
        if (c?.name) setCompName(String(c.name))
      })
      .catch(() => {})
  }, [competitionId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const swapQueue = useSwapQueue({
    competitionId,
    entry: entry as SwapQueueEntry | null,
    eligibility,
    newCaptainId,
    newViceCaptainId,
    onSuccess: () => {
      refresh()
      refetchEligibility()
    },
  })

  return (
    <CompetitionSubpageShell>
      <div className="space-y-8">
        <CompetitionBreadcrumb
          variant="dark"
          items={[
            { label: 'Home', href: '/' },
            { label: 'Competitions', href: '/competitions' },
            { label: compName, href: `/competitions/${competitionId}` },
            {
              label: 'My team',
              href: `/competitions/${competitionId}/my-team`,
            },
            { label: 'Player swaps' },
          ]}
        />

        <header className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Player swaps
          </h1>
          <p className="max-w-2xl text-sm text-white/65">
            Same-tier swaps only: up to six player changes per competition (two
            per squad tier slot), with score penalties per swap. You may change
            captain once (−500 pts) or vice-captain once (−300 pts). New picks count from the
            next match in schedule order. History is below per window.
          </p>
        </header>

        <SwapStatusCard eligibility={eligibility} />

        <SwapEntryActions
          competitionId={competitionId}
          entry={entry}
          eligibility={eligibility}
          squad={swapQueue.effectiveSquadForLeadership}
          newCaptainId={newCaptainId}
          newViceCaptainId={newViceCaptainId}
          onCaptainChange={(v) => {
            setNewCaptainId(v)
            if (v) setNewViceCaptainId('')
          }}
          onViceChange={(v) => {
            setNewViceCaptainId(v)
            if (v) setNewCaptainId('')
          }}
        />

        {entry && eligibility.canSwap ? (
          <SwapQueueBoard swapQueue={swapQueue} />
        ) : null}

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Audit log</h2>
          <SwapAuditTable rows={auditRows as never} />
        </section>

        <Link
          href={`/competitions/${competitionId}/my-team`}
          className="inline-block text-sm font-medium text-amber-200/90 underline-offset-4 hover:underline"
        >
          ← Back to my team
        </Link>
      </div>
    </CompetitionSubpageShell>
  )
}

export const SwapPageClient = ({ competitionId }: SwapPageClientProps) => {
  const {
    data: eligibility,
    loading: elLoading,
    error: elError,
    refetch: refetchEligibility,
  } = useSwapEligibility(competitionId)

  if (elLoading || !eligibility) {
    return (
      <CompetitionSubpageShell>
        <div className="flex min-h-[40vh] items-center justify-center text-white/80">
          <Loader2 className="size-8 animate-spin" />
        </div>
      </CompetitionSubpageShell>
    )
  }

  if (elError) {
    return (
      <CompetitionSubpageShell>
        <p className="py-12 text-center text-sm text-red-300">{elError}</p>
      </CompetitionSubpageShell>
    )
  }

  return (
    <SwapPageContent
      competitionId={competitionId}
      eligibility={eligibility}
      refetchEligibility={refetchEligibility}
    />
  )
}
