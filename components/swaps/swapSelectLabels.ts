/** Normalize franchise id for comparisons (populated object or raw id). */
export function normalizeFranchiseId(
  franchise: { _id: unknown } | string | null | undefined
): string {
  if (franchise == null) return "";
  if (typeof franchise === "string") return franchise;
  return String(franchise._id);
}

/** Normalize Mongo-style ids for Select value matching. */
export function normalizePlayerId(id: unknown): string {
  if (id == null) return "";
  if (typeof id === "string") return id;
  if (typeof id === "object" && id !== null && "_id" in id) {
    return String((id as { _id: unknown })._id);
  }
  return String(id);
}

export interface PlayerOption {
  _id: unknown;
  name: string;
  role: string;
  franchise: {
    _id: string;
    name: string;
    shortCode: string;
    logoUrl: string;
  };
}

/** Normalized row for selects (string ids). */
export interface PlayerOptionNorm {
  _id: string;
  name: string;
  role: string;
  franchise: {
    _id: string;
    name: string;
    shortCode: string;
    logoUrl: string;
  };
}

export function labelForPlayerId(
  id: string | undefined,
  players: PlayerOption[]
): string | undefined {
  if (!id?.trim()) return undefined;
  const key = normalizePlayerId(id);
  const p = players.find((x) => normalizePlayerId(x._id) === key);
  return p?.name;
}

export const TIER_SLOT_COPY: Record<1 | 2 | 3, { title: string; hint: string }> = {
  1: {
    title: "Squad slot 1",
    hint: "Player tier 1 — penalty −50 per swap",
  },
  2: {
    title: "Squad slot 2",
    hint: "Player tier 3 — penalty −100 per swap",
  },
  3: {
    title: "Squad slot 3",
    hint: "Player tier 5 — penalty −200 per swap",
  },
};

export function tierSelectLabel(slot: 1 | 2 | 3): string {
  return TIER_SLOT_COPY[slot].title;
}
