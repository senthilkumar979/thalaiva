'use client'

import { SWAP_SCORE_BUDGET_TOTAL } from '@/lib/swapPenaltyRules'

interface TeamPlayersDialogHeroProps {
  displayName: string
  totalFantasyPoints?: number
  penaltyTotal?: number
  rank?: number
}

export const TeamPlayersDialogHero = ({
  displayName,
  totalFantasyPoints,
  penaltyTotal,
  rank,
}: TeamPlayersDialogHeroProps) => (
  <div className="relative shrink-0 overflow-hidden border-b border-white/10">
    <div
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_0%_-20%,rgba(251,191,36,0.1),transparent),radial-gradient(ellipse_60%_40%_at_100%_100%,rgba(56,189,248,0.07),transparent)]"
      aria-hidden
    />
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-transparent" />
    <header className="relative space-y-2 px-4 pb-2 pt-4 text-left sm:px-6 sm:pt-6">
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="h-1 w-8 shrink-0 rounded-full bg-gradient-to-r from-amber-300 to-amber-500/40 sm:w-10" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 sm:text-[11px] sm:tracking-[0.28em]">
          Competition entry
        </p>
      </div>
      <h1 className="text-balance break-words text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-3xl flex flex-col sm:flex-row items-center gap-2 justify-between">
        {displayName}
        <div className="flex flex-row sm:flex-row items-start sm:items-center gap-3 sm:gap-4 bg-white/5 px-3 py-2 rounded-lg">
          <div className="flex flex-col items-start">
            <span className="text-xs font-semibold text-amber-300 tracking-wide uppercase">
              Fantasy Points Earned
            </span>
            <span className="text-lg font-bold text-white">
              {(totalFantasyPoints ?? 0) - (1100 - (penaltyTotal ?? 0))}
            </span>
          </div>
          <div className="hidden sm:block h-7 w-px bg-white/10 rounded" />
          <div className="flex flex-col items-start">
            <span className="text-xs font-semibold text-sky-300 tracking-wide uppercase">
              Unused Swap Budget
            </span>
            <span className="text-lg font-bold text-white">
              {1100 - (penaltyTotal ?? 0)}
            </span>
          </div>
          <div className="hidden sm:block h-7 w-px bg-white/10 rounded" />
          <div className="flex flex-col items-start">
            <span className="text-xs font-semibold text-lime-300 tracking-wide uppercase">
              Total Fantasy Points
            </span>
            <span className="text-lg font-bold text-white">
              {totalFantasyPoints}
            </span>
          </div>
          <div className="hidden sm:block h-7 w-px bg-white/10 rounded" />
          <div className="flex flex-col items-start">
            <span className="text-xs font-semibold text-lime-300 tracking-wide uppercase">
              Rank
            </span>
            <span className="text-lg font-bold text-white">#{rank}</span>
          </div>
        </div>
      </h1>
      <p className="text-pretty text-xs leading-relaxed text-white/60 sm:text-sm">
        Roster, roles, IPL sides, fantasy tiers, match points, and transfer
        history with score penalties. Each entry starts with a{' '}
        {SWAP_SCORE_BUDGET_TOTAL.toLocaleString()}-pt swap score budget (tier
        slots + leadership); swaps reduce your fantasy total per league rules.
      </p>
    </header>
  </div>
)
