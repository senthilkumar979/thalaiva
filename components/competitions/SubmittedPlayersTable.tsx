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
  variant?: 'full' | 'entryOnly'
}

function getTierLabel(tier: number | string | undefined) {
  if (!tier) return null
  if (typeof tier === 'string') tier = parseInt(tier, 10)
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
}: SubmittedPlayersTableProps) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Player</TableHead>
        <TableHead>Role</TableHead>
        <TableHead>Team</TableHead>
        <TableHead>Tier</TableHead>
        <TableHead className="text-right">Pts</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {rows.map((r) => (
        <TableRow key={`${r.entryId}-${r.playerId}`}>
          <TableCell className="font-medium">
            <span className="inline-flex flex-wrap items-center gap-2">
              {r.playerName}
              {r.isCaptain ? (
                <span className="rounded-md bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-200">
                  <Crown className="inline size-3.5 text-slate-500" /> Captain
                </span>
              ) : null}
              {r.isViceCaptain ? (
                <span className="rounded-md bg-slate-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
                  <Shield className="inline size-3.5 text-slate-500" /> Vice
                  Captain
                </span>
              ) : null}
            </span>
          </TableCell>
          <TableCell>
            <span className="inline-flex items-center gap-2">
              <RoleIcon role={r.role} size="sm" />
              <span className="capitalize text-muted-foreground">{r.role}</span>
            </span>
          </TableCell>
          <TableCell>
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
                <span className="flex size-6 items-center justify-center rounded bg-muted text-[10px] font-bold text-muted-foreground">
                  {r.franchiseShortCode.slice(0, 2)}
                </span>
              )}
              <span>{r.franchiseName || r.franchiseShortCode}</span>
              {variant === 'full' ? (
                <span className="text-muted-foreground">· {r.teamName}</span>
              ) : null}
            </span>
          </TableCell>
          <TableCell>{getTierLabel(r.tier)}</TableCell>
          <TableCell className="text-right tabular-nums">
            <Badge className="rounded-full bg-green-500/20 text-green-700">
              <span className="text-green-700">{r.pointsScored}</span>
            </Badge>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
)
