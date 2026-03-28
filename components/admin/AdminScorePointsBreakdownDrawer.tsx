"use client";

import { PieChart, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface AdminScorePointsBreakdownDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playerName: string;
  lineItems: { label: string; points: number }[];
  rawTotal: number;
  finalScore: number;
}

export const AdminScorePointsBreakdownDrawer = ({
  open,
  onOpenChange,
  playerName,
  lineItems,
  rawTotal,
  finalScore,
}: AdminScorePointsBreakdownDrawerProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className={cn(
          "fixed top-10 right-10 left-auto flex h-full max-h-[93dvh] max-w-md translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none rounded-2xl border-0 p-0 sm:max-w-md",
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

        <DialogHeader className="relative z-10 shrink-0 space-y-3 border-b border-white/10 px-5 py-5 text-left">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white/55">
            <Sparkles className="size-3 text-amber-300/90" aria-hidden />
            Points breakdown
          </span>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/5">
              <PieChart className="size-4 text-sky-300/90" aria-hidden />
            </span>
            <div className="min-w-0 space-y-1">
              <DialogTitle className="text-xl font-bold leading-tight tracking-tight text-white">
                {playerName}
              </DialogTitle>
              <DialogDescription className="text-left text-sm text-white/65">
                Admin scoring · same engine as competitions
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-5 text-sm">
          <p className="text-xs leading-relaxed text-white/55">
            Captain, vice-captain, and playoff multipliers apply on user entries only — not on this sheet.
          </p>

          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-4 ring-1 ring-white/5">
            {lineItems.length === 0 ? (
              <p className="text-sm text-white/50">No line items (only base total).</p>
            ) : (
              <ul className="space-y-2.5">
                {lineItems.map((row) => (
                  <li key={row.label} className="flex justify-between gap-4 tabular-nums">
                    <span className="text-white/85">{row.label}</span>
                    <span
                      className={cn(
                        "font-medium",
                        row.points < 0 ? "text-rose-300" : "text-emerald-200"
                      )}
                    >
                      {row.points > 0 ? "+" : ""}
                      {row.points}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-4 flex justify-between gap-4 border-t border-white/10 pt-4 tabular-nums text-white/55">
            <span>Raw total</span>
            <span className="font-medium text-white">
              {Number.isFinite(rawTotal) ? rawTotal : 0}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-emerald-400/25 bg-emerald-500/15 px-4 py-3 font-semibold tabular-nums text-emerald-100 shadow-inner shadow-black/20">
            <span>Final score</span>
            <span className="text-lg">{Number.isFinite(finalScore) ? finalScore : 0}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
