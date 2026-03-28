"use client";

import { AdminScoreTeamLogo } from "@/components/admin/AdminScoreTeamLogo";
import type { MatchScorePlayerRow } from "@/components/competitions/CompetitionMatchScoresAccordion";
import { getIplRoleIconUrl, IPL_ROLE_ICON_SVG } from "@/lib/iplRoleIcons";
import { playerRoleLabel } from "@/lib/playerRoleLabel";
import { cricketOversToDecimal } from "@/lib/scoring";
import { cn } from "@/lib/utils";

interface CompetitionMatchPlayerStatCardProps {
  row: MatchScorePlayerRow;
  onOpen: () => void;
}

export const CompetitionMatchPlayerStatCard = ({ row, onOpen }: CompetitionMatchPlayerStatCardProps) => {
  const { Batting: b, Bowling: bw, Fielding: f } = row;
  const oversDec = cricketOversToDecimal(bw.oversBowled);
  const economy = oversDec > 0 ? (bw.runsConceded / oversDec).toFixed(2) : "—";
  const sr = b.ballsFaced > 0 ? ((b.runs / b.ballsFaced) * 100).toFixed(1) : "—";
  const roleIconSrc = getIplRoleIconUrl(row.role) ?? IPL_ROLE_ICON_SVG.bat;

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "w-full rounded-2xl border border-white/15 bg-white/[0.05] p-4 text-left ring-1 ring-white/10 transition-colors",
        "hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400/50",
        "sm:p-5"
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="flex min-w-0 gap-4">
          <div className="flex shrink-0 flex-col items-center gap-2">
            <AdminScoreTeamLogo
              logoUrl={row.franchiseLogoUrl}
              shortCode={row.franchiseShortCode}
              size="lg"
              className="ring-white/25 bg-white/10 !text-white"
            />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/50">
              {row.franchiseShortCode}
            </span>
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-lg font-semibold text-white sm:text-xl">{row.name}</span>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-sky-400/25 bg-sky-500/15 px-2 py-0.5 text-[11px] font-medium text-sky-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={roleIconSrc} alt="" className="size-4 shrink-0 object-contain" />
                {playerRoleLabel(row.role)}
              </span>
              {row.participated ? (
                <span className="rounded border border-emerald-400/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-100">
                  XI
                </span>
              ) : null}
            </div>

            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-2xl font-bold tabular-nums text-amber-200/95">{row.fantasyPoints}</span>
              <span className="text-xs text-white/45">fantasy pts</span>
            </div>
          </div>
        </div>

        <div className="grid shrink-0 grid-cols-3 gap-2 text-right sm:min-w-[200px]">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-white/40">Bat</p>
            <p className="font-semibold tabular-nums text-white">{row.sectionPoints.batting}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-white/40">Bowl</p>
            <p className="font-semibold tabular-nums text-white">{row.sectionPoints.bowling}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-white/40">Fld</p>
            <p className="font-semibold tabular-nums text-white">{row.sectionPoints.fielding}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 text-xs text-white/80 sm:grid-cols-3">
        <div className="space-y-1 rounded-lg bg-white/[0.04] px-3 py-2 ring-1 ring-white/5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-200/70">Batting</p>
          <p>
            {b.runs} runs · {b.ballsFaced} balls · SR {sr}
          </p>
          <p className="text-white/55">
            4s/6s {b.fours}/{b.sixes} · {b.isOut ? "Out" : "Not out"}
          </p>
        </div>
        <div className="space-y-1 rounded-lg bg-white/[0.04] px-3 py-2 ring-1 ring-white/5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-sky-200/70">Bowling</p>
          <p>
            {bw.wickets} wkts · {bw.oversBowled} ov · Econ {economy}
          </p>
          <p className="text-white/55">
            {bw.runsConceded} runs · {bw.maidenOvers} maidens · {bw.dotBalls} dots
            {bw.hasHattrick ? " · Hat-trick" : ""}
          </p>
        </div>
        <div className="space-y-1 rounded-lg bg-white/[0.04] px-3 py-2 ring-1 ring-white/5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-200/70">Fielding</p>
          <p>
            {f.catches} ct · {f.stumpings} st · {f.runOuts} RO
          </p>
          {(f.assistedRunOuts ?? 0) > 0 ? (
            <p className="text-white/55">Assisted RO {f.assistedRunOuts ?? 0}</p>
          ) : null}
        </div>
      </div>

      <p className="mt-3 text-[11px] text-white/40">Tap for full fantasy breakdown</p>
    </button>
  );
};
