"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CompetitionBreadcrumb } from "@/components/competitions/CompetitionBreadcrumb";
import { PointsBreakdown } from "@/components/PointsBreakdown";
import { useCompetitionName } from "@/hooks/useCompetitionName";
import { PlayerScorecard } from "@/components/PlayerScorecard";
import type { FantasyPointsBreakdown } from "@/lib/scoring";
import type { IBattingStats, IBowlingStats, IFieldingStats } from "@/models/PlayerMatchScore";

interface Detail {
  player?: { name: string; franchise?: { shortCode?: string } };
  match?: { matchNumber?: number };
  Batting: IBattingStats;
  Bowling: IBowlingStats;
  Fielding: IFieldingStats;
  breakdown?: FantasyPointsBreakdown[];
}

export default function PlayerMatchDetailPage() {
  const params = useParams();
  const competitionId = String(params.id);
  const matchId = String(params.matchId);
  const playerId = String(params.playerId);
  const compName = useCompetitionName(competitionId);
  const [data, setData] = useState<Detail | null>(null);

  useEffect(() => {
    fetch(`/api/players/${playerId}/matches/${matchId}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => undefined);
  }, [matchId, playerId]);

  if (!data?.Batting) return <p className="text-sm text-muted-foreground">Loading…</p>;

  const matchLabel =
    typeof data.match?.matchNumber === "number" ? `Match #${data.match.matchNumber}` : "Match";
  const playerLabel = data.player?.name?.trim() || "Player";

  return (
    <div className="space-y-6">
      <CompetitionBreadcrumb
        variant="light"
        items={[
          { label: "Home", href: "/" },
          { label: "Competitions", href: "/competitions" },
          { label: compName ?? "League", href: `/competitions/${competitionId}` },
          { label: "My team", href: `/competitions/${competitionId}/my-team` },
          {
            label: matchLabel,
            href: `/competitions/${competitionId}/my-team/matches/${matchId}`,
          },
          { label: playerLabel },
        ]}
      />
      <PlayerScorecard
        name={data.player?.name ?? "Player"}
        franchiseLabel={data.player?.franchise?.shortCode ?? "—"}
        batting={data.Batting}
        bowling={data.Bowling}
        fielding={data.Fielding}
      />
      {data.breakdown && (
        <div>
          <h2 className="mb-2 text-lg font-medium">Fantasy breakdown</h2>
          <PointsBreakdown items={data.breakdown} />
        </div>
      )}
    </div>
  );
}
