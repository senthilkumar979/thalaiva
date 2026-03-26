'use client'

import { useState } from 'react'
import { Users } from 'lucide-react'
import type { PlayerRole, PlayerTier } from '@/models/Player'
import { cn } from '@/lib/utils'
import { PlayerPoolCard } from './PlayerPoolCard'

const TIER_ORDER: PlayerTier[] = [1, 3, 5]

const TIER_SECTION: Record<PlayerTier, { title: string; chip: string }> = {
  1: {
    title: 'Tier 1',
    chip:
      'border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100',
  },
  3: {
    title: 'Tier 3',
    chip:
      'border-amber-500/45 bg-amber-500/10 text-amber-950 dark:text-amber-100',
  },
  5: {
    title: 'Tier 5',
    chip: 'border-rose-500/40 bg-rose-500/10 text-rose-950 dark:text-rose-100',
  },
}

interface FranchiseRosterCardProps {
  name: string
  shortCode: string
  logoUrl: string
  players: {
    id: string
    name: string
    tier: PlayerTier
    role: PlayerRole
    totalFantasyPoints: number
  }[]
  accentClass: string
}

function TeamLogo({
  shortCode,
  logoUrl,
}: {
  shortCode: string
  logoUrl: string
}) {
  const [failed, setFailed] = useState(false)
  const showFallback = !logoUrl || failed
  if (showFallback) {
    return (
      <div
        className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-primary/5 text-sm font-bold text-primary ring-1 ring-primary/15"
        aria-hidden
      >
        {shortCode.slice(0, 2)}
      </div>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- external franchise URLs vary
    <img
      src={logoUrl}
      alt=""
      className="size-14 shrink-0 object-contain"
      onError={() => setFailed(true)}
    />
  )
}

export const FranchiseRosterCard = ({
  name,
  shortCode,
  logoUrl,
  players,
  accentClass,
}: FranchiseRosterCardProps) => {
  return (
    <article
      className={cn(
        'w-full overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-shadow hover:shadow-md',
        'border-l-4',
        accentClass,
      )}
    >
      <header className="border-b border-border/60 bg-muted/25 px-5 py-5 sm:px-8 sm:py-6 flex items-center justify-between">
        <div className="min-w-0 flex items-center gap-4">
          <TeamLogo shortCode={shortCode} logoUrl={logoUrl} />
          <h3 className="text-pretty text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
            {name}
          </h3>
          <span className="rounded-md bg-background/90 px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-primary font-bold ring-1 ring-border/80">
            {shortCode}
          </span>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="size-4 shrink-0 opacity-80" aria-hidden />
            <span>
              <span className="font-semibold tabular-nums text-foreground">
                {players.length}
              </span>{' '}
              in pool
            </span>
          </p>
        </div>
      </header>

      <div className="min-w-0">
        <div className="flex flex-col gap-6 p-4 sm:p-5 lg:p-8">
          {TIER_ORDER.map((tier) => {
            const byTier = players
              .filter((p) => p.tier === tier)
              .sort((a, b) => a.name.localeCompare(b.name))
            if (byTier.length === 0) return null
            const meta = TIER_SECTION[tier]
            const headingId = `franchise-${shortCode}-tier-${tier}`
            return (
              <section
                key={tier}
                aria-labelledby={headingId}
                className="min-w-0"
              >
                <div className="mb-3 flex flex-wrap items-center gap-2 border-b border-border/60 pb-2">
                  <h4
                    id={headingId}
                    className={cn(
                      'rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider',
                      meta.chip,
                    )}
                  >
                    {meta.title}
                  </h4>
                  <span className="text-[11px] tabular-nums text-muted-foreground">
                    {byTier.length} player{byTier.length === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(180px,1fr))]">
                  {byTier.map((p) => (
                    <PlayerPoolCard
                      key={p.id}
                      name={p.name}
                      tier={p.tier}
                      role={p.role}
                      totalFantasyPoints={p.totalFantasyPoints}
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </article>
  )
}
