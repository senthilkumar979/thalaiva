"use client";

import { PlayerCard } from "@/components/PlayerCard";
import type { PlayerWithFranchise } from "@/hooks/usePlayersByTier";
import type { TierKey } from "@/hooks/useTeamBuilder";
import { cn } from "@/lib/utils";

interface TierColumnProps {
  title: string;
  tier: TierKey;
  /** Full tier list for franchise duplicate rules (use unfiltered pool). */
  franchisePool: PlayerWithFranchise[];
  players: PlayerWithFranchise[];
  selectedIds: string[];
  onToggle: (tier: TierKey, player: PlayerWithFranchise) => void;
  tone?: "default" | "enter";
  isLoading?: boolean;
  emptyHint?: string;
}

function franchiseKey(p: PlayerWithFranchise): string {
  if (p.franchise && typeof p.franchise === "object") return p.franchise.shortCode;
  return String(p.franchise);
}

export const TierColumn = ({
  title,
  tier,
  franchisePool,
  players,
  selectedIds,
  onToggle,
  tone = "default",
  isLoading,
  emptyHint = "No players match this filter.",
}: TierColumnProps) => {
  const selectedFranchises = new Set(
    selectedIds
      .map((id) => franchisePool.find((p) => p._id === id))
      .filter(Boolean)
      .map((p) => franchiseKey(p as PlayerWithFranchise))
  );

  const enter = tone === "enter";

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "text-sm font-semibold",
          enter ? "text-white/90 tracking-tight" : "text-foreground"
        )}
      >
        {title}
      </div>
      <div className="flex max-h-[min(420px,50vh)] flex-col gap-2 overflow-y-auto pr-1">
        {isLoading && (
          <p className={cn("rounded-xl border px-3 py-8 text-center text-xs", enter ? "border-white/15 text-white/45" : "border-border text-muted-foreground")}>
            Loading players…
          </p>
        )}
        {!isLoading && players.length === 0 && (
          <p className={cn("rounded-xl border border-dashed px-3 py-8 text-center text-xs", enter ? "border-white/20 text-white/45" : "border-border text-muted-foreground")}>
            {emptyHint}
          </p>
        )}
        {!isLoading &&
          players.map((p) => {
            const sel = selectedIds.includes(p._id);
            const key = franchiseKey(p);
            const blocked = !sel && selectedFranchises.has(key);
            return (
              <PlayerCard
                key={p._id}
                player={p}
                isSelected={sel}
                isBlocked={blocked}
                tone={tone}
                onToggle={() => onToggle(tier, p)}
              />
            );
          })}
      </div>
    </div>
  );
};
