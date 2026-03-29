"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EnterPlayerPool } from "@/components/EnterPlayerPool";
import { EnterSquadSidebar } from "@/components/EnterSquadSidebar";
import { EnterTeamNameField } from "@/components/EnterTeamNameField";
import type { FranchiseOption } from "@/lib/franchiseTypes";
import { filterPlayersByFranchise, filterPlayersByRole } from "@/lib/teamPlayerFilters";
import type { PlayerWithFranchise } from "@/hooks/usePlayersByTier";
import { usePlayersByTier } from "@/hooks/usePlayersByTier";
import { useCaptainViceSelection } from "@/hooks/useCaptainViceSelection";
import { useHydrateTeamFromEntry } from "@/hooks/useHydrateTeamFromEntry";
import type { TierKey } from "@/hooks/useTeamBuilder";
import { useTeamBuilder } from "@/hooks/useTeamBuilder";
import {
  countRolesFromIds,
  squadCompositionMessages,
  squadCompositionSatisfied,
  type RoleFilterValue,
} from "@/lib/squadComposition";
import { normalizePlayerId } from "@/lib/teamEntryHelpers";

interface TeamBuilderProps {
  competitionId: string;
  /** Deadline passed or admin froze entries — no saves allowed. */
  entriesClosed: boolean;
  /** Shown when entries are closed (optional detail). */
  entriesClosedReason?: "deadline" | "frozen";
  /** Defaults to competition overview. */
  afterSaveRedirectTo?: string;
}

export const TeamBuilder = ({
  competitionId,
  entriesClosed,
  entriesClosedReason = "deadline",
  afterSaveRedirectTo,
}: TeamBuilderProps) => {
  const router = useRouter();
  const p1 = usePlayersByTier(1);
  const p2 = usePlayersByTier(3);
  const p3 = usePlayersByTier(5);
  const tb = useTeamBuilder();
  const [teamName, setTeamName] = useState("");
  useHydrateTeamFromEntry(competitionId, tb.setTiers, tb.setCaptain, tb.setViceCaptain, setTeamName);
  const [teamFilter, setTeamFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState<RoleFilterValue>("all");

  const playerById = useMemo(() => {
    const m = new Map<string, PlayerWithFranchise>();
    for (const p of [...p1.players, ...p2.players, ...p3.players]) {
      m.set(normalizePlayerId(p._id), p);
    }
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
    () => filterPlayersByRole(filterPlayersByFranchise(p1.players, teamFilter), roleFilter),
    [p1.players, teamFilter, roleFilter]
  );
  const f2 = useMemo(
    () => filterPlayersByRole(filterPlayersByFranchise(p2.players, teamFilter), roleFilter),
    [p2.players, teamFilter, roleFilter]
  );
  const f3 = useMemo(
    () => filterPlayersByRole(filterPlayersByFranchise(p3.players, teamFilter), roleFilter),
    [p3.players, teamFilter, roleFilter]
  );

  const allIds = useMemo(
    () => [...tb.tier1, ...tb.tier2, ...tb.tier3],
    [tb.tier1, tb.tier2, tb.tier3]
  );

  const compositionCounts = useMemo(
    () => countRolesFromIds(allIds.map((x) => normalizePlayerId(x)), playerById),
    [allIds, playerById]
  );

  const compositionOk = useMemo(
    () => (allIds.length === 15 ? squadCompositionSatisfied(compositionCounts) : false),
    [allIds.length, compositionCounts]
  );

  const { onCaptain, onViceCaptain, captainViceFranchisesOk } = useCaptainViceSelection({
    playerById,
    captain: tb.captain,
    viceCaptain: tb.viceCaptain,
    setCaptain: tb.setCaptain,
    setViceCaptain: tb.setViceCaptain,
    capPool: allIds,
  });

  const selectedIdSet = useMemo(() => new Set(allIds.map((x) => normalizePlayerId(x))), [allIds]);

  const canSubmit =
    !entriesClosed &&
    compositionOk &&
    teamName.trim().length > 0 &&
    !!tb.captain &&
    selectedIdSet.has(normalizePlayerId(tb.captain)) &&
    !!tb.viceCaptain &&
    selectedIdSet.has(normalizePlayerId(tb.viceCaptain)) &&
    normalizePlayerId(tb.captain) !== normalizePlayerId(tb.viceCaptain) &&
    captainViceFranchisesOk;

  const handleTierToggle = useCallback(
    (tier: TierKey, player: PlayerWithFranchise, pool: PlayerWithFranchise[]) => {
      const inTier =
        (tier === 1 && tb.tier1.includes(player._id)) ||
        (tier === 3 && tb.tier2.includes(player._id)) ||
        (tier === 5 && tb.tier3.includes(player._id));
      if (!inTier && player.role === "allrounder") {
        const ar = allIds.filter((pid) => playerById.get(normalizePlayerId(pid))?.role === "allrounder")
          .length;
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
    if (!compositionOk) {
      toast.error(squadCompositionMessages(compositionCounts).join(" ") || "Invalid squad composition");
      return;
    }
    if (!teamName.trim() || !tb.captain || !tb.viceCaptain) {
      toast.error("Enter a squad name, captain (crown), and vice-captain (shield).");
      return;
    }
    if (
      !selectedIdSet.has(normalizePlayerId(tb.captain)) ||
      !selectedIdSet.has(normalizePlayerId(tb.viceCaptain))
    ) {
      toast.error("Captain and vice-captain must be among your 15 players.");
      return;
    }
    if (tb.captain === tb.viceCaptain) {
      toast.error("Captain and vice-captain must be different players.");
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
        viceCaptain: tb.viceCaptain,
      }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast.error(j.error ?? "Could not save team");
      return;
    }
    toast.success("Team saved");
    router.push(afterSaveRedirectTo ?? `/competitions/${competitionId}`);
  };

  const removePlayer = useCallback(
    (tier: TierKey, playerId: string) => {
      const pool = tier === 1 ? p1.players : tier === 3 ? p2.players : p3.players;
      const target = normalizePlayerId(playerId);
      const pl = pool.find((x) => normalizePlayerId(x._id) === target);
      if (pl) tb.toggle(tier, pl, pool);
    },
    [p1.players, p2.players, p3.players, tb]
  );

  if (entriesClosed) {
    const msg =
      entriesClosedReason === "frozen"
        ? "Entries for this competition are closed. Teams can no longer be edited."
        : "The entry deadline has passed.";
    return <p className="text-sm text-white/70">{msg}</p>;
  }

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <EnterTeamNameField teamName={teamName} onTeamNameChange={setTeamName} />
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
        <EnterSquadSidebar
          teamName={teamName}
          tier1Ids={tb.tier1}
        tier2Ids={tb.tier2}
        tier3Ids={tb.tier3}
        playerById={playerById}
        captain={tb.captain}
        viceCaptain={tb.viceCaptain}
        onCaptain={onCaptain}
        onViceCaptain={onViceCaptain}
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
    </div>
  );
};
