interface TeamPlayerStatsProps {
  squadCount: number
  transferCount: number
  penaltyTotal: number
  competitionTotalFantasyPoints?: number
}

import { cn } from "@/lib/utils";
import { ArrowLeftRight, TrendingDown, Users, Wallet, type LucideIcon } from "lucide-react";
import { remainingSwapScoreBudget, SWAP_BUDGET_LEADERSHIP, SWAP_BUDGET_TIER_SLOT_1, SWAP_BUDGET_TIER_SLOT_2, SWAP_BUDGET_TIER_SLOT_3, SWAP_SCORE_BUDGET_TOTAL } from "@/lib/swapPenaltyRules";

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

export const TeamPlayerStats = ({
  squadCount,
  transferCount,
  penaltyTotal,
  competitionTotalFantasyPoints,
}: TeamPlayerStatsProps) => {
  return (
    <>
      <div className="relative grid grid-cols-3 gap-2 px-4 sm:gap-3 sm:px-6 mt-5">
        <StatCard
          icon={Users}
          label="Squad size"
          value={squadCount || '—'}
          sub="players"
        />
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

      <div className="relative mx-4 mt-3 rounded-xl border border-sky-400/25 bg-sky-500/[0.08] px-4 py-3 shadow-inner shadow-black/20 sm:mx-6 sm:mt-4 sm:px-5 sm:py-4">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-sky-400/30 bg-sky-500/15 text-sky-200">
            <Wallet className="size-4" aria-hidden />
          </span>
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-200/80">
              Swap score budget
            </p>
            <p className="text-2xl font-bold tabular-nums tracking-tight text-white">
              {remainingSwapScoreBudget(penaltyTotal).toLocaleString()}
              <span className="text-sm font-medium text-white/50">
                {' '}
                / {SWAP_SCORE_BUDGET_TOTAL.toLocaleString()} pts remaining
              </span>
            </p>
            <p className="text-[11px] leading-snug text-white/55">
              Pool: {SWAP_BUDGET_TIER_SLOT_1} (tier 1 slot ×2) +{' '}
              {SWAP_BUDGET_TIER_SLOT_2} (tier 3 ×2) + {SWAP_BUDGET_TIER_SLOT_3}{' '}
              (tier 5 ×2) + {SWAP_BUDGET_LEADERSHIP} (captain/vice change). Each
              swap applies the penalty (see Swaps & penalties tab); total
              deducted:{' '}
              <span className="tabular-nums text-amber-200/90">
                {penaltyTotal}
              </span>{' '}
              pts.
            </p>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400/90 to-cyan-400/80 transition-[width]"
                style={{
                  width: `${Math.min(
                    100,
                    (penaltyTotal / SWAP_SCORE_BUDGET_TOTAL) * 100,
                  )}%`,
                }}
              />
            </div>
            {competitionTotalFantasyPoints != null ? (
              <p className="border-t border-white/10 pt-2 text-[11px] leading-snug text-emerald-100/90">
                Competition total fantasy:{' '}
                <span className="font-semibold tabular-nums text-emerald-50">
                  {competitionTotalFantasyPoints.toLocaleString()}
                </span>
                <span className="text-white/50">
                  {' '}
                  — match points plus unused swap budget (same as leaderboard).
                </span>
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="h-4 sm:h-6" aria-hidden />
    </>
  )
}
