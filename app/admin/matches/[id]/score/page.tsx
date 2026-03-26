"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { AdminScoreForm } from "@/components/AdminScoreForm";
import { AdminScoreTeamLogo } from "@/components/admin/AdminScoreTeamLogo";
import type { ScorePlayerLite } from "@/components/admin/AdminScoreRosterTab";

interface MatchTeam {
  _id: string;
  name: string;
  shortCode: string;
  logoUrl?: string;
}

interface MatchDetail {
  _id: string;
  isScored?: boolean;
  franchiseA: MatchTeam;
  franchiseB: MatchTeam;
}

export default function AdminScorePage() {
  const params = useParams();
  const id = String(params.id);
  const [players, setPlayers] = useState<ScorePlayerLite[]>([]);
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [scored, setScored] = useState(false);

  useEffect(() => {
    fetch(`/api/matches/${id}/admin-roster`)
      .then((r) => r.json())
      .then((data) => {
        setPlayers(data.players ?? []);
        setMatch(data.match ?? null);
        setScored(!!data.match?.isScored);
      })
      .catch(() => undefined);
  }, [id]);

  const canScore =
    !scored &&
    match &&
    players.length > 0 &&
    match.franchiseA?._id &&
    match.franchiseB?._id;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <ClipboardList className="size-3.5" aria-hidden />
            Scoring
          </div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Score match</h1>
          <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            Mark who played to award +2 participation. Enter stats per player; totals update live. Use Home / Away
            tabs — Home opens by default.
          </p>
          {match ? (
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-2 font-medium text-foreground">
                <AdminScoreTeamLogo logoUrl={match.franchiseA.logoUrl} shortCode={match.franchiseA.shortCode} />
                {match.franchiseA.shortCode}
              </span>
              <span className="text-muted-foreground">vs</span>
              <span className="inline-flex items-center gap-2 font-medium text-foreground">
                <AdminScoreTeamLogo logoUrl={match.franchiseB.logoUrl} shortCode={match.franchiseB.shortCode} />
                {match.franchiseB.shortCode}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {scored && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
          This match is already marked as scored. Re-entry is disabled.
        </p>
      )}
      {canScore ? (
        <AdminScoreForm
          matchId={id}
          players={players}
          matchTeams={{
            franchiseA: match.franchiseA,
            franchiseB: match.franchiseB,
          }}
        />
      ) : null}
      {!scored && match && players.length === 0 && (
        <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
          No players found for these franchises. Upload the pool first.
        </p>
      )}
    </div>
  );
}
