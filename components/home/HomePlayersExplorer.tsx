"use client";

import { useMemo, useState } from "react";
import type { PlayerTier } from "@/models/Player";
import type { HomeFranchiseGroup } from "@/lib/queries/homePlayers";
import { cn } from "@/lib/utils";
import { FranchiseRosterCard } from "./FranchiseRosterCard";
import { PlayersExplorerToolbar } from "./PlayersExplorerToolbar";

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
  /** Dark glass styling for /players hub (matches competitions lobby). */
  variant?: "default" | "hub";
}

export const HomePlayersExplorer = ({ teams, variant = "default" }: HomePlayersExplorerProps) => {
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState<TierFilter>("all");
  const hub = variant === "hub";

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

  if (teams.length === 0) {
    return (
      <p
        className={cn(
          "rounded-2xl border border-dashed px-6 py-12 text-center text-sm",
          hub
            ? "border-white/15 bg-white/[0.02] text-white/55"
            : "bg-muted/30 text-muted-foreground"
        )}
      >
        Player pool is empty for now — check back after squads are loaded.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <PlayersExplorerToolbar
        query={query}
        onQueryChange={setQuery}
        tier={tier}
        onTierChange={setTier}
        variant={variant}
      />

      <p className={cn("text-xs", hub ? "text-white/45" : "text-muted-foreground")}>
        Showing{" "}
        <span className={cn("font-semibold tabular-nums", hub ? "text-white" : "text-foreground")}>
          {totalShown}
        </span>{" "}
        player{totalShown === 1 ? "" : "s"} across{" "}
        <span className={cn("font-semibold tabular-nums", hub ? "text-white" : "text-foreground")}>
          {filtered.length}
        </span>{" "}
        franchise{filtered.length === 1 ? "" : "s"}
      </p>

      {filtered.length === 0 ? (
        <p
          className={cn(
            "rounded-2xl border border-dashed px-6 py-10 text-center text-sm",
            hub
              ? "border-white/15 bg-white/[0.02] text-white/55"
              : "bg-muted/20 text-muted-foreground"
          )}
        >
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
              variant={variant}
            />
          ))}
        </div>
      )}
    </div>
  );
};
