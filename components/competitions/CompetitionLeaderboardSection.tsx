"use client";

import { Trophy } from "lucide-react";
import { LeaderboardTable, type LeaderboardRow } from "@/components/LeaderboardTable";

interface CompetitionLeaderboardSectionProps {
  rows: LeaderboardRow[];
  highlightEmail: string | null;
  onTeamClick?: (row: LeaderboardRow) => void;
  /** Shown when squads are private (before freeze). */
  privacyNote?: string | null;
}

export const CompetitionLeaderboardSection = ({
  rows,
  highlightEmail,
  onTeamClick,
  privacyNote,
}: CompetitionLeaderboardSectionProps) => (
  <section className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/[0.04] shadow-2xl ring-1 ring-white/10">
    <div
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_0%_-20%,rgba(251,191,36,0.08),transparent),radial-gradient(ellipse_60%_40%_at_100%_100%,rgba(56,189,248,0.06),transparent)]"
      aria-hidden
    />
    <div className="relative space-y-5 px-4 py-6 sm:space-y-6 sm:px-8 sm:py-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <div className="flex shrink-0 flex-col items-center gap-2">
            <span className="h-1 w-12 rounded-full bg-gradient-to-r from-amber-300 to-amber-500/40" />
            <span className="flex size-12 items-center justify-center rounded-2xl border border-amber-400/25 bg-white/[0.08] shadow-inner shadow-black/20 ring-1 ring-white/10">
              <Trophy className="size-5 text-amber-300/90" aria-hidden />
            </span>
          </div>
          <div className="min-w-0 space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">Standings</p>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Leaderboard</h2>
            <p className="max-w-xl text-sm leading-relaxed text-white/60">
              Total fantasy points across every scored match. Updates as admins lock in results.
            </p>
            {privacyNote ? (
              <p className="mt-3 max-w-xl rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-xs leading-relaxed text-amber-100/90">
                {privacyNote}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-black/25 p-1 backdrop-blur-sm">
        <div className="-mx-1 overflow-x-auto overscroll-x-contain rounded-lg px-1 py-2 touch-pan-x sm:mx-0 sm:px-4 sm:py-4">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 bg-white/[0.02] p-12 text-center">
              <p className="text-sm font-medium text-white/70">No entries yet</p>
              <p className="max-w-sm text-xs text-white/45">Enter the competition to appear on the board once squads are submitted.</p>
            </div>
          ) : (
            <LeaderboardTable
              rows={rows}
              highlightEmail={highlightEmail}
              onTeamClick={onTeamClick}
              variant="competition"
            />
          )}
        </div>
      </div>

      {onTeamClick ? (
        <p className="text-center text-[11px] text-white/40">
          Tap a team row to open the squad page (when enabled).
        </p>
      ) : null}
    </div>
  </section>
);
