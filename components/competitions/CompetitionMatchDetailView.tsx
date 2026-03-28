"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CompetitionBreadcrumb } from "@/components/competitions/CompetitionBreadcrumb";
import { CompetitionMatchDetailHero } from "@/components/competitions/CompetitionMatchDetailHero";
import { CompetitionMatchHighlightGrid } from "@/components/competitions/CompetitionMatchHighlightGrid";
import { CompetitionMatchPlayerCards } from "@/components/competitions/CompetitionMatchPlayerCards";
import {
  type FranchiseLite,
  type MatchScorePlayerRow,
} from "@/components/competitions/CompetitionMatchScoresAccordion";
import { CompetitionSubpageShell } from "@/components/competitions/CompetitionSubpageShell";
import { PlayerMatchScoreDetailDrawer } from "@/components/competitions/PlayerMatchScoreDetailDrawer";
import { buildMatchHighlights } from "@/lib/buildMatchHighlights";

interface ScoreboardApi {
  competition: { _id: string; name: string };
  scored: boolean;
  match: {
    _id: string;
    matchNumber: number;
    date: string;
    venue: string;
    isScored: boolean;
  };
  franchiseA: FranchiseLite;
  franchiseB: FranchiseLite;
  players: MatchScorePlayerRow[];
}

interface CompetitionMatchDetailViewProps {
  competitionId: string;
  matchId: string;
}

export const CompetitionMatchDetailView = ({ competitionId, matchId }: CompetitionMatchDetailViewProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const playerFromQuery = searchParams.get("player");

  const [data, setData] = useState<ScoreboardApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetch(`/api/competitions/${competitionId}/matches/${matchId}/scoreboard`)
      .then(async (r) => {
        if (!r.ok) throw new Error("bad");
        return r.json() as Promise<ScoreboardApi>;
      })
      .then((j) => {
        if (!cancelled) setData(j);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [competitionId, matchId]);

  const compName = data?.competition.name ?? "League";

  const xiPlayers = useMemo(() => {
    if (!data?.players?.length) return [];
    return data.players.filter((p) => p.participated);
  }, [data]);

  const xiHighlights = useMemo(() => buildMatchHighlights(xiPlayers), [xiPlayers]);

  const selectedRow = useMemo(() => {
    if (!playerFromQuery || !data?.players?.length) return null;
    const row = data.players.find((p) => p.playerId === playerFromQuery) ?? null;
    if (!row?.participated) return null;
    return row;
  }, [playerFromQuery, data]);

  const drawerFranchise: FranchiseLite | null = useMemo(() => {
    if (!selectedRow || !data) return null;
    return selectedRow.side === "a" ? data.franchiseA : data.franchiseB;
  }, [selectedRow, data]);

  const matchTitle = useMemo(() => {
    if (!data?.match) return "";
    return `Match #${data.match.matchNumber} · ${new Date(data.match.date).toLocaleDateString()}`;
  }, [data]);

  const closeDrawer = () => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("player");
    const q = next.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  };

  const openPlayer = (row: MatchScorePlayerRow) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("player", row.playerId);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  if (loading) {
    return (
      <CompetitionSubpageShell>
        <div className="flex min-h-[40vh] items-center justify-center text-white/80">
          <Loader2 className="size-8 animate-spin" />
        </div>
      </CompetitionSubpageShell>
    );
  }

  if (error || !data) {
    return (
      <CompetitionSubpageShell>
        <p className="py-12 text-center text-sm text-white/80">Could not load this match.</p>
      </CompetitionSubpageShell>
    );
  }

  const { match, franchiseA, franchiseB, scored, players } = data;

  return (
    <>
      <CompetitionSubpageShell>
        <div className="space-y-8">
          <CompetitionBreadcrumb
            variant="dark"
            items={[
              { label: "Home", href: "/" },
              { label: "Competitions", href: "/competitions" },
              { label: compName, href: `/competitions/${competitionId}` },
              { label: "Matches", href: `/competitions/${competitionId}/matches` },
              { label: `Match #${match.matchNumber}` },
            ]}
          />

          <CompetitionMatchDetailHero
            matchNumber={match.matchNumber}
            franchiseA={franchiseA}
            franchiseB={franchiseB}
            date={match.date}
            venue={match.venue}
            scored={scored}
          />

          {scored && xiPlayers.length > 0 ? (
            <>
              <CompetitionMatchHighlightGrid highlights={xiHighlights} />
              <CompetitionMatchPlayerCards players={xiPlayers} onPlayerOpen={openPlayer} />
            </>
          ) : scored && players.length > 0 ? (
            <p className="text-sm text-white/60">No playing XI scores recorded for this match.</p>
          ) : scored ? (
            <p className="text-sm text-white/60">No player scores recorded for this match.</p>
          ) : null}

          <Link
            href={`/competitions/${competitionId}/matches`}
            className="inline-block text-sm font-medium text-amber-200/90 underline-offset-4 hover:underline"
          >
            ← All matches
          </Link>
        </div>
      </CompetitionSubpageShell>

      {selectedRow && drawerFranchise && scored ? (
        <PlayerMatchScoreDetailDrawer
          open={Boolean(playerFromQuery)}
          onOpenChange={(o) => {
            if (!o) closeDrawer();
          }}
          playerName={selectedRow.name}
          matchTitle={matchTitle}
          franchiseShortCode={drawerFranchise.shortCode}
          franchiseLogoUrl={selectedRow.franchiseLogoUrl ?? drawerFranchise.logoUrl}
          franchiseName={
            drawerFranchise.name !== drawerFranchise.shortCode ? drawerFranchise.name : undefined
          }
          role={selectedRow.role}
          Batting={selectedRow.Batting}
          Bowling={selectedRow.Bowling}
          Fielding={selectedRow.Fielding}
          participated={selectedRow.participated}
        />
      ) : null}
    </>
  );
};
