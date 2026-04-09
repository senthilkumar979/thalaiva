"use client";

import { Filter, Search } from "lucide-react";
import type { PlayerTier } from "@/models/Player";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type TierFilter = "all" | PlayerTier;

interface PlayersExplorerToolbarProps {
  query: string;
  onQueryChange: (v: string) => void;
  tier: TierFilter;
  onTierChange: (v: TierFilter) => void;
  variant: "default" | "hub";
}

const TIER_PILLS: { id: TierFilter; label: string }[] = [
  { id: "all", label: "All tiers" },
  { id: 1, label: "T1" },
  { id: 3, label: "T3" },
  { id: 5, label: "T5" },
];

export const PlayersExplorerToolbar = ({
  query,
  onQueryChange,
  tier,
  onTierChange,
  variant,
}: PlayersExplorerToolbarProps) => {
  const hub = variant === "hub";
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="relative max-w-md flex-1">
        <Search
          className={cn(
            "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2",
            hub ? "text-white/45" : "text-muted-foreground"
          )}
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Search player or franchise…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className={cn(
            "h-11 rounded-full pl-10 pr-4 shadow-sm",
            hub
              ? "border-white/15 bg-white/[0.06] text-white placeholder:text-white/40 focus-visible:ring-amber-400/30"
              : "border-border/80 bg-background/80"
          )}
          aria-label="Search players"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "flex items-center gap-1 text-xs font-medium",
            hub ? "text-white/50" : "text-muted-foreground"
          )}
        >
          <Filter className="size-3.5" aria-hidden />
          Tier
        </span>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by tier">
          {TIER_PILLS.map((p) => (
            <button
              key={String(p.id)}
              type="button"
              onClick={() => onTierChange(p.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                hub
                  ? tier === p.id
                    ? "border-amber-400/40 bg-amber-500/15 text-amber-100 shadow-sm ring-1 ring-amber-400/25"
                    : "border-white/12 bg-white/[0.04] text-white/55 hover:bg-white/[0.08] hover:text-white/80"
                  : tier === p.id
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
  );
};
