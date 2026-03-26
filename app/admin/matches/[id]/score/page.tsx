"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AdminScoreForm } from "@/components/AdminScoreForm";

interface PlayerLite {
  _id: string;
  name: string;
  franchise: { shortCode?: string; name?: string };
}

export default function AdminScorePage() {
  const params = useParams();
  const id = String(params.id);
  const [players, setPlayers] = useState<PlayerLite[]>([]);
  const [scored, setScored] = useState(false);

  useEffect(() => {
    fetch(`/api/matches/${id}/admin-roster`)
      .then((r) => r.json())
      .then((data) => {
        setPlayers(data.players ?? []);
        setScored(!!data.match?.isScored);
      })
      .catch(() => undefined);
  }, [id]);

  return (
    <div className="space-y-4">
      <Link href="/admin/matches" className="text-sm text-primary underline">
        Back to matches
      </Link>
      <h1 className="text-2xl font-semibold">Score match</h1>
      {scored && (
        <p className="text-sm text-amber-600">This match is already marked as scored. Re-entry is disabled.</p>
      )}
      {!scored && players.length > 0 && <AdminScoreForm matchId={id} players={players} />}
      {!scored && players.length === 0 && (
        <p className="text-sm text-muted-foreground">No players found for these franchises. Upload the pool first.</p>
      )}
    </div>
  );
}
