"use client";

import { useMemo, useState } from "react";
import { Filter, Search } from "lucide-react";
import type { PlayerTier } from "@/models/Player";
import { Input } from "@/components/ui/input";
import type { HomeFranchiseGroup } from "@/lib/queries/homePlayers";
import { cn } from "@/lib/utils";
import { FranchiseRosterCard } from "./FranchiseRosterCard";

const ACCENT_LEFT = [
  "border-l-sky-500",
  "border-l-violet-500",
  "border-l-emerald-500",
  "border-l-amber-500",
  "border-l-rose-500",
  "border-l-cyan-500",
  "border-l-fuchsia-500",
  "border-l-lime-600",
] as const;

function accentForFranchiseId(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h + id.charCodeAt(i)) % 997;
  return ACCENT_LEFT[h % ACCENT_LEFT.length];
}

type TierFilter = "all" | PlayerTier;

interface HomePlayersExplorerProps {
  teams: HomeFranchiseGroup[];
}

export const HomePlayersExplorer = ({ teams }: HomePlayersExplorerProps) => {
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState<TierFilter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return teams
      .map((team) => ({
        ...team,
        players: team.players.filter((p) => {
          const tierOk = tier === "all" || p.tier === tier;
          if (!tierOk) return false;
          if (!q) return true;
          return (
            p.name.toLowerCase().includes(q) ||
            team.name.toLowerCase().includes(q) ||
            team.shortCode.toLowerCase().includes(q)
          );
        }),
      }))
      .filter((t) => t.players.length > 0);
  }, [teams, query, tier]);

  const totalShown = useMemo(
    () => filtered.reduce((n, t) => n + t.players.length, 0),
    [filtered]
  );

  const tierPills: { id: TierFilter; label: string }[] = [
    { id: "all", label: "All tiers" },
    { id: 1, label: "T1" },
    { id: 3, label: "T3" },
    { id: 5, label: "T5" },
  ];

  if (teams.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed bg-muted/30 px-6 py-12 text-center text-sm text-muted-foreground">
        Player pool is empty for now — check back after squads are loaded.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="relative max-w-md flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search player or franchise…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-11 rounded-full border-border/80 bg-background/80 pl-10 pr-4 shadow-sm"
            aria-label="Search players"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <Filter className="size-3.5" aria-hidden />
            Tier
          </span>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by tier">
            {tierPills.map((p) => (
              <button
                key={String(p.id)}
                type="button"
                onClick={() => setTier(p.id)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                  tier === p.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border/80 bg-muted/40 text-muted-foreground hover:bg-muted"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Showing{" "}
        <span className="font-semibold tabular-nums text-foreground">{totalShown}</span> player
        {totalShown === 1 ? "" : "s"} across{" "}
        <span className="font-semibold tabular-nums text-foreground">{filtered.length}</span>{" "}
        franchise{filtered.length === 1 ? "" : "s"}
      </p>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed bg-muted/20 px-6 py-10 text-center text-sm text-muted-foreground">
          No players match your filters. Try a different search or tier.
        </p>
      ) : (
        <div className="flex flex-col gap-8">
          {filtered.map((team) => (
            <FranchiseRosterCard
              key={team.id}
              name={team.name}
              shortCode={team.shortCode}
              logoUrl={team.logoUrl}
              players={team.players}
              accentClass={accentForFranchiseId(team.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
