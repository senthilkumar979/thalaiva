"use client";

import type { MatchScorePlayerRow } from "@/components/competitions/CompetitionMatchScoresAccordion";
import { CompetitionMatchPlayerStatCard } from "@/components/competitions/CompetitionMatchPlayerStatCard";

interface CompetitionMatchPlayerCardsProps {
  players: MatchScorePlayerRow[];
  onPlayerOpen: (row: MatchScorePlayerRow) => void;
}

export const CompetitionMatchPlayerCards = ({ players, onPlayerOpen }: CompetitionMatchPlayerCardsProps) => {
  const sorted = [...players].sort((a, b) => b.fantasyPoints - a.fantasyPoints);
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">Players</h2>
      <ul className="flex flex-col gap-4">
        {sorted.map((row) => (
          <li key={row.playerId}>
            <CompetitionMatchPlayerStatCard row={row} onOpen={() => onPlayerOpen(row)} />
          </li>
        ))}
      </ul>
    </div>
  );
};
