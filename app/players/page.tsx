import { CompetitionBreadcrumb } from '@/components/competitions/CompetitionBreadcrumb'
import { HomePlayersExplorer } from '@/components/home/HomePlayersExplorer'
import { getPlayersGroupedByFranchise } from '@/lib/queries/homePlayers'
import { Users } from 'lucide-react'

export default async function PlayersPage() {
  const teams = await getPlayersGroupedByFranchise()

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 text-white shadow-2xl">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0a1f4a] via-[#19398a] to-[#071229]"
        aria-hidden
      />
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-sky-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(100%,32rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="relative space-y-12 px-4 py-12 sm:px-8 sm:py-14">
        <CompetitionBreadcrumb
          className="mx-auto max-w-5xl"
          variant="dark"
          items={[{ label: 'Home', href: '/' }, { label: 'Players' }]}
        />

        <header className="mx-auto max-w-5xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">
            <Users className="size-3.5 text-amber-300/90" aria-hidden />
            Player pool
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl sm:leading-[1.1]">
            IPL rosters
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
            Every active player in the pool, grouped by IPL side — filter by
            tier, search by name, and scan roles before you draft.
          </p>
        </header>

        {/* <AddPlayerToPoolForm variant="hub" /> */}

        <section
          aria-labelledby="rosters-heading"
          className="mx-auto max-w-5xl space-y-6"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="text-left">
              <h2
                id="rosters-heading"
                className="text-2xl font-bold tracking-tight text-white sm:text-3xl"
              >
                Franchise rosters
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-white/55 sm:text-base">
                Expand each side to see Tier 1, 3, and 5 picks with roles and
                fantasy points accrued in scored matches.
              </p>
            </div>
            {teams.length > 0 ? (
              <p className="text-sm tabular-nums text-white/45">
                {teams.length} franchise{teams.length === 1 ? '' : 's'}
              </p>
            ) : null}
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/15 bg-white/[0.04] p-1 shadow-inner shadow-black/20 ring-1 ring-white/10">
            <div className="rounded-xl px-4 py-6 sm:px-6 sm:py-8">
              <HomePlayersExplorer teams={teams} variant="hub" />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
