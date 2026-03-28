"use client";

import { useMemo, type Dispatch, type SetStateAction } from "react";
import { AdminScorePlayerAccordion } from "@/components/admin/AdminScorePlayerAccordion";
import type { StatFormValues } from "@/components/AdminScorePlayerRow";
import { emptyPlayerScoreStats } from "@/lib/adminScoreEmptyStats";
import type { PlayerRole } from "@/models/Player";

export interface ScorePlayerLite {
  _id: string;
  name: string;
  role: PlayerRole;
  franchise: { _id: string; shortCode?: string; name?: string; logoUrl?: string };
}

interface AdminScoreRosterTabProps {
  matchId: string;
  list: ScorePlayerLite[];
  rows: Record<string, StatFormValues>;
  participation: Record<string, boolean>;
  update: (id: string, next: StatFormValues) => void;
  setParticipation: Dispatch<SetStateAction<Record<string, boolean>>>;
  playerOfMatchPlayerId: string | null;
  onPlayerOfMatchSelect: (playerId: string) => void;
}

export const AdminScoreRosterTab = ({
  matchId,
  list,
  rows,
  participation,
  update,
  setParticipation,
  playerOfMatchPlayerId,
  onPlayerOfMatchSelect,
}: AdminScoreRosterTabProps) => {
  const orderedList = useMemo(() => {
    return [...list].sort((a, b) => {
      const pa = participation[a._id] ?? false;
      const pb = participation[b._id] ?? false;
      if (pa !== pb) return pa ? -1 : 1;
      return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    });
  }, [list, participation]);

  if (list.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-white/20 bg-white/[0.03] px-4 py-8 text-center text-sm text-white/65">
        No players in this squad.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      {orderedList.map((p) => {
        const row = rows[p._id] ?? emptyPlayerScoreStats(p._id);
        const franchiseLabel = p.franchise?.shortCode ?? p.franchise?.name ?? "—";
        const franchiseShortCode = p.franchise?.shortCode ?? "—";
        return (
          <AdminScorePlayerAccordion
            key={p._id}
            matchId={matchId}
            name={p.name}
            franchiseLabel={franchiseLabel}
            franchiseLogoUrl={p.franchise.logoUrl}
            franchiseShortCode={franchiseShortCode}
            role={p.role}
            participated={participation[p._id] ?? false}
            onParticipationChange={(v) => setParticipation((prev) => ({ ...prev, [p._id]: v }))}
            value={row}
            onChange={(next) => update(p._id, next)}
            isPlayerOfTheMatch={
              Boolean(playerOfMatchPlayerId && playerOfMatchPlayerId === p._id) &&
              Boolean(participation[p._id])
            }
            onPlayerOfMatchSelect={() => onPlayerOfMatchSelect(p._id)}
          />
        );
      })}
    </div>
  );
};
