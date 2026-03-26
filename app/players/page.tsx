import { HomePlayersExplorer } from '../../components/home/HomePlayersExplorer'
import { getPlayersGroupedByFranchise } from '../../lib/queries/homePlayers'

export default async function PlayersPage() {
  const teams = await getPlayersGroupedByFranchise()

  return (
    <div>
      <section aria-labelledby="rosters-heading" className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="rosters-heading"
              className="text-2xl font-semibold tracking-tight"
            >
              Franchise rosters
            </h2>
            <p className="mt-1 max-w-2xl text-muted-foreground">
              Every active player in the pool, grouped by IPL side — filter by
              tier, search by name, and scan roles before you draft.
            </p>
          </div>
        </div>
        <HomePlayersExplorer teams={teams} />
      </section>
    </div>
  )
}
