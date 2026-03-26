"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PlayerWithFranchise } from "@/hooks/usePlayersByTier";

interface PlayerCardProps {
  player: PlayerWithFranchise;
  isSelected: boolean;
  isBlocked: boolean;
  onToggle: () => void;
}

export const PlayerCard = ({ player, isSelected, isBlocked, onToggle }: PlayerCardProps) => (
  <button
    type="button"
    disabled={isBlocked && !isSelected}
    onClick={onToggle}
    className={cn(
      "flex w-full flex-col gap-1 rounded-md border px-3 py-2 text-left text-sm transition-colors",
      isSelected && "border-primary bg-primary/10",
      isBlocked && !isSelected && "cursor-not-allowed opacity-40",
      !isBlocked && !isSelected && "hover:bg-muted"
    )}
  >
    <span className="font-medium">{player.name}</span>
    <Badge variant="secondary" className="w-fit text-[10px] uppercase">
      {player.franchise && typeof player.franchise === "object"
        ? player.franchise.shortCode
        : "—"}
    </Badge>
  </button>
);
