'use client'

import { IPL_ROLE_ICON_SVG } from '@/lib/iplRoleIcons'
import { PlayerPoolTierStars } from '@/components/home/PlayerPoolTierStars'
import { cn } from '@/lib/utils'
import type { PlayerRole, PlayerTier } from '@/models/Player'

const ROLE_CONFIG: Record<
  PlayerRole,
  {
    label: string
    ring: string
    iconWrap: string
    chip: string
    nameText: string
  }
> = {
  bat: {
    label: 'Batter',
    ring: 'ring-orange-500/35',
    iconWrap:
      'bg-gradient-to-br from-orange-500/25 via-orange-500/12 to-orange-500/5 ring-1 ring-orange-500/30 shadow-inner',
    chip: 'bg-orange-500/12 text-orange-900 dark:text-orange-200',
    nameText: 'text-orange-700 dark:text-orange-300',
  },
  bowl: {
    label: 'Bowler',
    ring: 'ring-sky-500/40',
    iconWrap:
      'bg-gradient-to-br from-sky-500/25 via-sky-500/12 to-sky-500/5 ring-1 ring-sky-500/30 shadow-inner',
    chip: 'bg-sky-500/12 text-sky-900 dark:text-sky-100',
    nameText: 'text-sky-700 dark:text-sky-300',
  },
  allrounder: {
    label: 'All-rounder',
    ring: 'ring-violet-500/40',
    iconWrap:
      'bg-gradient-to-br from-violet-500/25 via-violet-500/12 to-violet-500/5 ring-1 ring-violet-500/30 shadow-inner',
    chip: 'bg-violet-500/12 text-violet-900 dark:text-violet-100',
    nameText: 'text-violet-700 dark:text-violet-300',
  },
  wk: {
    label: 'Wicket-keeper',
    ring: 'ring-emerald-500/45',
    iconWrap:
      'bg-gradient-to-br from-emerald-500/25 via-emerald-500/12 to-emerald-500/5 ring-1 ring-emerald-500/30 shadow-inner',
    chip: 'bg-emerald-500/12 text-emerald-900 dark:text-emerald-100',
    nameText: 'text-emerald-700 dark:text-emerald-300',
  },
}

interface PlayerPoolCardProps {
  name: string
  tier: PlayerTier
  role: PlayerRole
  totalFantasyPoints: number
  variant?: 'default' | 'hub'
}

export const PlayerPoolCard = ({
  name,
  tier,
  role,
  totalFantasyPoints,
  variant = 'default',
}: PlayerPoolCardProps) => {
  const hub = variant === 'hub'
  const cfg = ROLE_CONFIG[role]
  const roleIconSrc = IPL_ROLE_ICON_SVG[role]

  return (
    <article
      className={cn(
        'flex min-w-0 flex-col rounded-xl border p-2.5 shadow-sm transition hover:shadow-md hover:ring-2',
        hub
          ? 'border-white/10 bg-white/[0.06] ring-1 ring-white/10'
          : 'bg-card/95 ring-1 ring-border/60',
        cfg.ring,
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-1.5">
        <div
          className={cn(
            'flex size-8 items-center justify-center rounded-lg p-1',
            cfg.iconWrap,
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- IPL CDN SVGs */}
          <img
            src={roleIconSrc}
            alt={cfg.label}
            width={24}
            height={24}
            className="size-6 object-contain"
          />
        </div>
        <span
          className={cn(
            'max-w-[5.5rem] truncate rounded-full px-1.5 py-px text-right text-[8px] font-semibold uppercase leading-tight tracking-wide',
            cfg.chip,
          )}
        >
          {cfg.label}
        </span>
      </div>
      <h4
        className={cn(
          'line-clamp-2 min-h-[1rem] text-xs font-semibold leading-tight tracking-tight',
          cfg.nameText,
        )}
      >
        {name}
      </h4>
      <div
        className={cn(
          'mt-2 space-y-1.5 border-t pt-2',
          hub ? 'border-white/10' : 'border-border/60',
        )}
      >
        <PlayerPoolTierStars tier={tier} hub={hub} />
        <p
          className={cn(
            'flex items-baseline justify-between gap-2 text-[10px]',
            hub ? 'text-black/[0.5]' : 'text-muted-foreground',
          )}
        >
          <span>Fantasy pts</span>
          <span
            className={cn(
              'font-semibold tabular-nums',
              hub ? 'text-black/[0.9]' : 'text-foreground',
            )}
          >
            {totalFantasyPoints.toLocaleString()}
          </span>
        </p>
      </div>
    </article>
  )
}
