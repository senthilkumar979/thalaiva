"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ClipboardList } from "lucide-react";
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
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
            <ClipboardList className="size-3.5" aria-hidden />
            Scoring
          </div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Score match</h1>
          <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            Enter fantasy points per player. Use breadcrumbs to return to the match list.
          </p>
        </div>
      </div>

      {scored && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
          This match is already marked as scored. Re-entry is disabled.
        </p>
      )}
      {!scored && players.length > 0 && <AdminScoreForm matchId={id} players={players} />}
      {!scored && players.length === 0 && (
        <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
          No players found for these franchises. Upload the pool first.
        </p>
      )}
    </div>
  );
}
