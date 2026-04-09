/** Fantasy squad tier slots: 1 = tier1 (player tier 1), 2 = tier2 (player tier 3), 3 = tier3 (player tier 5). */
export type SwapTierSlot = 1 | 2 | 3;

export const MAX_SWAPS_PER_TIER_SLOT = 2;
export const MAX_PLAYER_SWAPS_TOTAL = 6;
export const LEADERSHIP_CHANGE_PENALTY = -200;

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
