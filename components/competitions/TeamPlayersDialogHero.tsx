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
        "flex flex-col gap-1 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 shadow-inner shadow-black/20 backdrop-blur-sm",
        className
      )}
    >
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-white/45">
        <Icon className="size-3.5 text-amber-300/70" aria-hidden />
        {label}
      </div>
      <p className="text-2xl font-semibold tabular-nums tracking-tight text-white">{value}</p>
      {sub ? <p className="text-xs text-white/50">{sub}</p> : null}
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
    <DialogHeader className="relative space-y-2 px-6 pb-2 pt-6 text-left">
      <div className="flex items-center gap-3">
        <span className="h-1 w-10 rounded-full bg-gradient-to-r from-amber-300 to-amber-500/40" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">Competition entry</p>
      </div>
      <DialogTitle className="text-balance text-2xl font-bold tracking-tight text-white sm:text-3xl">
        {displayName}
      </DialogTitle>
      <DialogDescription className="text-pretty text-sm leading-relaxed text-white/60">
        Roster, roles, IPL sides, fantasy tiers, match points, and transfer history with score penalties.
      </DialogDescription>
    </DialogHeader>

    {!loading ? (
      <div className="relative grid grid-cols-1 gap-3 px-6 pb-6 sm:grid-cols-3">
        <StatCard icon={Users} label="Squad size" value={squadCount || "—"} sub="players in this entry" />
        <StatCard
          icon={ArrowLeftRight}
          label="Transfer lines"
          value={transferCount}
          sub="swap & leadership events"
        />
        <StatCard
          icon={TrendingDown}
          label="Penalties"
          value={penaltyTotal}
          sub="total pts deducted from fantasy score"
          className="[&_p.text-2xl]:text-amber-200/95"
        />
      </div>
    ) : null}
  </div>
);
