'use client'

import { AdminScoreTeamLogo } from '@/components/admin/AdminScoreTeamLogo'
import { cn } from '@/lib/utils'

interface TeamTotal {
  id: string
  shortCode: string
  name: string
  logoUrl?: string
  total: number
}

interface AdminScoreTotalsBarProps {
  grandTotal: number
  teams: [TeamTotal, TeamTotal]
}

export const AdminScoreTotalsBar = ({
  grandTotal,
  teams,
}: AdminScoreTotalsBarProps) => (
  <div className="grid gap-4 sm:grid-cols-3">
    <div
      className={cn(
        'rounded-xl border border-primary/25 bg-primary/10 px-4 py-4',
        'ring-1 ring-primary/20 shadow-sm',
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/90">
        Match total
      </p>
      <p className="mt-1 tabular-nums text-3xl font-bold tracking-tight text-primary text-yellow-500">
        {grandTotal}
        <span className="ml-1 text-base font-semibold text-white  text-yellow-500">
          pts
        </span>
      </p>
    </div>
    {teams.map((t) => (
      <div
        key={t.id}
        className={cn(
          'flex gap-3 rounded-xl border border-border/80 bg-card px-4 py-4',
          'ring-1 ring-border/50',
        )}
      >
        <AdminScoreTeamLogo logoUrl={t.logoUrl} shortCode={t.shortCode} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            <span className="truncate text-foreground">{t.shortCode}</span>
          </p>
          <p className="truncate text-xs text-muted-foreground">{t.name}</p>
          <p className="mt-1 tabular-nums text-2xl font-semibold tracking-tight text-primary">
            {t.total}
            <span className="ml-1 text-sm font-medium text-muted-foreground">
              pts
            </span>
          </p>
        </div>
      </div>
    ))}
  </div>
)
