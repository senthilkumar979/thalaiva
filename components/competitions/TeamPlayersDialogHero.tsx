"use client";

import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ArrowLeftRight, TrendingDown, Users, type LucideIcon } from "lucide-react";

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2.5 shadow-inner shadow-black/20 backdrop-blur-sm sm:px-4 sm:py-3",
        className
      )}
    >
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-white/45 sm:text-[11px] text-center justify-center">
        <Icon className="size-3.5 shrink-0 text-amber-300/70" aria-hidden />
        {label}
      </div>
      <p className="text-xl font-semibold tabular-nums tracking-tight text-white sm:text-2xl text-center justify-center">{value}</p>
      {sub ? <p className="text-xs text-white/50 text-center justify-center">{sub}</p> : null}
    </div>
  );
}

interface TeamPlayersDialogHeroProps {
  displayName: string;
  loading: boolean;
  squadCount: number;
  transferCount: number;
  penaltyTotal: number;
}

export const TeamPlayersDialogHero = ({
  displayName,
  loading,
  squadCount,
  transferCount,
  penaltyTotal,
}: TeamPlayersDialogHeroProps) => (
  <div className="relative shrink-0 overflow-hidden border-b border-white/10">
    <div
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_0%_-20%,rgba(251,191,36,0.1),transparent),radial-gradient(ellipse_60%_40%_at_100%_100%,rgba(56,189,248,0.07),transparent)]"
      aria-hidden
    />
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-transparent" />
    <DialogHeader className="relative space-y-2 px-4 pb-2 pt-4 text-left sm:px-6 sm:pt-6">
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="h-1 w-8 shrink-0 rounded-full bg-gradient-to-r from-amber-300 to-amber-500/40 sm:w-10" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 sm:text-[11px] sm:tracking-[0.28em]">
          Competition entry
        </p>
      </div>
      <DialogTitle className="text-balance break-words text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-3xl">
        {displayName}
      </DialogTitle>
      <DialogDescription className="text-pretty text-xs leading-relaxed text-white/60 sm:text-sm">
        Roster, roles, IPL sides, fantasy tiers, match points, and transfer history with score penalties.
      </DialogDescription>
    </DialogHeader>

    {!loading ? (
      <div className="relative grid grid-cols-3 gap-2 px-4 pb-4 sm:gap-3 sm:px-6 sm:pb-6">
        <StatCard icon={Users} label="Squad size" value={squadCount || "—"} sub="players" />
        <StatCard
          icon={ArrowLeftRight}
          label="Swaps"
          value={transferCount}
          sub="swaps"
        />
        <StatCard
          icon={TrendingDown}
          label="Penalties"
          value={-penaltyTotal}
          sub="deducted points"
          className="[&>p.font-semibold]:text-amber-200/95"
        />
      </div>
    ) : null}
  </div>
);
