import { useCallback, useEffect, useState } from "react";

export interface SwapEligibility {
  canSwap: boolean;
  reason?: string;
  swapsRemaining: number;
  swapsUsed: number;
  swapsUsedTierSlot1: number;
  swapsUsedTierSlot2: number;
  swapsUsedTierSlot3: number;
  tierRemaining: { 1: number; 2: number; 3: number };
  totalScore: number;
  scoredMatches: number;
  blockSequence: number;
  nextMatchNumber: number | null;
  swapWindowOpen: boolean;
  activeSwapWindowId: string | null;
  entriesClosed: boolean;
  /** One change to captain or vice-captain for the whole competition (−200). */
  leadershipChangeAvailable: boolean;
  /** @deprecated Use leadershipChangeAvailable */
  captainChangeAvailable?: boolean;
  /** @deprecated Use leadershipChangeAvailable */
  viceCaptainChangeAvailable?: boolean;
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
        setData({
          ...j,
          swapsUsedTierSlot1: j.swapsUsedTierSlot1 ?? 0,
          swapsUsedTierSlot2: j.swapsUsedTierSlot2 ?? 0,
          swapsUsedTierSlot3: j.swapsUsedTierSlot3 ?? 0,
          tierRemaining: j.tierRemaining ?? { 1: 2, 2: 2, 3: 2 },
          totalScore: j.totalScore ?? 0,
          leadershipChangeAvailable:
            j.leadershipChangeAvailable ?? j.captainChangeAvailable ?? false,
        } as SwapEligibility);
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
