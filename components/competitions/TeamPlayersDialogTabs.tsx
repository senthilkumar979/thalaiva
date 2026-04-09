"use client";

import {
  SubmittedPlayersTable,
  type SubmittedPlayerRow,
} from "@/components/competitions/SubmittedPlayersTable";
import { TeamSwapAuditSection, type TeamSwapAuditRow } from "@/components/competitions/TeamSwapAuditSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function tierLabelFromPlayerTier(tier: number | string | undefined) {
  if (!tier) return null;
  if (typeof tier === "string") tier = parseInt(tier, 10);
  if (tier === 1) return "Tier 1";
  if (tier === 2) return "Tier 2";
  if (tier === 3) return "Tier 3";
  return `Tier ${tier}`;
}

interface TeamPlayersDialogTabsProps {
  rows: SubmittedPlayerRow[];
  swapRows: TeamSwapAuditRow[];
}

const tabTriggerClass =
  "shrink-0 whitespace-nowrap rounded-md px-3 text-sm text-white/50 hover:text-white/80 data-[active]:text-white data-[active]:after:bg-amber-400/85 dark:data-[active]:bg-transparent dark:data-[active]:text-white sm:px-4 sm:text-base";

export const TeamPlayersDialogTabs = ({ rows, swapRows }: TeamPlayersDialogTabsProps) => (
  <Tabs defaultValue="squad" className="flex min-h-0 flex-1 flex-col text-white">
    <div className="shrink-0 border-b border-white/10 bg-black/20 px-3 pt-3 backdrop-blur-sm sm:px-6">
      <TabsList
        variant="line"
        className="h-9 w-full min-w-0 justify-start gap-1 overflow-x-auto overflow-y-hidden bg-transparent p-0 [-webkit-overflow-scrolling:touch] [scrollbar-width:thin] sm:w-auto"
      >
        <TabsTrigger value="squad" className={tabTriggerClass}>
          Squad
          {rows.length > 0 ? (
            <span className="ml-1.5 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-white/60 tabular-nums">
              {rows.length}
            </span>
          ) : null}
        </TabsTrigger>
        <TabsTrigger value="transfers" className={tabTriggerClass}>
          Swaps & penalties
          {swapRows.length > 0 ? (
            <span className="ml-1.5 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-white/60 tabular-nums">
              {swapRows.length}
            </span>
          ) : null}
        </TabsTrigger>
      </TabsList>
    </div>

    <TabsContent
      value="squad"
      className="mt-0 min-h-0 flex-1 overflow-y-auto px-3 py-3 data-[state=inactive]:hidden sm:px-6 sm:py-4"
    >
      {rows.length > 0 ? (
        <div className="max-w-full rounded-xl border border-white/10 bg-black/25 p-1 shadow-inner shadow-black/20 backdrop-blur-sm">
          <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] rounded-lg">
            <div className="min-w-0 px-2 py-2 sm:px-4 sm:py-4">
              <SubmittedPlayersTable
                rows={rows.map((row: SubmittedPlayerRow & { tier?: number }) => ({
                  ...row,
                  tierLabel: tierLabelFromPlayerTier(row.tier),
                }))}
                variant="competitionEntry"
              />
            </div>
          </div>
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] py-12 text-center text-sm text-white/55">
          No player list returned.
        </p>
      )}
    </TabsContent>

    <TabsContent
      value="transfers"
      className="mt-0 min-h-0 flex-1 overflow-y-auto px-3 py-3 data-[state=inactive]:hidden sm:px-6 sm:py-4"
    >
      <TeamSwapAuditSection rows={swapRows} showTitle={false} appearance="competition" />
    </TabsContent>
  </Tabs>
);
