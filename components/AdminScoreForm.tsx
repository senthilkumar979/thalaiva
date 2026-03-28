"use client";

import { AdminScoreRosterTab, type ScorePlayerLite } from "@/components/admin/AdminScoreRosterTab";
import { AdminScoreTeamMatchTabs } from "@/components/admin/AdminScoreTeamMatchTabs";
import { AdminScoreTotalsBar } from "@/components/admin/AdminScoreTotalsBar";
import type { StatFormValues } from "@/components/AdminScorePlayerRow";
import { Button } from "@/components/ui/button";
import { emptyPlayerScoreStats } from "@/lib/adminScoreEmptyStats";
import { statFormToPlayerMatchStats } from "@/lib/adminScoreToUpdatedStats";
import { calculateFantasyPoints } from "@/lib/updatedScoring";
import type { IBattingStats, IBowlingStats, IFieldingStats } from "@/models/PlayerMatchScore";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface MatchTeams {
  franchiseA: { _id: string; shortCode: string; name: string; logoUrl?: string };
  franchiseB: { _id: string; shortCode: string; name: string; logoUrl?: string };
}

export interface HydratedPlayerMatchScore {
  player: string;
  participated?: boolean;
  Batting: IBattingStats;
  Bowling: IBowlingStats;
  Fielding: IFieldingStats;
}

interface AdminScoreFormProps {
  matchId: string;
  players: ScorePlayerLite[];
  matchTeams: MatchTeams;
  /** Existing rows when reopening a scored or partially saved match */
  initialScores?: HydratedPlayerMatchScore[];
  /** Saved match award — Mongo player id */
  initialPlayerOfMatchId?: string | null;
}

export const AdminScoreForm = ({
  matchId,
  players,
  matchTeams,
  initialScores,
  initialPlayerOfMatchId,
}: AdminScoreFormProps) => {
  const [rows, setRows] = useState<Record<string, StatFormValues>>({});
  const [participation, setParticipation] = useState<Record<string, boolean>>({});
  const [playerOfMatchPlayerId, setPlayerOfMatchPlayerId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const byPlayer = new Map<string, HydratedPlayerMatchScore>();
    for (const row of initialScores ?? []) byPlayer.set(String(row.player), row);
    const map: Record<string, StatFormValues> = {};
    const part: Record<string, boolean> = {};
    for (const p of players) {
      const ex = byPlayer.get(p._id);
      if (ex) {
        const base = emptyPlayerScoreStats(p._id);
        map[p._id] = {
          playerId: p._id,
          Batting: { ...base.Batting, ...ex.Batting },
          Bowling: {
            ...base.Bowling,
            ...ex.Bowling,
            hasHattrick: ex.Bowling.hasHattrick ?? false,
          },
          Fielding: {
            ...base.Fielding,
            ...ex.Fielding,
            assistedRunOuts: ex.Fielding.assistedRunOuts ?? 0,
          },
        };
        part[p._id] = ex.participated ?? false;
      } else {
        map[p._id] = emptyPlayerScoreStats(p._id);
        part[p._id] = false;
      }
    }
    setRows(map);
    setParticipation(part);
    setPlayerOfMatchPlayerId(initialPlayerOfMatchId ?? null);
  }, [players, initialScores, initialPlayerOfMatchId]);

  const update = (id: string, next: StatFormValues) => {
    setRows((prev) => ({ ...prev, [id]: next }));
  };

  const pointsByPlayer = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of players) {
      const row = rows[p._id] ?? emptyPlayerScoreStats(p._id);
      const isPom =
        Boolean(playerOfMatchPlayerId && playerOfMatchPlayerId === p._id) &&
        Boolean(participation[p._id]);
      const raw = calculateFantasyPoints(
        statFormToPlayerMatchStats(row, participation[p._id] ?? false, matchId, isPom)
      ).finalScore;
      map[p._id] = Number.isFinite(raw) ? raw : 0;
    }
    return map;
  }, [players, rows, participation, matchId, playerOfMatchPlayerId]);

  const grandTotal = useMemo(
    () => players.reduce((s, p) => s + (pointsByPlayer[p._id] ?? 0), 0),
    [players, pointsByPlayer]
  );

  const teamTotals = useMemo(() => {
    const sum = (fid: string) =>
      players
        .filter((p) => String(p.franchise._id) === fid)
        .reduce((s, p) => s + (pointsByPlayer[p._id] ?? 0), 0);
    return [
      {
        id: matchTeams.franchiseA._id,
        shortCode: matchTeams.franchiseA.shortCode,
        name: matchTeams.franchiseA.name,
        logoUrl: matchTeams.franchiseA.logoUrl,
        total: sum(matchTeams.franchiseA._id),
      },
      {
        id: matchTeams.franchiseB._id,
        shortCode: matchTeams.franchiseB.shortCode,
        name: matchTeams.franchiseB.name,
        logoUrl: matchTeams.franchiseB.logoUrl,
        total: sum(matchTeams.franchiseB._id),
      },
    ] as const;
  }, [players, pointsByPlayer, matchTeams]);

  const playersHome = useMemo(
    () => players.filter((p) => String(p.franchise._id) === matchTeams.franchiseA._id),
    [players, matchTeams.franchiseA._id]
  );
  const playersAway = useMemo(
    () => players.filter((p) => String(p.franchise._id) === matchTeams.franchiseB._id),
    [players, matchTeams.franchiseB._id]
  );

  const onPlayerOfMatchSelect = useCallback(
    (playerId: string) => {
      if (!(participation[playerId] ?? false)) {
        toast.error("Only players in the playing XI can be player of the match.");
        return;
      }
      setPlayerOfMatchPlayerId((prev) => (prev === playerId ? null : playerId));
    },
    [participation]
  );

  const submit = async () => {
    if (
      playerOfMatchPlayerId &&
      !(participation[playerOfMatchPlayerId] ?? false)
    ) {
      toast.error("Player of the match must be in the playing XI — check participation for that player.");
      return;
    }
    setSaving(true);
    try {
      const stats = players.map((p) => {
        const row = rows[p._id] ?? emptyPlayerScoreStats(p._id);
        return {
          playerId: p._id,
          participated: participation[p._id] ?? false,
          Batting: row.Batting,
          Bowling: row.Bowling,
          Fielding: row.Fielding,
        };
      });
      const res = await fetch(`/api/matches/${matchId}/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stats,
          playerOfMatchPlayerId: playerOfMatchPlayerId ?? null,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        toast.error(j.error ?? "Submit failed");
        return;
      }
      toast.success("Scores saved");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-white">
        Enter{" "}
        <strong className="font-medium text-white font-bold text-yellow-500">raw match stats</strong> for each player who{' '}
        <strong className="font-medium text-white font-bold text-yellow-500">played in the XI</strong> — same categories as{" "}
        <Link
          href="/competitions"
          className="font-medium text-white font-bold underline"
        >
          Scoring rules
        </Link>
        . Milestones, strike rate, economy, and hauls are derived automatically. Flag{' '}
        <strong className="font-medium text-white font-bold  text-yellow-500">hat-tricks</strong> and count{' '}
        <strong className="font-medium text-foreground  text-yellow-500">assisted run-outs</strong> where applicable. Use the{" "}
        <strong className="font-medium text-yellow-500">award icon</strong> on a player row to set{" "}
        <strong className="font-medium text-yellow-500">player of the match</strong> (+50 pts; they must be in the XI).
        Captain, vice-captain, and playoff multipliers apply on entries, not on this sheet.
      </p>
      <AdminScoreTotalsBar grandTotal={grandTotal} teams={[teamTotals[0], teamTotals[1]]} />

      <AdminScoreTeamMatchTabs
        matchTeams={matchTeams}
        homePanel={
          <AdminScoreRosterTab
            matchId={matchId}
            list={playersHome}
            rows={rows}
            participation={participation}
            update={update}
            setParticipation={setParticipation}
            playerOfMatchPlayerId={playerOfMatchPlayerId}
            onPlayerOfMatchSelect={onPlayerOfMatchSelect}
          />
        }
        awayPanel={
          <AdminScoreRosterTab
            matchId={matchId}
            list={playersAway}
            rows={rows}
            participation={participation}
            update={update}
            setParticipation={setParticipation}
            playerOfMatchPlayerId={playerOfMatchPlayerId}
            onPlayerOfMatchSelect={onPlayerOfMatchSelect}
          />
        }
      />

      <div className="flex justify-center items-center">
        <Button
          type="button"
          onClick={submit}
          size="lg"
          disabled={saving}
          className="w-full bg-yellow-500 border border-white/20 text-white font-semibold sm:w-auto hover:bg-yellow-500/40 hover:text-white ease-in-out duration-300 enabled:hover:bg-yellow-500/40 enabled:hover:text-white"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
              Saving…
            </>
          ) : (
            "Save match scores"
          )}
        </Button>
      </div>
    </div>
  );
};
