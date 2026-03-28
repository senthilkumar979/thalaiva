import { useCallback, useEffect, useState } from "react";

export interface SwapEligibility {
  canSwap: boolean;
  reason?: string;
  swapsRemaining: number;
  swapsUsed: number;
  scoredMatches: number;
  blockSequence: number;
  nextMatchNumber: number | null;
  swapWindowOpen: boolean;
  activeSwapWindowId: string | null;
  entriesClosed: boolean;
  captainChangeAvailable: boolean;
  viceCaptainChangeAvailable: boolean;
}

export function useSwapEligibility(competitionId: string | undefined) {
  const [data, setData] = useState<SwapEligibility | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!competitionId) return;
    setLoading(true);
    fetch(`/api/competitions/${competitionId}/swap/eligibility`)
      .then(async (res) => {
        const j = await res.json();
        if (!res.ok) throw new Error(j.error ?? "Failed");
        setData(j as SwapEligibility);
        setError(null);
      })
      .catch((e: Error) => {
        setError(e.message);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [competitionId, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { data, loading, error, refetch };
}
