"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminScorePlayerAccordion } from "@/components/admin/AdminScorePlayerAccordion";
import { AdminScoreTotalsBar } from "@/components/admin/AdminScoreTotalsBar";
import type { StatFormValues } from "@/components/AdminScorePlayerRow";
import { ADMIN_MATCH_SELECT_CLASS } from "@/components/admin/adminCreateMatchShared";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { totalPlayerMatchFantasyPoints } from "@/lib/scoring";

interface PlayerLite {
  _id: string;
  name: string;
  franchise: { _id: string; shortCode?: string; name?: string };
}

interface MatchTeams {
  franchiseA: { _id: string; shortCode: string; name: string };
  franchiseB: { _id: string; shortCode: string; name: string };
}

interface AdminScoreFormProps {
  matchId: string;
  players: PlayerLite[];
  matchTeams: MatchTeams;
}

const emptyStats = (playerId: string): StatFormValues => ({
  playerId,
  Batting: { runs: 0, ballsFaced: 0, fours: 0, sixes: 0, isOut: false },
  Bowling: { wickets: 0, oversBowled: 0, maidenOvers: 0, runsConceded: 0, dotBalls: 0 },
  Fielding: { catches: 0, stumpings: 0, runOuts: 0 },
});

export const AdminScoreForm = ({ matchId, players, matchTeams }: AdminScoreFormProps) => {
  const [rows, setRows] = useState<Record<string, StatFormValues>>({});
  const [teamFilter, setTeamFilter] = useState<string>("all");

  useEffect(() => {
    const map: Record<string, StatFormValues> = {};
    for (const p of players) map[p._id] = emptyStats(p._id);
    setRows(map);
  }, [players]);

  const update = (id: string, next: StatFormValues) => {
    setRows((prev) => ({ ...prev, [id]: next }));
  };

  const pointsByPlayer = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of players) {
      const row = rows[p._id] ?? emptyStats(p._id);
      map[p._id] = totalPlayerMatchFantasyPoints({
        Batting: row.Batting,
        Bowling: row.Bowling,
        Fielding: row.Fielding,
      });
    }
    return map;
  }, [players, rows]);

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
      { id: matchTeams.franchiseA._id, shortCode: matchTeams.franchiseA.shortCode, total: sum(matchTeams.franchiseA._id) },
      { id: matchTeams.franchiseB._id, shortCode: matchTeams.franchiseB.shortCode, total: sum(matchTeams.franchiseB._id) },
    ] as const;
  }, [players, pointsByPlayer, matchTeams]);

  const visiblePlayers = useMemo(() => {
    if (teamFilter === "all") return players;
    return players.filter((p) => String(p.franchise._id) === teamFilter);
  }, [players, teamFilter]);

  const submit = async () => {
    const stats = Object.values(rows);
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

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Label htmlFor="score-team-filter" className="text-sm font-medium text-muted-foreground">
          Filter by team
        </Label>
        <select
          id="score-team-filter"
          className={ADMIN_MATCH_SELECT_CLASS}
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
        >
          <option value="all">All teams</option>
          <option value={matchTeams.franchiseA._id}>{matchTeams.franchiseA.shortCode}</option>
          <option value={matchTeams.franchiseB._id}>{matchTeams.franchiseB.shortCode}</option>
        </select>
      </div>

      <div className="space-y-3">
        {visiblePlayers.map((p) => {
          const row = rows[p._id] ?? emptyStats(p._id);
          const franchiseLabel = p.franchise?.shortCode ?? p.franchise?.name ?? "—";
          return (
            <AdminScorePlayerAccordion
              key={p._id}
              name={p.name}
              franchiseLabel={franchiseLabel}
              points={pointsByPlayer[p._id] ?? 0}
              value={row}
              onChange={(next) => update(p._id, next)}
            />
          );
        })}
      </div>

      {visiblePlayers.length === 0 && (
        <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          No players for this filter.
        </p>
      )}

      <Button type="button" onClick={submit} size="lg" className="font-semibold">
        Submit all scores
      </Button>
    </div>
  );
};
