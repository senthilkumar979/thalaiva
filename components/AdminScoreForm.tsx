"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminScorePlayerRow, type StatFormValues } from "@/components/AdminScorePlayerRow";
import { Button } from "@/components/ui/button";

interface PlayerLite {
  _id: string;
  name: string;
  franchise: { shortCode?: string; name?: string };
}

interface AdminScoreFormProps {
  matchId: string;
  players: PlayerLite[];
}

const emptyStats = (playerId: string): StatFormValues => ({
  playerId,
  Batting: { runs: 0, ballsFaced: 0, fours: 0, sixes: 0, isOut: false },
  Bowling: { wickets: 0, oversBowled: 0, maidenOvers: 0, runsConceded: 0, dotBalls: 0 },
  Fielding: { catches: 0, stumpings: 0, runOuts: 0 },
});

export const AdminScoreForm = ({ matchId, players }: AdminScoreFormProps) => {
  const initial = useMemo(() => {
    const map: Record<string, StatFormValues> = {};
    for (const p of players) map[p._id] = emptyStats(p._id);
    return map;
  }, [players]);

  const [rows, setRows] = useState<Record<string, StatFormValues>>(initial);

  const update = (id: string, next: StatFormValues) => {
    setRows((prev) => ({ ...prev, [id]: next }));
  };

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
    <div className="space-y-4">
      {players.map((p) => (
        <AdminScorePlayerRow
          key={p._id}
          name={p.name}
          franchise={p.franchise?.shortCode ?? p.franchise?.name ?? "—"}
          value={rows[p._id] ?? emptyStats(p._id)}
          onChange={(next) => update(p._id, next)}
        />
      ))}
      <Button type="button" onClick={submit}>
        Submit all scores
      </Button>
    </div>
  );
};
