import type { PendingSwapRow } from "@/components/swaps/swapPendingTypes";
import {
  normalizeFranchiseId,
  normalizePlayerId,
  type PlayerOption,
  type PlayerOptionNorm,
} from "@/components/swaps/swapSelectLabels";
import type { SwapEligibility } from "@/hooks/useSwapEligibility";
import {
  leadershipPenaltyPoints,
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
  return players.map((p) => ({
    name: p.name,
    _id: normalizePlayerId(p._id),
    role: p.role,
    franchise: p.franchise
      ? { ...p.franchise, _id: normalizeFranchiseId(p.franchise) }
      : { _id: "", name: "", shortCode: "", logoUrl: "" },
  }));
}

/** Tier roster after pending swaps; if `draftOutId` is set, that player is removed (4 remain). */
function getTierSimulatedRoster(
  slot: 1 | 2 | 3,
  squad: PlayerOptionNorm[],
  pending: PendingSwapRow[],
  draftOutId: string | null
): { id: string; franchiseId: string }[] {
  let roster = squad.map((p) => ({
    id: p._id,
    franchiseId: normalizeFranchiseId(p.franchise),
  }));
  for (const row of pending) {
    if (row.tierSlot !== slot) continue;
    roster = roster.filter((r) => r.id !== row.playerOutId);
    roster.push({ id: row.playerInId, franchiseId: row.playerInFranchiseId });
  }
  if (draftOutId) {
    roster = roster.filter((r) => r.id !== draftOutId);
  }
  return roster;
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
  const [validating, setValidating] = useState(false);
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
                role: p.role,
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
      const fullTier = getTierSimulatedRoster(slot, squad, pending, null);
      const occupiedIds = new Set(fullTier.map((r) => r.id));
      const draftOut = draft[slot].out;
      let list = pools[slot].filter((p) => !occupiedIds.has(p._id));
      if (draftOut) {
        const fourOthers = getTierSimulatedRoster(slot, squad, pending, draftOut);
        const blockedFr = new Set(fourOthers.map((r) => r.franchiseId));
        list = list.filter((p) => !blockedFr.has(normalizeFranchiseId(p.franchise)));
      }
      out[slot] = list;
    }
    return out;
  }, [pools, squadNormByTier, pending, draft]);

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
        if (!inP) {
          setError("Selected incoming player is not available for this tier.");
          return prev;
        }
        const fourOthers = getTierSimulatedRoster(tierSlot, squadNorm, prev, playerOutId);
        if (fourOthers.length !== 4) {
          setError("Invalid tier state for this swap.");
          return prev;
        }
        const blockedFr = new Set(fourOthers.map((r) => r.franchiseId));
        const inFr = normalizeFranchiseId(inP.franchise);
        if (blockedFr.has(inFr)) {
          setError(
            "Cannot swap in that player: this tier already has someone from that franchise (five different franchises required)."
          );
          return prev;
        }
        setError(null);
        return [
          ...prev,
          {
            tierSlot,
            playerOutId,
            playerInId,
            playerOutName: outP?.name ?? "?",
            playerInName: inP.name,
            playerOutFranchiseId: normalizeFranchiseId(outP?.franchise),
            playerInFranchiseId: inFr,
          },
        ];
      });
      setDraft((d) => ({ ...d, [tierSlot]: { out: "", in: "" } }));
    },
    [draft, eligibility.tierRemaining, eligibility.swapsRemaining, squadNormByTier, pools]
  );

  const captainLead = Boolean(newCaptainId?.trim());
  const viceLead = Boolean(newViceCaptainId?.trim());
  const hasLeadership = captainLead || viceLead;

  const buildSwapBody = useCallback((): Record<string, unknown> => {
    const body: Record<string, unknown> = {
      swaps: pending.map(({ tierSlot: ts, playerOutId: o, playerInId: n }) => ({
        tierSlot: ts,
        playerOutId: o,
        playerInId: n,
      })),
    };
    if (newCaptainId?.trim()) body.newCaptainId = newCaptainId.trim();
    if (newViceCaptainId?.trim()) body.newViceCaptainId = newViceCaptainId.trim();
    return body;
  }, [pending, newCaptainId, newViceCaptainId]);

  const validateForConfirm = useCallback(async (): Promise<boolean> => {
    if (pending.length === 0 && !hasLeadership) return false;
    setValidating(true);
    setError(null);
    try {
      const res = await fetch(`/api/competitions/${competitionId}/entries/me/swap/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildSwapBody()),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "Validation failed");
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setValidating(false);
    }
  }, [pending.length, hasLeadership, competitionId, buildSwapBody]);

  const submitAll = useCallback(async (): Promise<boolean> => {
    if (pending.length === 0 && !hasLeadership) return false;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/competitions/${competitionId}/entries/me/swap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildSwapBody()),
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
  }, [pending, hasLeadership, competitionId, buildSwapBody, onSuccess]);

  const nextLabel =
    eligibility.nextMatchNumber != null
      ? `match #${eligibility.nextMatchNumber} in schedule order`
      : "the next unscored match";

  const playerPenaltyTotal = pending.reduce(
    (sum, s) => sum + playerSwapPenaltyForTierSlot(s.tierSlot),
    0
  );
  const leadershipPreviewPenalty = leadershipPenaltyPoints(
    captainLead,
    viceLead && !captainLead
  );
  const penaltyPreview = playerPenaltyTotal + leadershipPreviewPenalty;

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
    validating,
    error,
    setError,
    addToQueueForTier,
    validateForConfirm,
    submitAll,
    hasLeadership,
    nextLabel,
    penaltyPreview,
    playerPenaltyTotal,
    leadershipPenalty: leadershipPreviewPenalty,
    removePending,
  };
}
