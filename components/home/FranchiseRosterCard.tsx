'use client'

import { Users } from 'lucide-react'
import type { PlayerRole, PlayerTier } from '@/models/Player'
import { cn } from '@/lib/utils'
import { FranchiseRosterTeamLogo } from '@/components/home/FranchiseRosterTeamLogo'
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
  variant?: 'default' | 'hub'
}

export const FranchiseRosterCard = ({
  name,
  shortCode,
  logoUrl,
  players,
  accentClass,
  variant = 'default',
}: FranchiseRosterCardProps) => {
  const hub = variant === 'hub'
  return (
    <article
      className={cn(
        'w-full overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md',
        'border-l-4',
        accentClass,
        hub
          ? 'border-white/10 bg-white/[0.04] ring-1 ring-white/10 hover:shadow-white/5'
          : 'border-border/80 bg-card hover:shadow-md',
      )}
    >
      <header
        className={cn(
          'flex flex-col gap-4 border-b px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-6',
          hub
            ? 'border-white/10 bg-white/[0.04]'
            : 'border-border/60 bg-muted/25',
        )}
      >
        <div className="min-w-0 flex flex-wrap items-center gap-4">
          <FranchiseRosterTeamLogo shortCode={shortCode} logoUrl={logoUrl} />
          <h3
            className={cn(
              'text-pretty text-xl font-semibold leading-snug tracking-tight sm:text-2xl',
              hub && 'text-white',
            )}
          >
            {name}
          </h3>
          <span
            className={cn(
              'rounded-md px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wider ring-1',
              hub
                ? 'bg-white/10 text-amber-200/95 ring-white/15'
                : 'bg-background/90 text-primary ring-border/80',
            )}
          >
            {shortCode}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <p
            className={cn(
              'flex items-center gap-2 text-sm',
              hub ? 'text-white/55' : 'text-muted-foreground',
            )}
          >
            <Users className="size-4 shrink-0 opacity-80" aria-hidden />
            <span>
              <span
                className={cn(
                  'font-semibold tabular-nums',
                  hub ? 'text-white' : 'text-foreground',
                )}
              >
                {players.length}
              </span>{' '}
              in pool
            </span>
          </p>
        </div>
      </header>

      <div className="min-w-0 bg-white rounded-b-2xl">
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
                <div
                  className={cn(
                    'mb-3 flex flex-wrap items-center gap-2 border-b pb-2',
                    hub ? 'border-white/10' : 'border-border/60',
                  )}
                >
                  <h4
                    id={headingId}
                    className={cn(
                      'rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider',
                      meta.chip,
                    )}
                  >
                    {meta.title}
                  </h4>
                  <span
                    className={cn(
                      'text-[11px] tabular-nums',
                      hub ? 'text-white/45' : 'text-muted-foreground',
                    )}
                  >
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
                      variant={variant}
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
