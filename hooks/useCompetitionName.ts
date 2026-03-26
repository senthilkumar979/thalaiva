"use client";

import { useEffect, useState } from "react";

export function useCompetitionName(competitionId: string | undefined) {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    if (!competitionId) return;
    let cancelled = false;
    fetch(`/api/competitions/${competitionId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d && typeof d.name === "string") setName(d.name);
      })
      .catch(() => {
        if (!cancelled) setName(null);
      });
    return () => {
      cancelled = true;
    };
  }, [competitionId]);

  return name;
}
