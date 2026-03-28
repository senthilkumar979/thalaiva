"use client";

import type { Dispatch, SetStateAction } from "react";
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
}

export const AdminScoreRosterTab = ({
  matchId,
  list,
  rows,
  participation,
  update,
  setParticipation,
}: AdminScoreRosterTabProps) => {
  if (list.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
        No players in this squad.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      {list.map((p) => {
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
          />
        );
      })}
    </div>
  );
};
