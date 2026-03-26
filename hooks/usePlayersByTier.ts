"use client";

import { useEffect, useState } from "react";

export interface PlayerWithFranchise {
  _id: string;
  name: string;
  tier: number;
  role: string;
  franchise: { name: string; shortCode: string; logoUrl?: string };
}

export function usePlayersByTier(tier: 1 | 3 | 5) {
  const [players, setPlayers] = useState<PlayerWithFranchise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/players?tier=${tier}`);
        if (!res.ok) throw new Error("Failed to load players");
        const data = (await res.json()) as PlayerWithFranchise[];
        if (!cancelled) setPlayers(data);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tier]);

  return { players, isLoading, error };
}
