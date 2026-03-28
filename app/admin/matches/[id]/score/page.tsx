"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AdminScoreForm, type HydratedPlayerMatchScore } from "@/components/AdminScoreForm";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { AdminScoreMatchPageHero } from "@/components/admin/AdminScoreMatchPageHero";
import { AdminScoreSheetGuide } from "@/components/admin/AdminScoreSheetGuide";
import type { ScorePlayerLite } from "@/components/admin/AdminScoreRosterTab";

interface MatchTeam {
  _id: string;
  name: string;
  shortCode: string;
  logoUrl?: string;
}

interface MatchDetail {
  _id: string;
  matchNumber?: number;
  date?: string;
  venue?: string;
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
  const [initialScores, setInitialScores] = useState<HydratedPlayerMatchScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setLoadError(null);
    fetch(`/api/matches/${id}/admin-roster`)
      .then((r) => {
        if (!r.ok) throw new Error("Could not load match");
        return r.json();
      })
      .then(
        (data: {
          players?: ScorePlayerLite[];
          match?: MatchDetail;
          playerScores?: Array<{
            player: unknown;
            participated?: boolean;
            Batting: HydratedPlayerMatchScore["Batting"];
            Bowling: HydratedPlayerMatchScore["Bowling"];
            Fielding: HydratedPlayerMatchScore["Fielding"];
          }>;
        }) => {
          setPlayers(data.players ?? []);
          setMatch(data.match ?? null);
          setScored(!!data.match?.isScored);
          setInitialScores(
            (data.playerScores ?? []).map((r) => ({
              player: String(r.player),
              participated: r.participated,
              Batting: r.Batting,
              Bowling: r.Bowling,
              Fielding: r.Fielding,
            }))
          );
        }
      )
      .catch(() => setLoadError("Could not load this match. Try again or return to the fixture list."))
      .finally(() => setLoading(false));
  }, [id]);

  const showForm =
    match &&
    players.length > 0 &&
    match.franchiseA?._id &&
    match.franchiseB?._id;

  const heroMatch = match
    ? {
        franchiseA: { shortCode: match.franchiseA.shortCode, logoUrl: match.franchiseA.logoUrl },
        franchiseB: { shortCode: match.franchiseB.shortCode, logoUrl: match.franchiseB.logoUrl },
        matchNumber: match.matchNumber,
        date: match.date,
        venue: match.venue,
      }
    : null;

  return (
    <div className="space-y-8 sm:space-y-10">
      <AdminScoreMatchPageHero loading={loading} match={heroMatch} />

      {loadError ? (
        <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {loadError}
        </p>
      ) : null}

      {loading ? (
        <div className="space-y-4">
          <div className="h-28 animate-pulse rounded-2xl bg-white/10" aria-hidden />
          <div className="h-72 animate-pulse rounded-2xl bg-white/[0.06]" aria-hidden />
        </div>
      ) : (
        <>
          <AdminScoreSheetGuide />

          {scored ? (
            <p className="rounded-xl border border-emerald-400/25 bg-emerald-500/15 px-4 py-3 text-sm text-emerald-100">
              Saved for this fixture. You can change any row and save again — entry totals and ranks are
              recalculated.
            </p>
          ) : null}

          {showForm && match ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-sm ring-1 ring-white/10 sm:p-6">
              <AdminScoreForm
                matchId={id}
                players={players}
                initialScores={initialScores}
                matchTeams={{
                  franchiseA: match.franchiseA,
                  franchiseB: match.franchiseB,
                }}
              />
            </div>
          ) : null}

          {!loadError && match && players.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/20 px-4 py-10 text-center text-sm text-white/70">
              No players found for these franchises. Upload the pool first.
            </p>
          ) : null}
        </>
      )}

      {!loading ? (
        <AdminBackLink href="/admin/matches" className="text-white/70 hover:text-white">
          ← Back to matches
        </AdminBackLink>
      ) : null}
    </div>
  );
}
