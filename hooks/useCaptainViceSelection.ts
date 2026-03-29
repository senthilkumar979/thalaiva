"use client";

import { useCallback, useEffect, useMemo } from "react";
import { toast } from "sonner";
import type { PlayerWithFranchise } from "@/hooks/usePlayersByTier";
import { normalizePlayerId } from "@/lib/teamEntryHelpers";
import { playerFranchiseKey } from "@/hooks/useTeamBuilder";

interface UseCaptainViceSelectionArgs {
  playerById: Map<string, PlayerWithFranchise>;
  captain: string | null;
  viceCaptain: string | null;
  setCaptain: (id: string | null) => void;
  setViceCaptain: (id: string | null) => void;
  capPool: string[];
}

export function useCaptainViceSelection({
  playerById,
  captain,
  viceCaptain,
  setCaptain,
  setViceCaptain,
  capPool,
}: UseCaptainViceSelectionArgs) {
  const captainViceFranchisesOk = useMemo(() => {
    if (!captain || !viceCaptain) return false;
    const c = playerById.get(normalizePlayerId(captain));
    const v = playerById.get(normalizePlayerId(viceCaptain));
    if (!c || !v) return false;
    return playerFranchiseKey(c) !== playerFranchiseKey(v);
  }, [captain, viceCaptain, playerById]);

  const capPoolSet = useMemo(() => new Set(capPool.map((id) => normalizePlayerId(id))), [capPool]);

  useEffect(() => {
    if (captain && !capPoolSet.has(normalizePlayerId(captain))) setCaptain(null);
  }, [captain, capPoolSet, setCaptain]);

  useEffect(() => {
    if (viceCaptain && !capPoolSet.has(normalizePlayerId(viceCaptain))) setViceCaptain(null);
  }, [viceCaptain, capPoolSet, setViceCaptain]);

  const onCaptain = useCallback(
    (id: string) => {
      const sid = normalizePlayerId(id);
      if (captain != null && normalizePlayerId(captain) === sid) {
        setCaptain(null);
        return;
      }
      if (viceCaptain != null && normalizePlayerId(viceCaptain) === sid) {
        toast.error("That player is vice-captain — clear vice-captain first or pick another captain.");
        return;
      }
      const c = playerById.get(sid);
      const v = viceCaptain ? playerById.get(normalizePlayerId(viceCaptain)) : null;
      if (c && v && playerFranchiseKey(c) === playerFranchiseKey(v)) {
        toast.error("Captain must be from a different franchise than vice-captain.");
        return;
      }
      setCaptain(sid);
    },
    [captain, viceCaptain, playerById, setCaptain]
  );

  const onViceCaptain = useCallback(
    (id: string) => {
      const sid = normalizePlayerId(id);
      if (viceCaptain != null && normalizePlayerId(viceCaptain) === sid) {
        setViceCaptain(null);
        return;
      }
      if (!captain) {
        toast.error("Choose a captain first.");
        return;
      }
      if (normalizePlayerId(captain) === sid) {
        toast.error("Vice-captain cannot be the same player as captain.");
        return;
      }
      const c = playerById.get(normalizePlayerId(captain));
      const v = playerById.get(sid);
      if (c && v && playerFranchiseKey(c) === playerFranchiseKey(v)) {
        toast.error("Vice-captain must be from a different franchise than the captain.");
        return;
      }
      setViceCaptain(sid);
    },
    [captain, viceCaptain, playerById, setViceCaptain]
  );

  return { onCaptain, onViceCaptain, captainViceFranchisesOk };
}
