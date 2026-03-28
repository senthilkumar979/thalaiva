"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { FantasyDetailDialogShell } from "@/components/competitions/FantasyDetailDialogShell";
import { PlayerMatchScoreDetailPanel } from "@/components/competitions/PlayerMatchScoreDetailPanel";
import { FANTASY_SCORING_POINT_VALUES as P } from "@/lib/updatedScoring";
import type { IBattingStats, IBowlingStats, IFieldingStats } from "@/models/PlayerMatchScore";

interface ApiDetail {
  player?: {
    name?: string;
    franchise?: { shortCode?: string; name?: string; logoUrl?: string };
    tier?: string;
    role?: string;
  };
  match?: { matchNumber?: number };
  Batting?: IBattingStats;
  Bowling?: IBowlingStats;
  Fielding?: IFieldingStats;
  participated?: boolean;
}

interface MyTeamPlayerMatchDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playerId: string | null;
  matchId: string | null;
}

export const MyTeamPlayerMatchDrawer = ({
  open,
  onOpenChange,
  playerId,
  matchId,
}: MyTeamPlayerMatchDrawerProps) => {
  const [data, setData] = useState<ApiDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!open || !playerId || !matchId) {
      setData(null);
      setError(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetch(`/api/players/${playerId}/matches/${matchId}`)
      .then(async (r) => {
        if (!r.ok) return null;
        return r.json() as Promise<ApiDetail>;
      })
      .then((j) => {
        if (cancelled) return;
        setData(j);
        setError(!j?.Batting);
      })
      .catch(() => {
        if (!cancelled) {
          setData(null);
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, playerId, matchId]);

  const matchTitle =
    data?.match != null && typeof data.match.matchNumber === "number"
      ? `Match #${data.match.matchNumber}`
      : "Match";

  const panelProps =
    data?.Batting && data.Bowling && data.Fielding
      ? {
          playerName: data.player?.name?.trim() || "Player",
          matchTitle,
          franchiseShortCode: data.player?.franchise?.shortCode ?? "—",
          franchiseLogoUrl: data.player?.franchise?.logoUrl,
          franchiseName: data.player?.franchise?.name,
          role: String(data.player?.role ?? data.player?.tier ?? "—"),
          Batting: data.Batting,
          Bowling: data.Bowling,
          Fielding: data.Fielding,
          participated: Boolean(data.participated),
        }
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FantasyDetailDialogShell>
        <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
          {loading ? (
            <div className="flex min-h-[50vh] flex-1 items-center justify-center px-6">
              <Loader2 className="size-10 animate-spin text-white/50" aria-hidden />
            </div>
          ) : error || !panelProps ? (
            <div className="px-6 py-12 text-center text-sm text-white/70">
              Could not load player stats for this match.
            </div>
          ) : (
            <>
              <PlayerMatchScoreDetailPanel {...panelProps} />
              <p className="shrink-0 border-t border-white/10 px-5 py-3 text-xs leading-relaxed text-white/55">
                Totals here are match fantasy from stats only.{" "}
                <span className="text-white/70">
                  Captain (×{P.CAPTAIN_MULTIPLIER}) and vice-captain (×{P.VICE_CAPTAIN_MULTIPLIER})
                </span>{" "}
                multiply your squad entry points for this player in this match — not shown in this view.{" "}
                <span className="text-white/70">Player of the match (+{P.PLAYER_OF_MATCH})</span> is added when this
                player is named in the official score.
              </p>
            </>
          )}
        </div>
      </FantasyDetailDialogShell>
    </Dialog>
  );
};
