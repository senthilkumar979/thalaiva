/** Fantasy squad tier slots: 1 = tier1 (player tier 1), 2 = tier2 (player tier 3), 3 = tier3 (player tier 5). */
export type SwapTierSlot = 1 | 2 | 3;

export const MAX_SWAPS_PER_TIER_SLOT = 2;
export const MAX_PLAYER_SWAPS_TOTAL = 6;

/** Allocation slice: slot 1 (P-tier 1), 50 × 2 swaps = 100. */
export const SWAP_BUDGET_TIER_SLOT_1 = 50 * MAX_SWAPS_PER_TIER_SLOT;
/** Allocation slice: slot 2 (P-tier 3), 100 × 2 swaps = 200. */
export const SWAP_BUDGET_TIER_SLOT_2 = 100 * MAX_SWAPS_PER_TIER_SLOT;
/** Allocation slice: slot 3 (P-tier 5), 200 × 2 swaps = 400. */
export const SWAP_BUDGET_TIER_SLOT_3 = 200 * MAX_SWAPS_PER_TIER_SLOT;
/** Allocation slice: captain or vice-captain change (one leadership change per rules). */
export const SWAP_BUDGET_LEADERSHIP = 400;

/**
 * One-time swap score pool per entry (fantasy points): 100 + 200 + 400 + 400 = 1,100.
 * Each swap applies penalties from `playerSwapPenaltyForTierSlot` / `leadershipPenaltyPoints`.
 */
export const SWAP_SCORE_BUDGET_TOTAL =
  SWAP_BUDGET_TIER_SLOT_1 +
  SWAP_BUDGET_TIER_SLOT_2 +
  SWAP_BUDGET_TIER_SLOT_3 +
  SWAP_BUDGET_LEADERSHIP;

/** Remaining notional budget after recorded penalties (never negative). */
export function remainingSwapScoreBudget(totalPenaltyDeductedAbs: number): number {
  return Math.max(0, SWAP_SCORE_BUDGET_TOTAL - totalPenaltyDeductedAbs);
}

/**
 * Total fantasy points for an entry: match-based score (stored on the entry) plus any **unused**
 * swap budget. `storedTotalScore` is `entry.totalScore` (= sum of match points minus swap penalties).
 * `penaltyDeductedAbs` is the sum of absolute swap penalty points for this entry (from audit).
 */
export function entryTotalFantasyWithSwapBudget(
  storedTotalScore: number,
  penaltyDeductedAbs: number
): number {
  return storedTotalScore + penaltyDeductedAbs + remainingSwapScoreBudget(penaltyDeductedAbs);
}

/** Penalty when changing captain (one change per competition window rules). */
export const CAPTAIN_SWAP_PENALTY = -500;
/** Penalty when changing vice-captain. */
export const VICE_CAPTAIN_SWAP_PENALTY = -300;

/** Server allows only one leadership change per request; captain vs vice are mutually exclusive. */
export function leadershipPenaltyPoints(captainChanged: boolean, viceChanged: boolean): number {
  if (captainChanged) return CAPTAIN_SWAP_PENALTY;
  if (viceChanged) return VICE_CAPTAIN_SWAP_PENALTY;
  return 0;
}

export function playerSwapPenaltyForTierSlot(tierSlot: SwapTierSlot): number {
  switch (tierSlot) {
    case 1:
      return -50;
    case 2:
      return -100;
    case 3:
      return -200;
    default:
      return 0;
  }
}

export function totalPlayerSwapsFromEntry(entry: {
  swapsUsedTierSlot1?: number;
  swapsUsedTierSlot2?: number;
  swapsUsedTierSlot3?: number;
  swapCountUsed?: number;
}): number {
  const a = entry.swapsUsedTierSlot1 ?? 0;
  const b = entry.swapsUsedTierSlot2 ?? 0;
  const c = entry.swapsUsedTierSlot3 ?? 0;
  if (a === 0 && b === 0 && c === 0 && (entry.swapCountUsed ?? 0) > 0) {
    return entry.swapCountUsed ?? 0;
  }
  return a + b + c;
}

export function hasAnyPlayerSwap(entry: {
  swapsUsedTierSlot1?: number;
  swapsUsedTierSlot2?: number;
  swapsUsedTierSlot3?: number;
  swapCountUsed?: number;
}): boolean {
  return totalPlayerSwapsFromEntry(entry) > 0;
}
