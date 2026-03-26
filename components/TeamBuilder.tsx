"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EnterPlayerPool } from "@/components/EnterPlayerPool";
import type { FranchiseOption } from "@/lib/franchiseTypes";
import { EnterSquadSidebar } from "@/components/EnterSquadSidebar";
import type { PlayerWithFranchise } from "@/hooks/usePlayersByTier";
import { usePlayersByTier } from "@/hooks/usePlayersByTier";
import type { TierKey } from "@/hooks/useTeamBuilder";
import { useTeamBuilder } from "@/hooks/useTeamBuilder";
import {
  countRolesFromIds,
  squadCompositionMessages,
  squadCompositionSatisfied,
  type RoleFilterValue,
} from "@/lib/squadComposition";

interface TeamBuilderProps {
  competitionId: string;
  deadlinePassed: boolean;
}

function filterByFranchise(players: PlayerWithFranchise[], team: string): PlayerWithFranchise[] {
  if (team === "all") return players;
  return players.filter((p) => {
    if (p.franchise && typeof p.franchise === "object") return p.franchise.shortCode === team;
    return false;
  });
}

function filterByRole(players: PlayerWithFranchise[], role: RoleFilterValue): PlayerWithFranchise[] {
  if (role === "all") return players;
  return players.filter((p) => p.role === role);
}

export const TeamBuilder = ({ competitionId, deadlinePassed }: TeamBuilderProps) => {
  const router = useRouter();
  const p1 = usePlayersByTier(1);
  const p2 = usePlayersByTier(3);
  const p3 = usePlayersByTier(5);
  const tb = useTeamBuilder();
  const [teamName, setTeamName] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState<RoleFilterValue>("all");

  const playerById = useMemo(() => {
    const m = new Map<string, PlayerWithFranchise>();
    for (const p of [...p1.players, ...p2.players, ...p3.players]) m.set(p._id, p);
    return m;
  }, [p1.players, p2.players, p3.players]);

  const franchiseOptions = useMemo((): FranchiseOption[] => {
    const map = new Map<string, { name: string; logoUrl?: string }>();
    for (const p of [...p1.players, ...p2.players, ...p3.players]) {
      if (p.franchise && typeof p.franchise === "object") {
        const prev = map.get(p.franchise.shortCode);
        const logoUrl = p.franchise.logoUrl || prev?.logoUrl;
        map.set(p.franchise.shortCode, { name: p.franchise.name, logoUrl });
      }
    }
    return Array.from(map.entries())
      .map(([code, v]) => ({ code, name: v.name, logoUrl: v.logoUrl }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [p1.players, p2.players, p3.players]);

  const f1 = useMemo(
    () => filterByRole(filterByFranchise(p1.players, teamFilter), roleFilter),
    [p1.players, teamFilter, roleFilter]
  );
  const f2 = useMemo(
    () => filterByRole(filterByFranchise(p2.players, teamFilter), roleFilter),
    [p2.players, teamFilter, roleFilter]
  );
  const f3 = useMemo(
    () => filterByRole(filterByFranchise(p3.players, teamFilter), roleFilter),
    [p3.players, teamFilter, roleFilter]
  );

  const allIds = useMemo(
    () => [...tb.tier1, ...tb.tier2, ...tb.tier3],
    [tb.tier1, tb.tier2, tb.tier3]
  );

  const compositionCounts = useMemo(() => countRolesFromIds(allIds, playerById), [allIds, playerById]);

  const compositionOk = useMemo(
    () => (allIds.length === 15 ? squadCompositionSatisfied(compositionCounts) : false),
    [allIds.length, compositionCounts]
  );

  const canSubmit = useMemo(() => {
    if (allIds.length !== 15 || !teamName.trim() || !tb.captain) return false;
    if (!allIds.includes(tb.captain)) return false;
    return compositionOk;
  }, [allIds, teamName, tb.captain, compositionOk]);

  const { captain: capId, allSelected: capPool, setCaptain: setCap } = tb;
  useEffect(() => {
    if (capId && !capPool.includes(capId)) setCap(null);
  }, [capId, capPool, setCap]);

  const handleTierToggle = useCallback(
    (tier: TierKey, player: PlayerWithFranchise, pool: PlayerWithFranchise[]) => {
      const inTier =
        (tier === 1 && tb.tier1.includes(player._id)) ||
        (tier === 3 && tb.tier2.includes(player._id)) ||
        (tier === 5 && tb.tier3.includes(player._id));
      if (!inTier && player.role === "allrounder") {
        const ar = allIds.filter((id) => playerById.get(id)?.role === "allrounder").length;
        if (ar >= 3) {
          toast.error("You can pick at most 3 all-rounders");
          return;
        }
      }
      tb.toggle(tier, player, pool);
    },
    [tb, allIds, playerById]
  );

  const submit = async () => {
    if (!teamName.trim() || !tb.captain) {
      toast.error("Team name and captain required");
      return;
    }
    if (!compositionOk) {
      toast.error(squadCompositionMessages(compositionCounts).join(" ") || "Invalid squad composition");
      return;
    }
    const res = await fetch(`/api/competitions/${competitionId}/entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customTeamName: teamName.trim(),
        tier1Players: tb.tier1,
        tier2Players: tb.tier2,
        tier3Players: tb.tier3,
        captain: tb.captain,
      }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast.error(j.error ?? "Could not save team");
      return;
    }
    toast.success("Team saved");
    router.push(`/competitions/${competitionId}`);
  };

  const removePlayer = useCallback(
    (tier: TierKey, playerId: string) => {
      const pool = tier === 1 ? p1.players : tier === 3 ? p2.players : p3.players;
      const pl = pool.find((x) => x._id === playerId);
      if (pl) tb.toggle(tier, pl, pool);
    },
    [p1.players, p2.players, p3.players, tb]
  );

  if (deadlinePassed) {
    return <p className="text-sm text-white/70">The entry deadline has passed.</p>;
  }

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
      <EnterSquadSidebar
        teamName={teamName}
        onTeamNameChange={setTeamName}
        tier1Ids={tb.tier1}
        tier2Ids={tb.tier2}
        tier3Ids={tb.tier3}
        playerById={playerById}
        captain={tb.captain}
        onCaptain={tb.setCaptain}
        onRemove={removePlayer}
        onSubmit={submit}
        compositionCounts={compositionCounts}
        compositionOk={compositionOk}
        canSubmit={canSubmit}
      />
      <EnterPlayerPool
        teamFilter={teamFilter}
        onTeamFilterChange={setTeamFilter}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        franchiseOptions={franchiseOptions}
        f1={f1}
        f2={f2}
        f3={f3}
        p1={p1}
        p2={p2}
        p3={p3}
        tb={tb}
        onTierToggle={handleTierToggle}
      />
    </div>
  );
};
