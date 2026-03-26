"use client";

import { useCallback, useMemo, useState } from "react";
import type { PlayerWithFranchise } from "@/hooks/usePlayersByTier";

export type TierKey = 1 | 3 | 5;

function franchiseKey(p: PlayerWithFranchise): string {
  if (p.franchise && typeof p.franchise === "object") return p.franchise.shortCode;
  return String(p.franchise);
}

const LIMIT = 5;

export function useTeamBuilder() {
  const [tier1, setTier1] = useState<string[]>([]);
  const [tier2, setTier2] = useState<string[]>([]);
  const [tier3, setTier3] = useState<string[]>([]);
  const [captain, setCaptain] = useState<string | null>(null);

  const allSelected = useMemo(
    () => [...tier1, ...tier2, ...tier3],
    [tier1, tier2, tier3]
  );

  const setTiers = useCallback((t1: string[], t2: string[], t3: string[]) => {
    setTier1(t1);
    setTier2(t2);
    setTier3(t3);
  }, []);

  const toggle = useCallback(
    (tier: TierKey, player: PlayerWithFranchise, pool: PlayerWithFranchise[]) => {
      const [current, set] =
        tier === 1 ? [tier1, setTier1] : tier === 3 ? [tier2, setTier2] : [tier3, setTier3];
      const pid = player._id;
      if (current.includes(pid)) {
        set(current.filter((x) => x !== pid));
        setCaptain((c) => (c === pid ? null : c));
        return;
      }
      if (current.length >= LIMIT) return;
      const key = franchiseKey(player);
      const usedKeys = new Set(
        current.map((id) => {
          const pl = pool.find((x) => x._id === id);
          return pl ? franchiseKey(pl) : "";
        })
      );
      if (usedKeys.has(key)) return;
      set([...current, pid]);
    },
    [tier1, tier2, tier3]
  );

  return {
    tier1,
    tier2,
    tier3,
    captain,
    allSelected,
    setCaptain,
    setTiers,
    toggle,
  };
}
