"use client";

import { PlayerCard } from "@/components/PlayerCard";
import type { PlayerWithFranchise } from "@/hooks/usePlayersByTier";
import type { TierKey } from "@/hooks/useTeamBuilder";

interface TierColumnProps {
  title: string;
  tier: TierKey;
  players: PlayerWithFranchise[];
  selectedIds: string[];
  onToggle: (tier: TierKey, player: PlayerWithFranchise) => void;
}

function franchiseKey(p: PlayerWithFranchise): string {
  if (p.franchise && typeof p.franchise === "object") return p.franchise.shortCode;
  return String(p.franchise);
}

export const TierColumn = ({ title, tier, players, selectedIds, onToggle }: TierColumnProps) => {
  const selectedFranchises = new Set(
    selectedIds
      .map((id) => players.find((p) => p._id === id))
      .filter(Boolean)
      .map((p) => franchiseKey(p as PlayerWithFranchise))
  );

  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold">{title}</div>
      <div className="flex max-h-[420px] flex-col gap-2 overflow-y-auto pr-1">
        {players.map((p) => {
          const sel = selectedIds.includes(p._id);
          const key = franchiseKey(p);
          const blocked = !sel && selectedFranchises.has(key);
          return (
            <PlayerCard
              key={p._id}
              player={p}
              isSelected={sel}
              isBlocked={blocked}
              onToggle={() => onToggle(tier, p)}
            />
          );
        })}
      </div>
    </div>
  );
};
