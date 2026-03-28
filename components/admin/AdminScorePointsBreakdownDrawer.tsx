"use client";

import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlayerScoreIdentityBlock } from "@/components/PlayerScoreIdentityBlock";
import { groupUpdatedBreakdownLinesBySection } from "@/lib/adminUpdatedScoreBreakdown";
import type { PointsBreakdown } from "@/lib/updatedScoring";
import { cn } from "@/lib/utils";

export interface AdminScorePointsBreakdownDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playerName: string;
  franchiseShortCode: string;
  franchiseLogoUrl?: string;
  franchiseLine?: string;
  role: string;
  pointsBreakdown: PointsBreakdown;
}

const SECTIONS = [
  {
    key: "batting" as const,
    title: "Batting",
    emptyHint: "No batting points in this match.",
    ring: "ring-amber-400/15",
    border: "border-amber-400/20",
  },
  {
    key: "bowling" as const,
    title: "Bowling",
    emptyHint: "No bowling points in this match.",
    ring: "ring-sky-400/15",
    border: "border-sky-400/20",
  },
  {
    key: "fielding" as const,
    title: "Fielding",
    emptyHint: "No fielding points in this match.",
    ring: "ring-emerald-400/15",
    border: "border-emerald-400/20",
  },
  {
    key: "other" as const,
    title: "Bonuses & awards",
    emptyHint: "No bonuses or awards in this breakdown.",
    ring: "ring-violet-400/15",
    border: "border-violet-400/20",
  },
] as const;

function FantasyRows({
  rows,
  emptyLabel,
}: {
  rows: { label: string; points: number }[];
  emptyLabel: string;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-white/45">{emptyLabel}</p>;
  }
  return (
    <ul className="space-y-2 text-sm">
      {rows.map((row) => (
        <li key={row.label} className="flex justify-between gap-4 tabular-nums">
          <span className="text-white/85">{row.label}</span>
          <span
            className={cn("font-medium", row.points < 0 ? "text-rose-300" : "text-emerald-200")}
          >
            {row.points > 0 ? "+" : ""}
            {row.points}
          </span>
        </li>
      ))}
    </ul>
  );
}

export const AdminScorePointsBreakdownDrawer = ({
  open,
  onOpenChange,
  playerName,
  franchiseShortCode,
  franchiseLogoUrl,
  franchiseLine,
  role,
  pointsBreakdown,
}: AdminScorePointsBreakdownDrawerProps) => {
  const sections = useMemo(
    () => groupUpdatedBreakdownLinesBySection(pointsBreakdown),
    [pointsBreakdown]
  );
  const rawTotal = Number.isFinite(pointsBreakdown.rawTotal) ? pointsBreakdown.rawTotal : 0;
  const finalScore = Number.isFinite(pointsBreakdown.finalScore) ? pointsBreakdown.finalScore : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className={cn(
          "fixed top-0 right-0 left-auto flex h-full max-h-[100dvh] max-w-md translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none rounded-l-2xl border-0 p-0 sm:max-w-md",
          "!bg-transparent !p-0 !text-white shadow-2xl shadow-black/50 ring-1 ring-white/15",
          "[&_[data-slot=dialog-close]]:z-20 [&_[data-slot=dialog-close]]:text-white/70 [&_[data-slot=dialog-close]]:hover:bg-white/10 [&_[data-slot=dialog-close]]:hover:text-white"
        )}
      >
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-l-2xl" aria-hidden>
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a1f4a] via-[#19398a] to-[#071229]" />
          <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-sky-500/12 blur-3xl" />
          <div className="absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="absolute left-1/2 top-0 h-px w-[min(100%,28rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>

        <DialogHeader className="relative z-10 shrink-0 space-y-4 border-b border-white/10 px-5 py-5 text-left">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white/55">
            <Sparkles className="size-3 text-amber-300/90" aria-hidden />
            Points breakdown
          </span>
          <div className="space-y-1">
            <DialogTitle className="text-xl font-bold leading-tight tracking-tight text-white">
              {playerName}
            </DialogTitle>
            <DialogDescription className="text-left text-sm text-white/65">
              Admin scoring · same engine as competitions
            </DialogDescription>
          </div>
          <PlayerScoreIdentityBlock
            franchiseShortCode={franchiseShortCode}
            franchiseLogoUrl={franchiseLogoUrl}
            franchiseLine={franchiseLine}
            role={role}
          />
        </DialogHeader>

        <div className="relative z-10 flex min-h-0 flex-1 flex-col space-y-4 overflow-y-auto px-5 py-5 text-sm">
          <p className="text-xs leading-relaxed text-white/55">
            Captain, vice-captain, and playoff multipliers apply on user entries only — not on this sheet.
          </p>

          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">By section</p>

          <div className="space-y-3">
            {SECTIONS.map(({ key, title, emptyHint, ring, border }) => {
              const rows = sections[key];
              if (key === "other" && rows.length === 0) return null;
              return (
                <section
                  key={key}
                  className={cn(
                    "rounded-xl border bg-white/[0.04] p-4 ring-1",
                    border,
                    ring
                  )}
                >
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">{title}</h3>
                  <div className="mt-3">
                    <FantasyRows rows={rows} emptyLabel={emptyHint} />
                  </div>
                </section>
              );
            })}
          </div>

          <div className="flex justify-between gap-4 border-t border-white/10 pt-4 tabular-nums text-white/55">
            <span>Raw total</span>
            <span className="font-medium text-white">{rawTotal}</span>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-emerald-400/25 bg-emerald-500/15 px-4 py-3 font-semibold tabular-nums text-emerald-100 shadow-inner shadow-black/20">
            <span>Final score</span>
            <span className="text-lg">{finalScore}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
