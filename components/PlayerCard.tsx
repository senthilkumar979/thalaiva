"use client";

import { FranchiseMark } from "@/components/FranchiseMark";
import { RoleBadge } from "@/components/RoleBadge";
import { cn } from "@/lib/utils";
import type { PlayerWithFranchise } from "@/hooks/usePlayersByTier";

interface PlayerCardProps {
  player: PlayerWithFranchise;
  isSelected: boolean;
  isBlocked: boolean;
  onToggle: () => void;
  tone?: "default" | "enter";
}

export const PlayerCard = ({
  player,
  isSelected,
  isBlocked,
  onToggle,
  tone = "default",
}: PlayerCardProps) => {
  const fr = player.franchise && typeof player.franchise === "object" ? player.franchise : null;
  const enter = tone === "enter";

  return (
    <button
      type="button"
      disabled={isBlocked && !isSelected}
      onClick={onToggle}
      className={cn(
        "flex w-full gap-2.5 border px-3 py-2.5 text-left text-sm transition-all",
        enter
          ? "rounded-xl border-white/15 bg-white/[0.06] text-white shadow-sm backdrop-blur-sm hover:border-white/25 hover:bg-white/10"
          : "gap-2 rounded-md border border-transparent py-2 text-foreground hover:bg-muted",
        enter && isSelected && "border-white/50 bg-white/15 ring-1 ring-white/20",
        enter && isBlocked && !isSelected && "cursor-not-allowed opacity-35",
        !enter && isSelected && "border-primary bg-primary/10",
        !enter && isBlocked && !isSelected && "cursor-not-allowed opacity-40",
        !enter && !isBlocked && !isSelected && "hover:bg-muted"
      )}
    >
      {fr && (
        <FranchiseMark
          name={fr.name}
          shortCode={fr.shortCode}
          logoUrl={fr.logoUrl}
          size="md"
          className={cn(!enter && "ring-border bg-muted text-foreground")}
        />
      )}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <span className={cn("line-clamp-2 font-semibold leading-snug", enter && "tracking-tight")}>
            {player.name}
          </span>
          <RoleBadge role={player.role} tone={enter ? "enter" : "default"} variant="short" />
        </div>
        {fr && (
          <p
            className={cn("truncate text-[11px]", enter ? "text-white/55" : "text-muted-foreground")}
          >
            {fr.shortCode} · {fr.name}
          </p>
        )}
      </div>
    </button>
  );
};
