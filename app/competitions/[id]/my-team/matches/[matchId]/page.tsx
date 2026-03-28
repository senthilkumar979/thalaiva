"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { usePathname, useParams, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { CompetitionBreadcrumb } from "@/components/competitions/CompetitionBreadcrumb";
import { MyTeamPlayerMatchDrawer } from "@/components/competitions/MyTeamPlayerMatchDrawer";
import { Badge } from "@/components/ui/badge";
import { useCompetitionName } from "@/hooks/useCompetitionName";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Row {
  player: { _id: string; name: string; franchise?: { shortCode?: string } };
  isCaptain: boolean;
  rawPoints: number;
  captainMultiplied: number;
}

interface Cms {
  match?: { matchNumber?: number };
  playersWithPoints: Row[];
  totalPointsThisMatch: number;
  rankThisMatch: number;
}

export default function MyMatchDetailPage() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const competitionId = String(params.id);
  const matchId = String(params.matchId);
  const playerFromQuery = searchParams.get("player");
  const playerDrawerOpen = Boolean(playerFromQuery);

  const closePlayerDrawer = () => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("player");
    const q = next.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  };

  const { status } = useSession();
  const compName = useCompetitionName(competitionId);
  const [data, setData] = useState<Cms | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (status !== "authenticated") {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    fetch(`/api/competitions/${competitionId}/entries/me/matches/${matchId}`)
      .then(async (r) => {
        if (!r.ok) return null;
        return r.json() as Promise<Cms>;
      })
      .then((j) => {
        if (!cancelled) setData(j);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [competitionId, matchId, status]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-10 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <p className="text-sm text-muted-foreground">Log in to view this page.</p>;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-10 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  if (!data?.playersWithPoints) {
    return <p className="text-sm text-muted-foreground">Could not load match data.</p>;
  }

  const matchLabel =
    typeof data.match?.matchNumber === "number" ? `Match #${data.match.matchNumber}` : "Match";

  return (
    <>
      <div className="space-y-4">
        <CompetitionBreadcrumb
          variant="light"
          items={[
            { label: "Home", href: "/" },
            { label: "Competitions", href: "/competitions" },
            { label: compName ?? "League", href: `/competitions/${competitionId}` },
            { label: "My team", href: `/competitions/${competitionId}/my-team` },
            { label: matchLabel },
          ]}
        />
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
                    href={`/competitions/${competitionId}/my-team/matches/${matchId}?player=${encodeURIComponent(r.player._id)}`}
                    className="hover:underline"
                    scroll={false}
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

      <MyTeamPlayerMatchDrawer
        open={playerDrawerOpen}
        onOpenChange={(open) => {
          if (!open) closePlayerDrawer();
        }}
        playerId={playerFromQuery}
        matchId={matchId}
      />
    </>
  );
}
