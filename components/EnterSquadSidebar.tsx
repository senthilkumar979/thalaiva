"use client";

import { Crown, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PickRow, TierProgress } from "@/components/EnterSquadSidebarParts";
import { SquadCompositionPanel } from "@/components/SquadCompositionPanel";
import type { PlayerWithFranchise } from "@/hooks/usePlayersByTier";
import type { TierKey } from "@/hooks/useTeamBuilder";
import type { SquadRoleCounts } from "@/lib/squadComposition";

const ACCENT = "#19398a";

interface EnterSquadSidebarProps {
  teamName: string;
  onTeamNameChange: (v: string) => void;
  tier1Ids: string[];
  tier2Ids: string[];
  tier3Ids: string[];
  playerById: Map<string, PlayerWithFranchise>;
  captain: string | null;
  onCaptain: (id: string) => void;
  onRemove: (tier: TierKey, playerId: string) => void;
  onSubmit: () => void;
  compositionCounts: SquadRoleCounts;
  compositionOk: boolean;
  canSubmit: boolean;
}

export const EnterSquadSidebar = ({
  teamName,
  onTeamNameChange,
  tier1Ids,
  tier2Ids,
  tier3Ids,
  playerById,
  captain,
  onCaptain,
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

      <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.12] via-white/[0.05] to-transparent p-[1px] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]">
        <div className="rounded-[15px] bg-[#0a2469]/55 px-4 py-4 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
              <Trophy className="size-4 text-amber-300/90" />
            </span>
            <div>
              <Label htmlFor="enter-team-name" className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
                Squad name
              </Label>
              <p className="text-[11px] text-white/40">Shown on leaderboards & matchups</p>
            </div>
          </div>
          <Input
            id="enter-team-name"
            value={teamName}
            onChange={(e) => onTeamNameChange(e.target.value)}
            placeholder="Name your dream XI"
            className="mt-3 h-12 border-0 border-b border-white/20 bg-transparent px-0 text-lg font-semibold tracking-tight text-white shadow-none placeholder:text-white/30 focus-visible:border-amber-300/50 focus-visible:ring-0"
          />
        </div>
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
                    onCaptain={() => onCaptain(id)}
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
          <Crown className="mb-1 inline size-3.5 text-amber-300" /> Tap a crown to set your captain
          (2× points). Any selected player can be captain.
        </div>
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
