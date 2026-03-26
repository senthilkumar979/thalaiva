"use client";

import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminScoreTeamLogo } from "@/components/admin/AdminScoreTeamLogo";

interface MatchTeams {
  franchiseA: { _id: string; shortCode: string; name: string; logoUrl?: string };
  franchiseB: { _id: string; shortCode: string; name: string; logoUrl?: string };
}

interface AdminScoreTeamMatchTabsProps {
  matchTeams: MatchTeams;
  homePanel: ReactNode;
  awayPanel: ReactNode;
}

const tabTriggerCls =
  "gap-2 px-3 py-2 data-active:bg-primary data-active:text-primary-foreground data-active:shadow-sm";

export const AdminScoreTeamMatchTabs = ({
  matchTeams,
  homePanel,
  awayPanel,
}: AdminScoreTeamMatchTabsProps) => (
  <Tabs defaultValue="home" className="w-full gap-6">
    <TabsList variant="default" className="h-auto w-full flex-wrap justify-start gap-1 p-1 sm:w-fit">
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
    <TabsContent value="home" className="mt-0 w-full outline-none">
      {homePanel}
    </TabsContent>
    <TabsContent value="away" className="mt-0 w-full outline-none">
      {awayPanel}
    </TabsContent>
  </Tabs>
);
