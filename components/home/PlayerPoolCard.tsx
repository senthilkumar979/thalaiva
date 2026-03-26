'use client'

import { IPL_ROLE_ICON_SVG } from '@/lib/iplRoleIcons'
import { cn } from '@/lib/utils'
import type { PlayerRole, PlayerTier } from '@/models/Player'
import { Star } from 'lucide-react'

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

function TierStars({ tier }: { tier: PlayerTier }) {
  const filled = tier
  return (
    <div
      className="flex items-center gap-1.5"
      title={`Draft tier ${tier} (${filled} star${filled === 1 ? '' : 's'})`}
    >
      <span className="flex gap-px" aria-hidden>
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={cn(
              'size-3 shrink-0',
              i < filled
                ? 'fill-amber-400 text-amber-500 drop-shadow-[0_0_6px_rgba(251,191,36,0.35)]'
                : 'fill-muted/25 text-muted-foreground/30',
            )}
            strokeWidth={i < filled ? 0 : 1}
          />
        ))}
      </span>
      <span className="text-[9px] font-bold tabular-nums tracking-wide text-muted-foreground">
        T{tier}
      </span>
    </div>
  )
}

interface PlayerPoolCardProps {
  name: string
  tier: PlayerTier
  role: PlayerRole
  totalFantasyPoints: number
}

export const PlayerPoolCard = ({
  name,
  tier,
  role,
  totalFantasyPoints,
}: PlayerPoolCardProps) => {
  const cfg = ROLE_CONFIG[role]
  const roleIconSrc = IPL_ROLE_ICON_SVG[role]

  return (
    <article
      className={cn(
        'flex min-w-0 flex-col rounded-xl border bg-card/95 p-2.5 shadow-sm ring-1 ring-border/60 transition hover:shadow-md hover:ring-2',
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
      <div className="mt-2 space-y-1.5 border-t border-border/60 pt-2">
        <TierStars tier={tier} />
        <p className="flex items-baseline justify-between gap-2 text-[10px] text-muted-foreground">
          <span>Fantasy pts</span>
          <span className="font-semibold tabular-nums text-foreground">
            {totalFantasyPoints.toLocaleString()}
          </span>
        </p>
      </div>
    </article>
  )
}
