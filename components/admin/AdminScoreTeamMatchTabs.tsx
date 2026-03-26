'use client'

import { AdminScoreTeamLogo } from '@/components/admin/AdminScoreTeamLogo'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ReactNode } from 'react'

interface MatchTeams {
  franchiseA: { _id: string; shortCode: string; name: string; logoUrl?: string }
  franchiseB: { _id: string; shortCode: string; name: string; logoUrl?: string }
}

interface AdminScoreTeamMatchTabsProps {
  matchTeams: MatchTeams
  homePanel: ReactNode
  awayPanel: ReactNode
}

/** Base UI sets `data-active` on the selected tab; Tailwind needs `data-[active]:` to target it. */
const tabTriggerCls =
  'gap-2 px-4 py-2.5 bg-[#19398a]/10 text-[#19398a] data-[active]:bg-[#19398a] data-[active]:text-primary-foreground data-[active]:shadow-sm'

export const AdminScoreTeamMatchTabs = ({
  matchTeams,
  homePanel,
  awayPanel,
}: AdminScoreTeamMatchTabsProps) => (
  <Tabs defaultValue="home" className="group/tabs flex w-full flex-col gap-0">
    <div className="w-full shrink-0 border-b border-border/60 bg-muted/30 p-2">
      <TabsList
        variant="default"
        className="h-auto w-full flex-wrap justify-start gap-1 rounded-lg bg-muted/80 p-1 sm:flex-nowrap"
      >
        <TabsTrigger value="home" className={tabTriggerCls}>
          <AdminScoreTeamLogo
            logoUrl={matchTeams.franchiseA.logoUrl}
            shortCode={matchTeams.franchiseA.shortCode}
            size="sm"
          />
          <span className="font-medium">Home</span>
          <span className="text-muted-foreground">·</span>
          <span>{matchTeams.franchiseA.shortCode}</span>
        </TabsTrigger>
        <TabsTrigger value="away" className={tabTriggerCls}>
          <AdminScoreTeamLogo
            logoUrl={matchTeams.franchiseB.logoUrl}
            shortCode={matchTeams.franchiseB.shortCode}
            size="sm"
          />
          <span className="font-medium">Away</span>
          <span className="text-muted-foreground">·</span>
          <span>{matchTeams.franchiseB.shortCode}</span>
        </TabsTrigger>
      </TabsList>
    </div>

    <TabsContent value="home" className="mt-4 w-full outline-none">
      {homePanel}
    </TabsContent>
    <TabsContent value="away" className="mt-4 w-full outline-none">
      {awayPanel}
    </TabsContent>
  </Tabs>
)
