"use client";

import { cn } from "@/lib/utils";

interface TeamTotal {
  id: string;
  shortCode: string;
  total: number;
}

interface AdminScoreTotalsBarProps {
  grandTotal: number;
  teams: [TeamTotal, TeamTotal];
}

export const AdminScoreTotalsBar = ({ grandTotal, teams }: AdminScoreTotalsBarProps) => (
  <div className="grid gap-4 sm:grid-cols-3">
    <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-4 ring-1 ring-emerald-500/15">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-800/80 dark:text-emerald-300/90">
        Match total
      </p>
      <p className="mt-1 tabular-nums text-3xl font-bold tracking-tight text-emerald-900 dark:text-emerald-100">
        {grandTotal}
        <span className="ml-1 text-base font-semibold text-muted-foreground">pts</span>
      </p>
      <p className="mt-2 text-xs text-muted-foreground">All players (incl. +2 participation each)</p>
    </div>
    {teams.map((t) => (
      <div
        key={t.id}
        className={cn(
          "rounded-xl border border-border/80 bg-muted/20 px-4 py-4",
          "ring-1 ring-border/40"
        )}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {t.shortCode}
        </p>
        <p className="mt-1 tabular-nums text-2xl font-semibold tracking-tight">
          {t.total}
          <span className="ml-1 text-sm font-medium text-muted-foreground">pts</span>
        </p>
      </div>
    ))}
  </div>
);
