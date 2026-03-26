"use client";

import { Trophy } from "lucide-react";
import { LeaderboardTable, type LeaderboardRow } from "@/components/LeaderboardTable";

interface CompetitionLeaderboardSectionProps {
  rows: LeaderboardRow[];
  highlightEmail: string | null;
}

export const CompetitionLeaderboardSection = ({
  rows,
  highlightEmail,
}: CompetitionLeaderboardSectionProps) => (
  <section className="space-y-4">
    <div className="flex items-center gap-2">
      <span className="flex size-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
        <Trophy className="size-4 text-amber-300/90" />
      </span>
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-white">Leaderboard</h2>
        <p className="text-sm text-white/50">Rankings by total fantasy points.</p>
      </div>
    </div>
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.97] p-1 shadow-2xl">
      <div className="rounded-2xl bg-white p-2 sm:p-4">
        {rows.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-500">No entries yet. Be the first to join.</p>
        ) : (
          <LeaderboardTable rows={rows} highlightEmail={highlightEmail} />
        )}
      </div>
    </div>
  </section>
);
