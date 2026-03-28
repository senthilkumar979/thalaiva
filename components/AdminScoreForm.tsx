"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminScoreRosterTab, type ScorePlayerLite } from "@/components/admin/AdminScoreRosterTab";
import { AdminScoreTeamMatchTabs } from "@/components/admin/AdminScoreTeamMatchTabs";
import { AdminScoreTotalsBar } from "@/components/admin/AdminScoreTotalsBar";
import type { StatFormValues } from "@/components/AdminScorePlayerRow";
import { Button } from "@/components/ui/button";
import { statFormToPlayerMatchStats } from "@/lib/adminScoreToUpdatedStats";
import { emptyPlayerScoreStats } from "@/lib/adminScoreEmptyStats";
import { calculateFantasyPoints } from "@/lib/updatedScoring";
import type { IBattingStats, IBowlingStats, IFieldingStats } from "@/models/PlayerMatchScore";

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
}

export const AdminScoreForm = ({ matchId, players, matchTeams, initialScores }: AdminScoreFormProps) => {
  const [rows, setRows] = useState<Record<string, StatFormValues>>({});
  const [participation, setParticipation] = useState<Record<string, boolean>>({});

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
  }, [players, initialScores]);

  const update = (id: string, next: StatFormValues) => {
    setRows((prev) => ({ ...prev, [id]: next }));
  };

  const pointsByPlayer = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of players) {
      const row = rows[p._id] ?? emptyPlayerScoreStats(p._id);
      const raw = calculateFantasyPoints(
        statFormToPlayerMatchStats(row, participation[p._id] ?? false, matchId)
      ).finalScore;
      map[p._id] = Number.isFinite(raw) ? raw : 0;
    }
    return map;
  }, [players, rows, participation, matchId]);

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

  const submit = async () => {
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
      body: JSON.stringify({ stats }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast.error(j.error ?? "Submit failed");
      return;
    }
    toast.success("Scores saved");
  };

  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Enter{" "}
        <strong className="font-medium text-foreground">raw match stats</strong> for each player who{" "}
        <strong className="font-medium text-foreground">played in the XI</strong> — same categories as{" "}
        <Link
          href="/competitions"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Scoring rules
        </Link>
        . Milestones, strike rate, economy, and hauls are derived automatically. Flag{" "}
        <strong className="font-medium text-foreground">hat-tricks</strong> and count{" "}
        <strong className="font-medium text-foreground">assisted run-outs</strong> where applicable. Captain,
        vice-captain, and playoff multipliers apply on entries, not on this sheet.
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
          />
        }
      />

      <Button type="button" onClick={submit} size="lg" className="w-full bg-primary font-semibold sm:w-auto hover:bg-primary/90">
        Save match scores
      </Button>
    </div>
  );
};
