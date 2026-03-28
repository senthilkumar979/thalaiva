'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import {
  usePathname,
  useParams,
  useRouter,
  useSearchParams,
} from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { CompetitionBreadcrumb } from '@/components/competitions/CompetitionBreadcrumb'
import { CompetitionMyTeamStrip } from '@/components/competitions/CompetitionMyTeamStrip'
import { CompetitionSubpageShell } from '@/components/competitions/CompetitionSubpageShell'
import { MyTeamMatchLogSection } from '@/components/competitions/MyTeamMatchLogSection'
import { MyTeamPlayerMatchDrawer } from '@/components/competitions/MyTeamPlayerMatchDrawer'
import { TeamBuilder } from '@/components/TeamBuilder'
import { Button } from '@/components/ui/button'
import { useMyTeamPageData } from '@/hooks/useMyTeamPageData'
import { areCompetitionEntriesClosed } from '@/lib/competitionEntryGate'

export default function MyTeamMatchesPage() {
  const params = useParams()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = String(params.id)
  const editParam = searchParams.get('edit') === '1'
  const playerFromQuery = searchParams.get('player')
  const matchFromQuery = searchParams.get('match')
  const playerDrawerOpen = Boolean(playerFromQuery && matchFromQuery)

  const closePlayerDrawer = () => {
    const next = new URLSearchParams(searchParams.toString())
    next.delete('player')
    next.delete('match')
    const q = next.toString()
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false })
  }
  const {
    rows,
    matchesLoading,
    comp,
    myEntry,
    myRank,
    ready,
    loadError,
    status,
  } = useMyTeamPageData(id)

  const entriesClosed =
    comp != null
      ? areCompetitionEntriesClosed(comp.entriesFrozen, comp.entryDeadline)
      : false

  useEffect(() => {
    if (!editParam || !entriesClosed) return
    router.replace(`/competitions/${id}/my-team`)
  }, [editParam, entriesClosed, id, router])

  if (status === 'loading' || (status === 'authenticated' && !ready)) {
    return (
      <CompetitionSubpageShell>
        <div className="flex min-h-[40vh] items-center justify-center text-white/80">
          <Loader2 className="size-8 animate-spin" />
        </div>
      </CompetitionSubpageShell>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <CompetitionSubpageShell>
        <p className="py-12 text-center text-sm text-white/85">
          Log in to view your team breakdown and match-by-match points.
        </p>
      </CompetitionSubpageShell>
    )
  }

  if (loadError || !comp) {
    return (
      <CompetitionSubpageShell>
        <p className="py-12 text-center text-sm text-white/80">
          Competition not found.
        </p>
      </CompetitionSubpageShell>
    )
  }

  const entriesOpen = !entriesClosed
  const hasTeam = Boolean(myEntry?.customTeamName)
  const showSquadEditor = editParam && entriesOpen && hasTeam
  const compLabel = comp.name ?? 'League'

  return (
    <CompetitionSubpageShell>
      <div className="space-y-8">
        <CompetitionBreadcrumb
          variant="dark"
          items={[
            { label: 'Home', href: '/' },
            { label: 'Competitions', href: '/competitions' },
            { label: compLabel, href: `/competitions/${id}` },
            { label: 'My team' },
          ]}
        />

        <header className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="h-1 w-12 rounded-full bg-gradient-to-r from-amber-300 to-amber-500/40" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">
              Your fantasy team
            </span>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                My team & matches
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-white/65">
                Every fixture is listed — including not-yet-scored games. Expand
                a match to see your fantasy points by player (after scoring).
              </p>
            </div>
            {entriesOpen &&
              hasTeam &&
              (editParam ? (
                <Link
                  href={`/competitions/${id}/my-team`}
                  className="inline-flex shrink-0"
                >
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-xl border-white/25 bg-white/5 px-6 font-semibold text-white hover:bg-white/10"
                  >
                    Done editing
                  </Button>
                </Link>
              ) : (
                <Link
                  href={`/competitions/${id}/my-team?edit=1`}
                  className="inline-flex shrink-0"
                >
                  <Button
                    type="button"
                    className="h-11 rounded-xl bg-white px-6 font-semibold text-[#19398a] shadow-lg hover:bg-white/90"
                  >
                    Edit squad
                  </Button>
                </Link>
              ))}
          </div>
        </header>

        {!hasTeam && (
          <p className="rounded-xl border border-white/15 bg-white/5 px-4 py-6 text-center text-sm text-white/80">
            You have not submitted a team yet.{' '}
            <Link
              href={`/competitions/${id}/enter`}
              className="font-medium text-amber-200/90 underline-offset-4 hover:underline"
            >
              Enter the competition
            </Link>
          </p>
        )}

        {hasTeam && myEntry?.customTeamName != null && (
          <CompetitionMyTeamStrip
            competitionId={id}
            teamName={myEntry.customTeamName}
            totalScore={myEntry.totalScore ?? 0}
            rank={myRank}
            entriesOpen={entriesOpen}
            swapsHref={entriesClosed ? `/competitions/${id}/my-team/swaps` : undefined}
          />
        )}

        {editParam && hasTeam && entriesClosed && (
          <p className="text-sm text-white/60">
            Entries are closed — your squad can no longer be edited.
          </p>
        )}

        {showSquadEditor && (
          <TeamBuilder
            competitionId={id}
            entriesClosed={false}
            afterSaveRedirectTo={`/competitions/${id}/my-team`}
          />
        )}

        <MyTeamMatchLogSection
          competitionId={id}
          rows={rows}
          hasTeam={hasTeam}
          matchesLoading={matchesLoading}
        />

        <Link
          href={`/competitions/${id}`}
          className="inline-block text-sm font-medium text-amber-200/90 underline-offset-4 hover:underline"
        >
          ← Back to competition
        </Link>
      </div>

      <MyTeamPlayerMatchDrawer
        open={playerDrawerOpen}
        onOpenChange={(open) => {
          if (!open) closePlayerDrawer()
        }}
        playerId={playerFromQuery}
        matchId={matchFromQuery}
      />
    </CompetitionSubpageShell>
  )
}
