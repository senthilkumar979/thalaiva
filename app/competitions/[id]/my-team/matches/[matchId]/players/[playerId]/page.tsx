"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PointsBreakdown } from "@/components/PointsBreakdown";
import { PlayerScorecard } from "@/components/PlayerScorecard";
import type { FantasyPointsBreakdown } from "@/lib/scoring";
import type { IBattingStats, IBowlingStats, IFieldingStats } from "@/models/PlayerMatchScore";

interface Detail {
  player?: { name: string; franchise?: { shortCode?: string } };
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
  const [data, setData] = useState<Detail | null>(null);

  useEffect(() => {
    fetch(`/api/players/${playerId}/matches/${matchId}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => undefined);
  }, [matchId, playerId]);

  if (!data?.Batting) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-6">
      <Link href={`/competitions/${competitionId}/my-team/matches/${matchId}`} className="text-sm text-primary underline">
        Back to match
      </Link>
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
