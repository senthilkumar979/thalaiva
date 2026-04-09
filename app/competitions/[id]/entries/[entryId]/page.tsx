'use client'

import { CompetitionBreadcrumb } from '@/components/competitions/CompetitionBreadcrumb'
import { CompetitionEntryTeamView } from '@/components/competitions/CompetitionEntryTeamView'
import { CompetitionSubpageShell } from '@/components/competitions/CompetitionSubpageShell'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function CompetitionEntryTeamPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const competitionId = String(params.id)
  const entryId = String(params.entryId)
  const [compName, setCompName] = useState<string | null>(null)
  const [loadError, setLoadError] = useState(false)

  const initialFantasy = searchParams.get('fantasy')
  const initialName = searchParams.get('name')
  const rank = searchParams.get('rank')
  const initialTotalFantasyPoints =
    initialFantasy != null && initialFantasy !== ''
      ? Number(initialFantasy)
      : undefined
  const initialTeamName =
    initialName != null && initialName !== '' ? initialName : undefined

  useEffect(() => {
    let cancelled = false
    fetch(`/api/competitions/${competitionId}`)
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error('bad')
        return data as { name?: string }
      })
      .then((data) => {
        if (!cancelled && data?.name) setCompName(data.name)
      })
      .catch(() => {
        if (!cancelled) setLoadError(true)
      })
    return () => {
      cancelled = true
    }
  }, [competitionId])

  if (loadError) {
    return (
      <CompetitionSubpageShell>
        <p className="text-center text-white/80">Competition not found.</p>
        <Link
          href="/competitions"
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'mt-4 inline-flex border-white/25',
          )}
        >
          Back to competitions
        </Link>
      </CompetitionSubpageShell>
    )
  }

  return (
    <CompetitionSubpageShell>
      <div className="space-y-6">
        <CompetitionBreadcrumb
          variant="dark"
          items={[
            { label: 'Home', href: '/' },
            { label: 'Competitions', href: '/competitions' },
            {
              label: compName ?? '…',
              href: `/competitions/${competitionId}`,
            },
            { label: 'Team squad' },
          ]}
        />

        <div>
          <Link
            href={`/competitions/${competitionId}`}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'mb-4 inline-flex border-white/25 bg-white/5 text-white hover:bg-white/10',
            )}
          >
            <ArrowLeft className="mr-2 size-4" aria-hidden />
            Back to competition
          </Link>

          {!compName ? (
            <div className="flex min-h-[40vh] items-center justify-center text-white/80">
              <Loader2 className="size-8 animate-spin" />
            </div>
          ) : (
            <CompetitionEntryTeamView
              competitionId={competitionId}
              entryId={entryId}
              initialTeamName={initialTeamName}
              initialTotalFantasyPoints={initialTotalFantasyPoints}
              rank={rank ? Number(rank) : undefined}
            />
          )}
        </div>
      </div>
    </CompetitionSubpageShell>
  )
}
