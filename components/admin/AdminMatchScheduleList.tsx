'use client'

import { useMemo } from 'react'
import { AdminMatchFixtureRow } from '@/components/admin/AdminMatchFixtureRow'
import type { AdminMatchRow } from '@/components/admin/adminMatchTypes'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

export type { AdminMatchRow } from '@/components/admin/adminMatchTypes'

interface AdminMatchScheduleListProps {
  matches: AdminMatchRow[]
  onEdit?: (m: AdminMatchRow) => void
}

function sortByMatchNumber(a: AdminMatchRow, b: AdminMatchRow): number {
  return a.matchNumber - b.matchNumber
}

const tabTriggerClass =
  'shrink-0 rounded-md px-3 text-sm text-white/55 hover:text-white/85 data-[active]:text-white data-[active]:after:bg-emerald-400/80 dark:data-[active]:bg-transparent sm:px-4'

export const AdminMatchScheduleList = ({
  matches,
  onEdit,
}: AdminMatchScheduleListProps) => {
  const { pending, scored } = useMemo(() => {
    const pendingList = matches
      .filter((m) => !m.isScored)
      .sort(sortByMatchNumber)
    const scoredList = matches.filter((m) => m.isScored).sort(sortByMatchNumber)
    return { pending: pendingList, scored: scoredList }
  }, [matches])

  if (matches.length === 0) {
    return (
      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
              Fixture list
            </h2>
            <p className="mt-1 text-lg font-semibold tracking-tight text-white">
              Scheduled matches
            </p>
          </div>
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium tabular-nums text-white/75">
            0 matches
          </span>
        </div>
        <div className="rounded-2xl border border-dashed border-white/20 bg-white/[0.04] px-6 py-16 text-center">
          <p className="text-sm font-medium text-white">No fixtures yet</p>
          <p className="mt-2 text-sm text-white/65">
            Click &quot;Schedule match&quot; above to add the first fixture.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
            Fixture list
          </h2>
          <p className="mt-1 text-lg font-semibold tracking-tight text-white">
            Scheduled matches
          </p>
        </div>
        <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium tabular-nums text-white/75">
          {matches.length} {matches.length === 1 ? 'match' : 'matches'}
        </span>
      </div>

      <Tabs defaultValue="pending" className="w-full text-white">
        <div className="shrink-0 border-b border-white/10 bg-black/15 px-1 py-2 backdrop-blur-sm sm:px-0 w-full rounded-lg mb-3">
          <TabsList
            variant="line"
            className="h-9 w-full min-w-0 justify-start gap-1 overflow-x-auto overflow-y-hidden bg-transparent p-0 [-webkit-overflow-scrolling:touch] sm:w-auto w-full"
          >
            <TabsTrigger value="pending" className={cn(tabTriggerClass)}>
              Pending
              <span className="ml-1 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-white/65">
                {pending.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="scored" className={cn(tabTriggerClass)}>
              Scored
              <span className="ml-1 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-white/65">
                {scored.length}
              </span>
            </TabsTrigger>
          </TabsList>
          <div className="px-4 mb-5">
            <TabsContent
              value="pending"
              className="mt-4 space-y-0 data-[state=inactive]:hidden"
            >
              {pending.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-amber-400/25 bg-amber-500/[0.06] px-6 py-14 text-center">
                  <p className="text-sm font-medium text-white/90">
                    No pending matches
                  </p>
                  <p className="mt-2 text-sm text-white/60">
                    Every scheduled fixture has been scored.
                  </p>
                </div>
              ) : (
                <ul className="grid gap-4">
                  {pending.map((m) => (
                    <AdminMatchFixtureRow key={m._id} m={m} onEdit={onEdit} />
                  ))}
                </ul>
              )}
            </TabsContent>

            <TabsContent
              value="scored"
              className="mt-4 space-y-0 data-[state=inactive]:hidden"
            >
              {scored.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/20 bg-white/[0.04] px-6 py-14 text-center">
                  <p className="text-sm font-medium text-white">
                    No scored matches yet
                  </p>
                  <p className="mt-2 text-sm text-white/65">
                    Submit scores from each match&apos;s page when ready.
                  </p>
                </div>
              ) : (
                <ul className="grid gap-4">
                  {scored.map((m) => (
                    <AdminMatchFixtureRow key={m._id} m={m} onEdit={onEdit} />
                  ))}
                </ul>
              )}
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </section>
  )
}
