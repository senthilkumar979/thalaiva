'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Pencil } from 'lucide-react'
import { CompetitionBreadcrumb } from '@/components/competitions/CompetitionBreadcrumb'
import { CompetitionDetailHero } from '@/components/competitions/CompetitionDetailHero'
import { CompetitionDetailLoading } from '@/components/competitions/CompetitionDetailLoading'
import { CompetitionDetailNotFound } from '@/components/competitions/CompetitionDetailNotFound'
import { CompetitionAdminPanel } from '@/components/competitions/CompetitionAdminPanel'
import { CompetitionLeaderboardSection } from '@/components/competitions/CompetitionLeaderboardSection'
import { CompetitionMyTeamStrip } from '@/components/competitions/CompetitionMyTeamStrip'
import type { LeaderboardRow } from '@/components/LeaderboardTable'
import { Button } from '@/components/ui/button'
import { areCompetitionEntriesClosed } from '@/lib/competitionEntryGate'

interface Competition {
  _id: string
  name: string
  description?: string
  entryDeadline: string
  entriesFrozen?: boolean
  participants?: unknown[]
}

interface MyEntry {
  totalScore: number
  customTeamName: string
}

export default function CompetitionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = String(params.id)
  const { data: session } = useSession()
  const [comp, setComp] = useState<Competition | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [board, setBoard] = useState<LeaderboardRow[]>([])
  const [mine, setMine] = useState<MyEntry | null>(null)
  const [myRank, setMyRank] = useState<number | null>(null)
  const [adminOpen, setAdminOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setLoadError(false)
      try {
        const res = await fetch(`/api/competitions/${id}`)
        const data = await res.json()
        if (!res.ok) {
          if (!cancelled) {
            setLoadError(true)
            setComp(null)
          }
          return
        }
        if (!cancelled) setComp(data as Competition)
      } catch {
        if (!cancelled) {
          setLoadError(true)
          setComp(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    if (!comp) return
    fetch(`/api/competitions/${id}/leaderboard`)
      .then((r) => r.json())
      .then((rows: LeaderboardRow[]) => {
        setBoard(Array.isArray(rows) ? rows : [])
        if (session?.user?.email) {
          const me = rows.find((x) => x.user?.email === session.user?.email)
          setMyRank(me?.rank ?? null)
        }
      })
      .catch(() => undefined)
  }, [id, comp, session?.user?.email, session?.user?.id])

  useEffect(() => {
    if (!session?.user) {
      setMine(null)
      return
    }
    fetch(`/api/competitions/${id}/entries/me`)
      .then((r) => (r.ok ? r.json() : null))
      .then((e) => setMine(e && e.customTeamName ? e : null))
      .catch(() => setMine(null))
  }, [id, session?.user])

  const refreshCompetition = () => {
    fetch(`/api/competitions/${id}`)
      .then(async (res) => {
        const data = await res.json()
        if (res.ok) setComp(data as Competition)
      })
      .catch(() => undefined)
  }

  if (loading) return <CompetitionDetailLoading />
  if (loadError || !comp) return <CompetitionDetailNotFound />

  const entriesClosed = areCompetitionEntriesClosed(
    comp.entriesFrozen,
    comp.entryDeadline,
  )
  const isAdmin = session?.user?.role === 'admin'
  const revealAllSquads = comp.entriesFrozen === true || isAdmin

  return (
    <div className="relative max-w-full min-w-0 overflow-hidden rounded-xl border border-white/10 text-white shadow-2xl sm:rounded-2xl">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0a1f4a] via-[#19398a] to-[#071229]"
        aria-hidden
      />
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-sky-500/12 blur-3xl max-sm:-left-24 max-sm:h-64 max-sm:w-64" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl max-sm:-right-16 max-sm:h-56 max-sm:w-56" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(100%,28rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="relative space-y-6 px-3 pb-8 pt-6 sm:space-y-8 sm:px-6 sm:py-10 md:px-8 md:py-12">
        <CompetitionBreadcrumb
          variant="dark"
          className="text-xs sm:text-sm"
          items={[
            { label: 'Home', href: '/' },
            { label: 'Competitions', href: '/competitions' },
            { label: comp.name },
          ]}
        />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0 flex-1">
            <CompetitionDetailHero
              competition={{
                id: comp._id,
                name: comp.name,
                description: comp.description,
                entryDeadline: comp.entryDeadline,
                entriesFrozen: comp.entriesFrozen,
                participants: comp.participants,
              }}
              id={id}
            />
          </div>
          {isAdmin && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0 self-end border-white/25 bg-white/5 text-white hover:bg-white/10 sm:mt-1 sm:self-start"
              onClick={() => setAdminOpen((o) => !o)}
              aria-expanded={adminOpen}
              aria-label={
                adminOpen ? 'Hide competition editor' : 'Edit competition'
              }
            >
              <Pencil className="size-4" />
            </Button>
          )}
        </div>

        {isAdmin && adminOpen && (
          <CompetitionAdminPanel
            competitionId={id}
            initial={{
              name: comp.name,
              description: comp.description,
              entryDeadline: comp.entryDeadline,
              entriesFrozen: comp.entriesFrozen === true,
            }}
            onUpdated={refreshCompetition}
          />
        )}

        {mine && (
          <CompetitionMyTeamStrip
            competitionId={id}
            teamName={mine.customTeamName}
            totalScore={mine.totalScore}
            rank={myRank}
            entriesOpen={!entriesClosed}
            swapsHref={entriesClosed ? `/competitions/${id}/my-team/swaps` : undefined}
          />
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
          {entriesClosed ? (
            <Button
              type="button"
              disabled
              className="h-11 w-full cursor-not-allowed rounded-xl border border-white/15 bg-white/10 px-6 font-semibold text-white/50 sm:w-auto"
            >
              Entries closed
            </Button>
          ) : mine ? (
            <></>
          ) : (
            <Link
              href={`/competitions/${id}/enter`}
              className="inline-flex w-full sm:w-auto"
            >
              <Button
                type="button"
                className="h-11 w-full rounded-xl bg-white px-6 font-semibold text-[#19398a] shadow-lg hover:bg-white/90 sm:w-auto"
              >
                Enter team
              </Button>
            </Link>
          )}
          {/* <Link href={`/competitions/${id}/players`} className="inline-flex">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl border-white/25 bg-white/5 text-white hover:bg-white/10"
            >
              {revealAllSquads ? "Submitted players" : "My squad"}
            </Button>
          </Link> */}
          <Link
            href={`/competitions/${id}/matches`}
            className="inline-flex w-full sm:w-auto"
          >
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full rounded-xl border-white/25 bg-white/5 text-white hover:bg-white/10 sm:w-auto"
            >
              All matches
            </Button>
          </Link>
          <Link
            href={`/competitions/${id}/players/leaderboard`}
            className="inline-flex w-full sm:w-auto"
          >
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full rounded-xl border-white/25 bg-white/5 text-white hover:bg-white/10 sm:w-auto"
            >
              Player points
            </Button>
          </Link>
          <Link
            href={`/competitions/${id}/scores`}
            className="inline-flex w-full sm:w-auto"
          >
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full rounded-xl border-white/25 bg-white/5 text-white hover:bg-white/10 sm:w-auto"
            >
              Scores by match
            </Button>
          </Link>
        </div>

        <CompetitionLeaderboardSection
          rows={board}
          highlightEmail={session?.user?.email ?? null}
          onTeamClick={(row) => {
            const q = new URLSearchParams()
            q.set('fantasy', String(row.totalScore))
            q.set('name', row.customTeamName)
            q.set('rank', String(row.rank))
            router.push(
              `/competitions/${id}/entries/${encodeURIComponent(row.entryId)}?${q.toString()}`,
            )
          }}
          privacyNote={
            revealAllSquads
              ? null
              : 'Only your team is shown here until entries are frozen. Admins always see every team.'
          }
        />
      </div>
    </div>
  )
}
