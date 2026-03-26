"use client";

import { CompositionRow } from "@/components/EnterSquadSidebarParts";
import type { SquadRoleCounts } from "@/lib/squadComposition";
import { SQUAD_RULES } from "@/lib/squadComposition";
import { cn } from "@/lib/utils";

interface SquadCompositionPanelProps {
  counts: SquadRoleCounts;
  full: boolean;
  compositionOk: boolean;
}

export const SquadCompositionPanel = ({
  counts,
  full,
  compositionOk,
}: SquadCompositionPanelProps) => (
  <div className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-3">
    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/45">Role balance (full squad)</p>
    <div className="space-y-1.5">
      <CompositionRow label="Batters" labelTone="bat" current={counts.bat} min={SQUAD_RULES.minBat} />
      <CompositionRow label="Bowlers" labelTone="bowl" current={counts.bowl} min={SQUAD_RULES.minBowl} />
      <CompositionRow
        label="Wicket-keepers"
        labelTone="wk"
        current={counts.wk}
        min={SQUAD_RULES.minWk}
      />
      <CompositionRow
        label="All-rounders"
        labelTone="allrounder"
        current={counts.allrounder}
        max={SQUAD_RULES.maxAllrounder}
        isMaxRule
      />
    </div>
    {full && (
      <p
        className={cn(
          "pt-1 text-[11px] leading-snug",
          compositionOk ? "text-emerald-300/80" : "text-amber-200/85"
        )}
      >
        {compositionOk ? "Composition rules satisfied." : "Adjust picks to meet role minimums and AR cap."}
      </p>
    )}
  </div>
);
