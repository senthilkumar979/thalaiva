import type { PendingSwapRow } from "@/components/swaps/swapPendingTypes";
import type { PlayerOptionNorm } from "@/components/swaps/swapSelectLabels";

/**
 * Full 15-player list after applying queued swaps (same logic as tier simulation on submit).
 * Used so captain/vice dropdowns include swapped-in players before submit.
 */
export function buildEffectiveSquadAfterPendingSwaps(
  squadNormByTier: Record<1 | 2 | 3, PlayerOptionNorm[]>,
  pending: PendingSwapRow[],
  pools: Record<1 | 2 | 3, PlayerOptionNorm[]>,
): PlayerOptionNorm[] {
  const out: PlayerOptionNorm[] = [];
  for (const slot of [1, 2, 3] as const) {
    let roster = [...squadNormByTier[slot]];
    for (const row of pending) {
      if (row.tierSlot !== slot) continue;
      roster = roster.filter((p) => p._id !== row.playerOutId);
      const full = pools[slot].find((p) => p._id === row.playerInId);
      roster.push(full ?? fallbackPlayerFromPending(row));
    }
    out.push(...roster);
  }
  return out;
}

function fallbackPlayerFromPending(row: PendingSwapRow): PlayerOptionNorm {
  return {
    _id: row.playerInId,
    name: row.playerInName,
    role: "BAT",
    franchise: {
      _id: row.playerInFranchiseId,
      name: "",
      shortCode: "",
      logoUrl: "",
    },
  };
}
