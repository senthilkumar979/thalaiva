"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlayerTier } from "@/models/Player";

export function PlayerPoolTierStars({ tier, hub }: { tier: PlayerTier; hub: boolean }) {
  const filled = tier;
  return (
    <div
      className="flex items-center gap-1.5"
      title={`Draft tier ${tier} (${filled} star${filled === 1 ? "" : "s"})`}
    >
      <span className="flex gap-px" aria-hidden>
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={cn(
              "size-3 shrink-0",
              i < filled
                ? "fill-amber-400 text-amber-500 drop-shadow-[0_0_6px_rgba(251,191,36,0.35)]"
                : hub
                  ? "fill-white/10 text-white/20"
                  : "fill-muted/25 text-muted-foreground/30"
            )}
            strokeWidth={i < filled ? 0 : 1}
          />
        ))}
      </span>
      <span
        className={cn(
          "text-[9px] font-bold tabular-nums tracking-wide",
          hub ? "text-black/[0.45]" : "text-muted-foreground"
        )}
      >
        T{tier}
      </span>
    </div>
  );
}
