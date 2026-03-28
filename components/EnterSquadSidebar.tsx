"use client";

import { Crown, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PickRow, TierProgress } from "@/components/EnterSquadSidebarParts";
import { SquadCompositionPanel } from "@/components/SquadCompositionPanel";
import type { PlayerWithFranchise } from "@/hooks/usePlayersByTier";
import type { TierKey } from "@/hooks/useTeamBuilder";
import type { SquadRoleCounts } from "@/lib/squadComposition";

const ACCENT = "#19398a";

interface EnterSquadSidebarProps {
  /** Used only for submit hints (name lives in EnterTeamNameField). */
  teamName: string;
  tier1Ids: string[];
  tier2Ids: string[];
  tier3Ids: string[];
  playerById: Map<string, PlayerWithFranchise>;
  captain: string | null;
  viceCaptain: string | null;
  onCaptain: (id: string) => void;
  onViceCaptain: (id: string) => void;
  onRemove: (tier: TierKey, playerId: string) => void;
  onSubmit: () => void;
  compositionCounts: SquadRoleCounts;
  compositionOk: boolean;
  canSubmit: boolean;
}

export const EnterSquadSidebar = ({
  teamName,
  tier1Ids,
  tier2Ids,
  tier3Ids,
  playerById,
  captain,
  viceCaptain,
  onCaptain,
  onViceCaptain,
  onRemove,
  onSubmit,
  compositionCounts,
  compositionOk,
  canSubmit,
}: EnterSquadSidebarProps) => {
  const tiers: { key: TierKey; label: string; pts: string; ids: string[] }[] = [
    { key: 1, label: "Tier 1", pts: "1 pt each", ids: tier1Ids },
    { key: 3, label: "Tier 2", pts: "3 pt each", ids: tier2Ids },
    { key: 5, label: "Tier 3", pts: "5 pt each", ids: tier3Ids },
  ];

  const total = tier1Ids.length + tier2Ids.length + tier3Ids.length;
  const full = tier1Ids.length === 5 && tier2Ids.length === 5 && tier3Ids.length === 5;

  return (
    <aside className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.12] to-white/[0.04] p-5 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.45)] backdrop-blur-md lg:sticky lg:top-6 lg:max-h-[calc(100vh-8rem)] lg:min-w-[min(100%,320px)] lg:max-w-[360px] lg:overflow-y-auto">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">Your squad</p>
        <h2 className="mt-1 font-semibold text-xl tracking-tight text-white">Draft board</h2>
        <p className="mt-1 text-sm text-white/60">
          {total}/15 picks · unique franchise per tier column
        </p>
      </div>

      <SquadCompositionPanel counts={compositionCounts} full={full} compositionOk={compositionOk} />

      <div className="space-y-3 rounded-xl bg-black/15 p-3">
        {tiers.map((t) => (
          <TierProgress key={t.key} label={t.label} count={t.ids.length} points={t.pts} />
        ))}
      </div>

      <div className="space-y-4">
        {tiers.map((t) => (
          <div key={t.key} className="space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-white/45">
              {t.label} · {t.pts}
            </div>
            <div className="space-y-2">
              {t.ids.length === 0 && (
                <p className="rounded-xl border border-dashed border-white/15 px-3 py-6 text-center text-xs text-white/40">
                  No players yet
                </p>
              )}
              {t.ids.map((id) => {
                const pl = playerById.get(id);
                if (!pl) return null;
                return (
                  <PickRow
                    key={id}
                    player={pl}
                    showCaptain
                    isCaptain={captain === id}
                    isViceCaptain={viceCaptain === id}
                    onCaptain={() => onCaptain(id)}
                    onViceCaptain={() => onViceCaptain(id)}
                    onRemove={() => onRemove(t.key, id)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {total > 0 && (
        <div className="rounded-xl border border-amber-400/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-100/90">
          <Crown className="mb-1 inline size-3.5 text-amber-300" /> Crown = captain (×2).{" "}
          <Shield className="mb-0.5 inline size-3.5 text-sky-300" /> Shield = vice-captain (×1.5). Vice must be a
          different franchise than captain.
        </div>
      )}

      {full && compositionOk && (!teamName.trim() || !captain || !viceCaptain) && (
        <p className="text-[11px] leading-snug text-amber-200/85">
          {!teamName.trim()
            ? "Enter a squad name above, then set captain and vice-captain — then submit."
            : !captain
              ? "Choose a captain (crown), then a vice-captain (shield) from a different franchise."
              : !viceCaptain
                ? "Choose a vice-captain (shield) — must not share the captain’s franchise."
                : null}
        </p>
      )}

      <div className="mt-auto border-t border-white/10 pt-4">
        <Button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className="h-11 w-full rounded-xl font-semibold text-[15px] shadow-lg transition-all disabled:opacity-40"
          style={{ backgroundColor: "#fff", color: ACCENT }}
        >
          Submit team
        </Button>
      </div>
    </aside>
  );
};
