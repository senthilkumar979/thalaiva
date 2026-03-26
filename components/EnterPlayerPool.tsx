"use client";

import { EnterPoolFilters } from "@/components/EnterPoolFilters";
import { TierColumn } from "@/components/TierColumn";
import type { PlayerWithFranchise } from "@/hooks/usePlayersByTier";
import { usePlayersByTier } from "@/hooks/usePlayersByTier";
import type { TierKey } from "@/hooks/useTeamBuilder";
import { useTeamBuilder } from "@/hooks/useTeamBuilder";
import type { FranchiseOption } from "@/lib/franchiseTypes";
import type { RoleFilterValue } from "@/lib/squadComposition";

type TeamBuilderState = ReturnType<typeof useTeamBuilder>;
type TierHook = ReturnType<typeof usePlayersByTier>;

interface EnterPlayerPoolProps {
  teamFilter: string;
  onTeamFilterChange: (v: string) => void;
  roleFilter: RoleFilterValue;
  onRoleFilterChange: (v: RoleFilterValue) => void;
  franchiseOptions: FranchiseOption[];
  f1: PlayerWithFranchise[];
  f2: PlayerWithFranchise[];
  f3: PlayerWithFranchise[];
  p1: TierHook;
  p2: TierHook;
  p3: TierHook;
  tb: TeamBuilderState;
  onTierToggle: (tier: TierKey, player: PlayerWithFranchise, pool: PlayerWithFranchise[]) => void;
}

export const EnterPlayerPool = ({
  teamFilter,
  onTeamFilterChange,
  roleFilter,
  onRoleFilterChange,
  franchiseOptions,
  f1,
  f2,
  f3,
  p1,
  p2,
  p3,
  tb,
  onTierToggle,
}: EnterPlayerPoolProps) => (
  <div className="min-w-0 flex-1 space-y-6">
    <EnterPoolFilters
      teamFilter={teamFilter}
      onTeamFilterChange={onTeamFilterChange}
      roleFilter={roleFilter}
      onRoleFilterChange={onRoleFilterChange}
      franchiseOptions={franchiseOptions}
    />

    <div className="grid gap-6 lg:grid-cols-3">
      <TierColumn
        title="Tier 1 — 1 pt"
        tier={1}
        franchisePool={p1.players}
        players={f1}
        selectedIds={tb.tier1}
        onToggle={(tier: TierKey, pl) => onTierToggle(tier, pl, p1.players)}
        tone="enter"
        isLoading={p1.isLoading}
        emptyHint="No players in this tier for the selected filters."
      />
      <TierColumn
        title="Tier 2 — 3 pt"
        tier={3}
        franchisePool={p2.players}
        players={f2}
        selectedIds={tb.tier2}
        onToggle={(tier: TierKey, pl) => onTierToggle(tier, pl, p2.players)}
        tone="enter"
        isLoading={p2.isLoading}
        emptyHint="No players in this tier for the selected filters."
      />
      <TierColumn
        title="Tier 3 — 5 pt"
        tier={5}
        franchisePool={p3.players}
        players={f3}
        selectedIds={tb.tier3}
        onToggle={(tier: TierKey, pl) => onTierToggle(tier, pl, p3.players)}
        tone="enter"
        isLoading={p3.isLoading}
        emptyHint="No players in this tier for the selected filters."
      />
    </div>

    {(p1.error || p2.error || p3.error) && (
      <p className="text-sm text-red-300/90">{p1.error ?? p2.error ?? p3.error}</p>
    )}
  </div>
);
