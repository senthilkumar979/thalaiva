'use client'

import { cn } from '@/lib/utils'
import { CalendarClock, Sparkles, Users } from 'lucide-react'
import Link from 'next/link'
import { Button } from '../ui/button'

export interface CompetitionDetailData {
  id: string
  name: string
  description?: string
  entryDeadline: string
  /** Admin closed entries before deadline. */
  entriesFrozen?: boolean
  participants?: unknown[]
}

interface CompetitionDetailHeroProps {
  competition: CompetitionDetailData
  id: string
}

function formatDeadline(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export const CompetitionDetailHero = ({
  competition: c,
  id,
}: CompetitionDetailHeroProps) => {
  const frozen = c.entriesFrozen === true
  const beforeDeadline = new Date() < new Date(c.entryDeadline)
  const open = !frozen && beforeDeadline
  const count = Array.isArray(c.participants) ? c.participants.length : 0

  return (
    <header className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.1] to-transparent p-4 shadow-inner sm:rounded-2xl sm:p-6 md:p-8">
      <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-amber-400/10 blur-3xl max-sm:-right-12 max-sm:size-44" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 size-40 rounded-full bg-sky-400/10 blur-2xl" />
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
        <div className="relative min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white/55">
              <Sparkles className="size-3 text-amber-300/90" />
              League
            </span>
            <span
              className={cn(
                'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1',
                open
                  ? 'bg-emerald-500/15 text-emerald-200 ring-emerald-400/25'
                  : 'bg-white/10 text-white/45 ring-white/15',
              )}
            >
              {open
                ? 'Entries open'
                : frozen
                ? 'Entries closed (frozen)'
                : 'Entry closed'}
            </span>
          </div>
          <h1 className="mt-3 break-words text-2xl font-bold tracking-tight text-white sm:mt-4 sm:text-3xl sm:leading-tight md:text-4xl">
            {c.name}
          </h1>
          {c.description ? (
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/65 sm:text-base">
              {c.description}
            </p>
          ) : null}
          <div className="mt-5 flex flex-col gap-3 text-sm text-white/70 sm:mt-6 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
            <span className="inline-flex min-w-0 items-start gap-2 sm:items-center">
              <CalendarClock className="mt-0.5 size-4 shrink-0 text-amber-300/85 sm:mt-0" />
              <time
                className="min-w-0 break-words leading-snug"
                dateTime={c.entryDeadline}
              >
                {formatDeadline(c.entryDeadline)}
              </time>
            </span>
            <span className="inline-flex items-center gap-2 text-white/55">
              <Users className="size-4 shrink-0" />
              {count} participant{count === 1 ? '' : 's'}
            </span>
          </div>
        </div>
        <div className="flex w-full shrink-0 flex-col gap-2 sm:flex-row sm:flex-wrap lg:w-auto lg:justify-end">
          <Link
            href={`/competitions/${id}/scoring-rules`}
            className="inline-flex w-full sm:w-auto"
          >
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full rounded-xl border-white/25 bg-white/5 text-white hover:bg-white/10 sm:w-auto"
            >
              Scoring rules
            </Button>
          </Link>
          <Link
            href={`/competitions/${id}/team-selection-rules`}
            className="inline-flex w-full sm:w-auto"
          >
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full rounded-xl border-white/25 bg-white/5 text-white hover:bg-white/10 sm:w-auto"
            >
              Team selection rules
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
