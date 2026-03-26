"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminScoreRosterTab, type ScorePlayerLite } from "@/components/admin/AdminScoreRosterTab";
import { AdminScoreTeamMatchTabs } from "@/components/admin/AdminScoreTeamMatchTabs";
import { AdminScoreTotalsBar } from "@/components/admin/AdminScoreTotalsBar";
import type { StatFormValues } from "@/components/AdminScorePlayerRow";
import { Button } from "@/components/ui/button";
import { emptyPlayerScoreStats } from "@/lib/adminScoreEmptyStats";
import { playerMatchFantasyPoints } from "@/lib/scoring";

interface MatchTeams {
  franchiseA: { _id: string; shortCode: string; name: string; logoUrl?: string };
  franchiseB: { _id: string; shortCode: string; name: string; logoUrl?: string };
}

interface AdminScoreFormProps {
  matchId: string;
  players: ScorePlayerLite[];
  matchTeams: MatchTeams;
}

export const AdminScoreForm = ({ matchId, players, matchTeams }: AdminScoreFormProps) => {
  const [rows, setRows] = useState<Record<string, StatFormValues>>({});
  const [participation, setParticipation] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const map: Record<string, StatFormValues> = {};
    const part: Record<string, boolean> = {};
    for (const p of players) {
      map[p._id] = emptyPlayerScoreStats(p._id);
      part[p._id] = false;
    }
    setRows(map);
    setParticipation(part);
  }, [players]);

  const update = (id: string, next: StatFormValues) => {
    setRows((prev) => ({ ...prev, [id]: next }));
  };

  const pointsByPlayer = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of players) {
      const row = rows[p._id] ?? emptyPlayerScoreStats(p._id);
      map[p._id] = playerMatchFantasyPoints(
        {
          Batting: row.Batting,
          Bowling: row.Bowling,
          Fielding: row.Fielding,
        },
        participation[p._id] ?? false
      );
    }
    return map;
  }, [players, rows, participation]);

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
    toast.success("Scores submitted");
  };

  return (
    <div className="space-y-6">
      <AdminScoreTotalsBar grandTotal={grandTotal} teams={[teamTotals[0], teamTotals[1]]} />

      <AdminScoreTeamMatchTabs
        matchTeams={matchTeams}
        homePanel={
          <AdminScoreRosterTab
            list={playersHome}
            rows={rows}
            participation={participation}
            pointsByPlayer={pointsByPlayer}
            update={update}
            setParticipation={setParticipation}
          />
        }
        awayPanel={
          <AdminScoreRosterTab
            list={playersAway}
            rows={rows}
            participation={participation}
            pointsByPlayer={pointsByPlayer}
            update={update}
            setParticipation={setParticipation}
          />
        }
      />

      <Button type="button" onClick={submit} size="lg" className="bg-primary font-semibold hover:bg-primary/90">
        Submit all scores
      </Button>
    </div>
  );
};
