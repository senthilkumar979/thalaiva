"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { CompetitionBreadcrumb } from "@/components/competitions/CompetitionBreadcrumb";
import {
  CompetitionMatchScoresAccordion,
  type FranchiseLite,
  type MatchScoreBlock,
  type MatchScorePlayerRow,
} from "@/components/competitions/CompetitionMatchScoresAccordion";
import { CompetitionSubpageShell } from "@/components/competitions/CompetitionSubpageShell";
import { PlayerMatchScoreDetailDrawer } from "@/components/competitions/PlayerMatchScoreDetailDrawer";

interface ApiPayload {
  competition: { _id: string; name: string };
  matches: MatchScoreBlock[];
}

interface CompetitionScoresViewProps {
  competitionId: string;
}

export const CompetitionScoresView = ({ competitionId }: CompetitionScoresViewProps) => {
  const [data, setData] = useState<ApiPayload | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState<{
    row: MatchScorePlayerRow;
    matchTitle: string;
    franchise: FranchiseLite;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    fetch(`/api/competitions/${competitionId}/match-scores`)
      .then(async (res) => {
        if (!res.ok) throw new Error("bad");
        return res.json() as Promise<ApiPayload>;
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [competitionId]);

  const compName = data?.competition.name ?? "League";
  const drawerPlayer = drawer?.row;
  console.log("data", drawerPlayer);

  const xiMatchBlocks = useMemo(() => {
    if (!data?.matches.length) return [];
    return data.matches.map((block) => ({
      ...block,
      players: block.players.filter((p) => p.participated),
    }));
  }, [data]);

  if (loading) {
    return (
      <CompetitionSubpageShell>
        <div className="flex min-h-[40vh] items-center justify-center text-white/80">
          <Loader2 className="size-8 animate-spin" />
        </div>
      </CompetitionSubpageShell>
    );
  }

  if (loadError || !data) {
    return (
      <CompetitionSubpageShell>
        <p className="py-12 text-center text-sm text-white/80">Could not load match scores.</p>
      </CompetitionSubpageShell>
    );
  }

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
              { label: "Scores by match" },
            ]}
          />

          <header className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="h-1 w-12 rounded-full bg-gradient-to-r from-amber-300 to-amber-500/40" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">
                Official results
              </span>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Scores by match</h1>
              <p className="max-w-2xl text-sm leading-relaxed text-white/65">
                Playing XI only. First team in the fixture on the left, second on the right. Open a match, then
                tap a player for section totals and a full fantasy breakdown.
              </p>
            </div>
          </header>

          {data.matches.length === 0 ? (
            <p className="rounded-xl border border-white/15 bg-white/5 px-4 py-10 text-center text-sm text-white/70">
              No scored matches yet. Check back after admins submit scores.
            </p>
          ) : (
            <CompetitionMatchScoresAccordion
              blocks={xiMatchBlocks}
              onPlayer={(row, matchTitle, franchise) => setDrawer({ row, matchTitle, franchise })}
            />
          )}
        </div>
      </CompetitionSubpageShell>

      {drawerPlayer && (
        <PlayerMatchScoreDetailDrawer
          open={drawer !== null}
          onOpenChange={(o) => {
            if (!o) setDrawer(null);
          }}
          playerName={drawerPlayer.name}
          matchTitle={drawer?.matchTitle ?? ""}
          franchiseShortCode={drawer.franchise.shortCode}
          franchiseLogoUrl={drawer.franchise.logoUrl}
          franchiseName={
            drawer.franchise.name !== drawer.franchise.shortCode ? drawer.franchise.name : undefined
          }
          role={drawerPlayer.role}
          Batting={drawerPlayer.Batting}
          Bowling={drawerPlayer.Bowling}
          Fielding={drawerPlayer.Fielding}
          participated={drawerPlayer.participated}
          isPlayerOfMatch={drawerPlayer.isPlayerOfMatch}
        />
      )}
    </>
  );
};
