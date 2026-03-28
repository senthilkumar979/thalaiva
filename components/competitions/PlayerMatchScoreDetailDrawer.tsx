"use client";

import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import type { IBattingStats, IBowlingStats, IFieldingStats } from "@/models/PlayerMatchScore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlayerScoreIdentityBlock } from "@/components/PlayerScoreIdentityBlock";
import { cn } from "@/lib/utils";
import {
  getPlayerMatchFantasyPointsBreakdown,
  groupBreakdownBySection,
} from "@/lib/scoring";
import { COMPETITION_BRAND_BG, COMPETITION_ORB_DEEP } from "@/components/competitions/competitionTheme";

interface PlayerMatchScoreDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playerName: string;
  matchTitle: string;
  franchiseShortCode: string;
  franchiseLogoUrl?: string;
  franchiseName?: string;
  role: string;
  Batting: IBattingStats;
  Bowling: IBowlingStats;
  Fielding: IFieldingStats;
  participated: boolean;
}

function FantasyLineRows({ rows }: { rows: { label: string; points: number }[] }) {
  return (
    <ul className="mt-3 space-y-1.5 text-sm">
      {rows.map((r) => (
        <li key={r.label} className="flex justify-between gap-4 tabular-nums">
          <span className="text-white/85">{r.label}</span>
          <span className={cn("font-medium", r.points < 0 ? "text-rose-300" : "text-emerald-200")}>
            {r.points > 0 ? "+" : ""}
            {r.points}
          </span>
        </li>
      ))}
    </ul>
  );
}

const fantasyAccent = {
  amber: "border-amber-400/25 bg-white/[0.04] ring-amber-400/10",
  sky: "border-sky-400/25 bg-white/[0.04] ring-sky-400/10",
  emerald: "border-emerald-400/25 bg-white/[0.04] ring-emerald-400/10",
  violet: "border-violet-400/25 bg-white/[0.04] ring-violet-400/10",
} as const;

function FantasySectionCard({
  title,
  rows,
  accent,
}: {
  title: string;
  rows: { label: string; points: number }[];
  accent: keyof typeof fantasyAccent;
}) {
  return (
    <section className={cn("rounded-xl border p-4 ring-1", fantasyAccent[accent])}>
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-white/45">No fantasy points in this section.</p>
      ) : (
        <FantasyLineRows rows={rows} />
      )}
    </section>
  );
}

function RawBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4 ring-1 ring-white/5">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function RawDl({
  items,
}: {
  items: { label: string; value: ReactNode }[];
}) {
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
      {items.map(({ label, value }) => (
        <div key={label} className="contents">
          <dt className="text-white/50">{label}</dt>
          <dd className="tabular-nums text-white">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export const PlayerMatchScoreDetailDrawer = ({
  open,
  onOpenChange,
  playerName,
  matchTitle,
  franchiseShortCode,
  franchiseLogoUrl,
  franchiseName,
  role,
  Batting,
  Bowling,
  Fielding,
  participated,
}: PlayerMatchScoreDetailDrawerProps) => {
  const { total, breakdown } = getPlayerMatchFantasyPointsBreakdown(
    { Batting, Bowling, Fielding },
    participated
  );
  const grouped = groupBreakdownBySection(breakdown);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className={cn(
          "fixed top-0 right-0 left-auto flex h-full max-h-[100dvh] max-w-md translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none rounded-l-2xl border-0 p-0 sm:max-w-md",
          /* Dialog defaults use bg-popover — use transparent shell + themed layer below */
          "!border-0 !bg-transparent !p-0 !text-white shadow-2xl shadow-black/50 ring-1 ring-white/15",
          "[&_[data-slot=dialog-close]]:z-20 [&_[data-slot=dialog-close]]:text-white/70 [&_[data-slot=dialog-close]]:hover:bg-white/10 [&_[data-slot=dialog-close]]:hover:text-white"
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-l-2xl"
          style={{ backgroundColor: COMPETITION_BRAND_BG }}
          aria-hidden
        >
          <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div
            className="absolute -right-20 bottom-0 h-64 w-64 rounded-full opacity-80 blur-3xl"
            style={{ backgroundColor: COMPETITION_ORB_DEEP }}
          />
          <div className="absolute left-1/2 top-0 h-px w-[min(100%,28rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a1f4a]/35 via-transparent to-[#050a1a]/40" />
        </div>

        <DialogHeader className="relative z-10 shrink-0 space-y-3 border-b border-white/10 px-5 py-5 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white/55">
              <Sparkles className="size-3 text-amber-300/90" aria-hidden />
              Fantasy
            </span>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1",
                participated
                  ? "bg-emerald-500/15 text-emerald-200 ring-emerald-400/25"
                  : "bg-white/10 text-white/45 ring-white/15"
              )}
            >
              {participated ? "Played in XI" : "Bench / DNP"}
            </span>
          </div>
          <div className="space-y-1">
            <DialogTitle className="text-xl font-bold leading-tight tracking-tight text-white">
              {playerName}
            </DialogTitle>
            <p className="text-sm font-normal leading-snug text-white/65">{matchTitle}</p>
          </div>
          <PlayerScoreIdentityBlock
            franchiseShortCode={franchiseShortCode}
            franchiseLogoUrl={franchiseLogoUrl}
            franchiseLine={franchiseName}
            role={role}
          />
        </DialogHeader>

        <div className="relative z-10 flex min-h-0 flex-1 flex-col space-y-5 overflow-y-auto px-5 py-5 text-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">Raw stats</p>

          <RawBlock title="Batting">
            <RawDl
              items={[
                { label: "Runs", value: Batting.runs },
                { label: "Balls", value: Batting.ballsFaced },
                {
                  label: "4s / 6s",
                  value: (
                    <>
                      {Batting.fours} / {Batting.sixes}
                    </>
                  ),
                },
                { label: "Out", value: Batting.isOut ? "Yes" : "No" },
              ]}
            />
          </RawBlock>

          <RawBlock title="Bowling">
            <RawDl
              items={[
                { label: "Wickets", value: Bowling.wickets },
                { label: "Overs", value: Bowling.oversBowled },
                { label: "Runs conc.", value: Bowling.runsConceded },
                {
                  label: "Maidens / Dots",
                  value: (
                    <>
                      {Bowling.maidenOvers} / {Bowling.dotBalls}
                    </>
                  ),
                },
              ]}
            />
          </RawBlock>

          <RawBlock title="Fielding">
            <RawDl
              items={[
                { label: "Catches", value: Fielding.catches },
                { label: "Stumpings", value: Fielding.stumpings },
                { label: "Run-outs", value: Fielding.runOuts },
              ]}
            />
          </RawBlock>

          <p className="pt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
            Fantasy points
          </p>

          <FantasySectionCard title="Batting" rows={grouped.batting} accent="amber" />
          <FantasySectionCard title="Bowling" rows={grouped.bowling} accent="sky" />
          <FantasySectionCard title="Fielding" rows={grouped.fielding} accent="emerald" />

          {grouped.participation.length > 0 ? (
            <FantasySectionCard title="Match participation" rows={grouped.participation} accent="violet" />
          ) : null}

          <div className="flex items-center justify-between rounded-xl border border-emerald-400/25 bg-emerald-500/15 px-4 py-3 font-semibold tabular-nums text-emerald-100 shadow-inner shadow-black/20">
            <span>Total fantasy</span>
            <span className="text-lg">{total}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
