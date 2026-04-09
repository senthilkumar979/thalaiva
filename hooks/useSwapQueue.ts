import type { PendingSwapRow } from "@/components/swaps/swapPendingTypes";
import {
  normalizePlayerId,
  type PlayerOption,
  type PlayerOptionNorm,
} from "@/components/swaps/swapSelectLabels";
import type { SwapEligibility } from "@/hooks/useSwapEligibility";
import {
  LEADERSHIP_CHANGE_PENALTY,
  playerSwapPenaltyForTierSlot,
} from "@/lib/swapPenaltyRules";
import { useCallback, useEffect, useMemo, useState } from "react";

export interface SwapQueueEntry {
  tier1Players: PlayerOption[];
  tier2Players: PlayerOption[];
  tier3Players: PlayerOption[];
}

function normalizeSquad(players: PlayerOption[] | undefined): PlayerOptionNorm[] {
  if (!players?.length) return [];
  return players.map((p) => ({ name: p.name, _id: normalizePlayerId(p._id), franchise: p.franchise }));
}

const emptyDraft = (): Record<1 | 2 | 3, { out: string; in: string }> => ({
  1: { out: "", in: "" },
  2: { out: "", in: "" },
  3: { out: "", in: "" },
});

interface UseSwapQueueArgs {
  competitionId: string;
  entry: SwapQueueEntry | null;
  eligibility: SwapEligibility;
  newCaptainId: string;
  newViceCaptainId: string;
  onSuccess: () => void;
}

export function useSwapQueue({
  competitionId,
  entry,
  eligibility,
  newCaptainId,
  newViceCaptainId,
  onSuccess,
}: UseSwapQueueArgs) {
  const [draft, setDraft] = useState(emptyDraft);
  const [pools, setPools] = useState<Record<1 | 2 | 3, PlayerOptionNorm[]>>({
    1: [],
    2: [],
    3: [],
  });
  const [loadingPools, setLoadingPools] = useState(false);
  const [pending, setPending] = useState<PendingSwapRow[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const squadNormByTier = useMemo(
    () => ({
      1: normalizeSquad(entry?.tier1Players),
      2: normalizeSquad(entry?.tier2Players),
      3: normalizeSquad(entry?.tier3Players),
    }),
    [entry]
  );

  useEffect(() => {
    if (!entry) return;
    let cancelled = false;
    setLoadingPools(true);
    Promise.all([
      fetch(`/api/players?tier=1`).then((r) => r.json()),
      fetch(`/api/players?tier=3`).then((r) => r.json()),
      fetch(`/api/players?tier=5`).then((r) => r.json()),
    ])
      .then(([r1, r2, r3]) => {
        if (cancelled) return;
        const norm = (rows: unknown): PlayerOptionNorm[] =>
          Array.isArray(rows)
            ? rows.map((p: PlayerOption) => ({
                name: p.name,
                franchise: p.franchise,
              _id: normalizePlayerId(p._id),
              }))
            : [];
        setPools({ 1: norm(r1), 2: norm(r2), 3: norm(r3) });
      })
      .finally(() => {
        if (!cancelled) setLoadingPools(false);
      });
    return () => {
      cancelled = true;
    };
  }, [entry, competitionId]);

  const poolFilteredByTier = useMemo(() => {
    const out: Record<1 | 2 | 3, PlayerOptionNorm[]> = { 1: [], 2: [], 3: [] };
    for (const slot of [1, 2, 3] as const) {
      const squad = squadNormByTier[slot];
      out[slot] = pools[slot].filter((p) => !squad.some((s) => s._id === p._id));
    }
    return out;
  }, [pools, squadNormByTier]);

  const setDraftTier = useCallback((slot: 1 | 2 | 3, field: "out" | "in", value: string) => {
    setDraft((d) => ({
      ...d,
      [slot]: { ...d[slot], [field]: value },
    }));
  }, []);

  const addToQueueForTier = useCallback(
    (tierSlot: 1 | 2 | 3) => {
      const { out: playerOutId, in: playerInId } = draft[tierSlot];
      if (!playerOutId || !playerInId) return;

      setPending((prev) => {
        const tierRem = eligibility.tierRemaining[tierSlot];
        const queuedInTier = prev.filter((p) => p.tierSlot === tierSlot).length;
        if (queuedInTier >= tierRem) {
          setError(`Slot ${tierSlot}: no swaps left in this tier (max 2).`);
          return prev;
        }
        if (prev.length >= eligibility.swapsRemaining) {
          setError("No player swaps left this competition (6 total).");
          return prev;
        }
        if (playerOutId === playerInId) {
          setError("Choose two different players.");
          return prev;
        }
        const squadNorm = squadNormByTier[tierSlot];
        const outP = squadNorm.find((p) => p._id === playerOutId);
        const inP = pools[tierSlot].find((p) => p._id === playerInId);
        setError(null);
        return [
          ...prev,
          {
            tierSlot,
            playerOutId,
            playerInId,
            playerOutName: outP?.name ?? "?",
            playerInName: inP?.name ?? "?",
          },
        ];
      });
      setDraft((d) => ({ ...d, [tierSlot]: { out: "", in: "" } }));
    },
    [draft, eligibility.tierRemaining, eligibility.swapsRemaining, squadNormByTier, pools]
  );

  const hasLeadership =
    Boolean(newCaptainId?.trim()) || Boolean(newViceCaptainId?.trim());

  const submitAll = useCallback(async (): Promise<boolean> => {
    if (pending.length === 0 && !hasLeadership) return false;
    setSubmitting(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        swaps: pending.map(({ tierSlot: ts, playerOutId: o, playerInId: n }) => ({
          tierSlot: ts,
          playerOutId: o,
          playerInId: n,
        })),
      };
      if (newCaptainId?.trim()) body.newCaptainId = newCaptainId.trim();
      if (newViceCaptainId?.trim()) body.newViceCaptainId = newViceCaptainId.trim();
      const res = await fetch(`/api/competitions/${competitionId}/entries/me/swap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "Swap failed");
      setPending([]);
      setDraft(emptyDraft());
      onSuccess();
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [
    pending,
    hasLeadership,
    newCaptainId,
    newViceCaptainId,
    competitionId,
    onSuccess,
  ]);

  const nextLabel =
    eligibility.nextMatchNumber != null
      ? `match #${eligibility.nextMatchNumber} in schedule order`
      : "the next unscored match";

  const playerPenaltyTotal = pending.reduce(
    (sum, s) => sum + playerSwapPenaltyForTierSlot(s.tierSlot),
    0
  );
  const penaltyPreview = playerPenaltyTotal + (hasLeadership ? LEADERSHIP_CHANGE_PENALTY : 0);

  const removePending = useCallback((globalIndex: number) => {
    setPending((p) => p.filter((_, idx) => idx !== globalIndex));
  }, []);

  const pendingWithIndex = useMemo(
    () => pending.map((row, globalIndex) => ({ row, globalIndex })),
    [pending]
  );

  return {
    draft,
    setDraftTier,
    squadNormByTier,
    poolFilteredByTier,
    loadingPools,
    pending,
    pendingWithIndex,
    submitting,
    error,
    setError,
    addToQueueForTier,
    submitAll,
    hasLeadership,
    nextLabel,
    penaltyPreview,
    playerPenaltyTotal,
    leadershipPenalty: hasLeadership ? LEADERSHIP_CHANGE_PENALTY : 0,
    removePending,
  };
}
