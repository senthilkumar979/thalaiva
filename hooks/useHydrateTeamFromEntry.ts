"use client";

import { useEffect } from "react";
import { captainIdFromEntry, playerIdListFromEntry } from "@/lib/teamEntryHelpers";

export function useHydrateTeamFromEntry(
  competitionId: string,
  setTiers: (t1: string[], t2: string[], t3: string[]) => void,
  setCaptain: (id: string | null) => void,
  setViceCaptain: (id: string | null) => void,
  setTeamName: (v: string) => void
) {
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/competitions/${competitionId}/entries/me`)
      .then((r) => (r.ok ? r.json() : null))
      .then((e) => {
        if (cancelled || !e?.customTeamName) return;
        setTiers(
          playerIdListFromEntry(e.tier1Players),
          playerIdListFromEntry(e.tier2Players),
          playerIdListFromEntry(e.tier3Players)
        );
        setCaptain(captainIdFromEntry(e.captain));
        setViceCaptain(captainIdFromEntry(e.viceCaptain));
        setTeamName(e.customTeamName);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [competitionId, setTiers, setCaptain, setViceCaptain, setTeamName]);
}
