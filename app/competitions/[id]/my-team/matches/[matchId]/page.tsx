"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Row {
  player: { _id: string; name: string; franchise?: { shortCode?: string } };
  isCaptain: boolean;
  rawPoints: number;
  captainMultiplied: number;
}

interface Cms {
  playersWithPoints: Row[];
  totalPointsThisMatch: number;
  rankThisMatch: number;
}

export default function MyMatchDetailPage() {
  const params = useParams();
  const competitionId = String(params.id);
  const matchId = String(params.matchId);
  const { status } = useSession();
  const [data, setData] = useState<Cms | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch(`/api/competitions/${competitionId}/entries/me/matches/${matchId}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => undefined);
  }, [competitionId, matchId, status]);

  if (status === "unauthenticated") {
    return <p className="text-sm text-muted-foreground">Log in to view this page.</p>;
  }

  if (!data?.playersWithPoints) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-4">
      <Link href={`/competitions/${competitionId}/my-team`} className="text-sm text-primary underline">
        Back to matches
      </Link>
      <div className="flex flex-wrap gap-4 text-sm">
        <div>
          <div className="text-muted-foreground">Points this match</div>
          <div className="text-xl font-semibold tabular-nums">{data.totalPointsThisMatch}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Rank</div>
          <div className="text-xl font-semibold tabular-nums">#{data.rankThisMatch}</div>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {data.playersWithPoints.map((r) => (
          <Card key={String(r.player._id)}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                <Link
                  href={`/competitions/${competitionId}/my-team/matches/${matchId}/players/${r.player._id}`}
                  className="hover:underline"
                >
                  {r.player.name}
                </Link>
                {r.isCaptain && (
                  <Badge className="ml-2" variant="secondary">
                    Captain ×2
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {r.player.franchise?.shortCode} · Raw {r.rawPoints} → Total {r.captainMultiplied}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
