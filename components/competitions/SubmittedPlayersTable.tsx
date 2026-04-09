'use client'

import { RoleIcon } from '@/components/RoleIcon'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { Crown, Shield } from 'lucide-react'
import { Badge } from '../ui/badge'

export interface SubmittedPlayerRow {
  entryId: string
  teamName: string
  playerId: string
  playerName: string
  role: string
  tier: number
  franchiseName: string
  franchiseShortCode: string
  franchiseLogoUrl: string
  pointsScored: number
  isCaptain?: boolean
  isViceCaptain?: boolean
}

interface SubmittedPlayersTableProps {
  rows: (SubmittedPlayerRow & { tier?: number })[]
  /** Hide fantasy team name in Team column (e.g. single-team dialog). */
  variant?: 'full' | 'entryOnly' | 'competitionEntry'
}

const TH_COMP = 'text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45'

function getTierLabel(
  tier: number | string | undefined,
  competition: boolean,
) {
  if (!tier) return null
  if (typeof tier === 'string') tier = parseInt(tier, 10)
  if (competition) {
    if (tier === 1)
      return (
        <Badge className="rounded-full border-0 bg-amber-500/20 text-amber-100">
          Tier 1
        </Badge>
      )
    if (tier === 2)
      return (
        <Badge className="rounded-full border-0 bg-sky-500/20 text-sky-100">
          Tier 2
        </Badge>
      )
    if (tier === 3)
      return (
        <Badge className="rounded-full border-0 bg-emerald-500/20 text-emerald-100">
          Tier 3
        </Badge>
      )
    return (
      <Badge className="rounded-full border-0 bg-white/10 text-white/80">
        Tier {tier}
      </Badge>
    )
  }
  if (tier === 1)
    return (
      <Badge className="rounded-full bg-amber-500/20 text-amber-700">
        Tier 1
      </Badge>
    )
  if (tier === 2)
    return (
      <Badge className="rounded-full bg-slate-500/20 text-slate-700">
        Tier 2
      </Badge>
    )
  if (tier === 3)
    return (
      <Badge className="rounded-full bg-emerald-500/20 text-emerald-700">
        Tier 3
      </Badge>
    )
  return (
    <Badge className="rounded-full bg-gray-500/20 text-gray-700">
      Tier {tier}
    </Badge>
  )
}

export const SubmittedPlayersTable = ({
  rows,
  variant = 'full',
}: SubmittedPlayersTableProps) => {
  const competition = variant === 'competitionEntry'

  return (
    <Table className={cn(competition && 'min-w-[520px] text-white')}>
      <TableHeader>
        <TableRow
          className={cn(
            'border-0 hover:bg-transparent',
            competition && 'border-b border-white/10',
          )}
        >
          <TableHead className={cn(competition && TH_COMP)}>Player</TableHead>
          <TableHead className={cn(competition && TH_COMP)}>Role</TableHead>
          <TableHead className={cn(competition && TH_COMP)}>Team</TableHead>
          <TableHead className={cn(competition && TH_COMP)}>Tier</TableHead>
          <TableHead
            className={cn('text-right', competition && TH_COMP)}
          >
            Pts
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow
            key={`${r.entryId}-${r.playerId}`}
            className={cn(
              competition &&
                'border-b border-white/[0.06] last:border-0 hover:bg-white/[0.03]',
            )}
          >
            <TableCell
              className={cn(
                'font-medium',
                competition && 'py-3 text-white',
              )}
            >
              <span className="inline-flex flex-wrap items-center gap-2">
                {r.playerName}
                {r.isCaptain ? (
                  <span
                    className={cn(
                      'rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                      competition
                        ? 'bg-amber-500/20 text-amber-100'
                        : 'bg-amber-500/20 text-amber-700 dark:text-amber-200',
                    )}
                  >
                    <Crown
                      className={cn(
                        'inline size-3.5',
                        competition ? 'text-amber-300/80' : 'text-slate-500',
                      )}
                    />{' '}
                    Captain
                  </span>
                ) : null}
                {r.isViceCaptain ? (
                  <span
                    className={cn(
                      'rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                      competition
                        ? 'bg-white/10 text-white/85'
                        : 'bg-slate-500/20 text-slate-700 dark:text-slate-200',
                    )}
                  >
                    <Shield
                      className={cn(
                        'inline size-3.5',
                        competition ? 'text-white/50' : 'text-slate-500',
                      )}
                    />{' '}
                    Vice Captain
                  </span>
                ) : null}
              </span>
            </TableCell>
            <TableCell className={cn(competition && 'py-3')}>
              <span className="inline-flex items-center gap-2">
                <RoleIcon role={r.role} size="sm" />
                <span
                  className={cn(
                    'capitalize',
                    competition ? 'text-white/65' : 'text-muted-foreground',
                  )}
                >
                  {r.role}
                </span>
              </span>
            </TableCell>
            <TableCell className={cn(competition && 'py-3')}>
              <span className="inline-flex items-center gap-2">
                {r.franchiseLogoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- franchise URLs from DB; avoids remotePatterns
                  <img
                    src={r.franchiseLogoUrl}
                    alt=""
                    width={24}
                    height={24}
                    className="size-6 rounded object-contain"
                  />
                ) : (
                  <span
                    className={cn(
                      'flex size-6 items-center justify-center rounded text-[10px] font-bold',
                      competition
                        ? 'bg-white/10 text-white/70'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {r.franchiseShortCode.slice(0, 2)}
                  </span>
                )}
                <span className={cn(competition && 'text-white/90')}>
                  {r.franchiseName || r.franchiseShortCode}
                </span>
                {variant === 'full' ? (
                  <span
                    className={cn(
                      competition ? 'text-white/45' : 'text-muted-foreground',
                    )}
                  >
                    · {r.teamName}
                  </span>
                ) : null}
              </span>
            </TableCell>
            <TableCell className={cn(competition && 'py-3')}>
              {getTierLabel(r.tier, competition)}
            </TableCell>
            <TableCell
              className={cn(
                'text-right tabular-nums',
                competition && 'py-3 font-semibold text-amber-200/95',
              )}
            >
              {competition ? (
                r.pointsScored
              ) : (
                <Badge className="rounded-full bg-green-500/20 text-green-700">
                  <span className="text-green-700">{r.pointsScored}</span>
                </Badge>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
