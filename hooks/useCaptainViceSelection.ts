"use client";

import { useCallback, useEffect, useMemo } from "react";
import { toast } from "sonner";
import type { PlayerWithFranchise } from "@/hooks/usePlayersByTier";
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
    const c = playerById.get(captain);
    const v = playerById.get(viceCaptain);
    if (!c || !v) return false;
    return playerFranchiseKey(c) !== playerFranchiseKey(v);
  }, [captain, viceCaptain, playerById]);

  useEffect(() => {
    if (captain && !capPool.includes(captain)) setCaptain(null);
  }, [captain, capPool, setCaptain]);

  useEffect(() => {
    if (viceCaptain && !capPool.includes(viceCaptain)) setViceCaptain(null);
  }, [viceCaptain, capPool, setViceCaptain]);

  const onCaptain = useCallback(
    (id: string) => {
      if (captain === id) return;
      if (viceCaptain === id) {
        toast.error("That player is vice-captain — clear vice-captain first or pick another captain.");
        return;
      }
      const c = playerById.get(id);
      const v = viceCaptain ? playerById.get(viceCaptain) : null;
      if (c && v && playerFranchiseKey(c) === playerFranchiseKey(v)) {
        toast.error("Captain must be from a different franchise than vice-captain.");
        return;
      }
      setCaptain(id);
    },
    [captain, viceCaptain, playerById, setCaptain]
  );

  const onViceCaptain = useCallback(
    (id: string) => {
      if (viceCaptain === id) {
        setViceCaptain(null);
        return;
      }
      if (!captain) {
        toast.error("Choose a captain first.");
        return;
      }
      if (captain === id) {
        toast.error("Vice-captain cannot be the same player as captain.");
        return;
      }
      const c = playerById.get(captain);
      const v = playerById.get(id);
      if (c && v && playerFranchiseKey(c) === playerFranchiseKey(v)) {
        toast.error("Vice-captain must be from a different franchise than the captain.");
        return;
      }
      setViceCaptain(id);
    },
    [captain, viceCaptain, playerById, setViceCaptain]
  );

  return { onCaptain, onViceCaptain, captainViceFranchisesOk };
}
