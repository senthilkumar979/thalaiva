/** Stable string id for comparisons (API may return strings or populated `{ _id }`). */
export function normalizePlayerId(value: unknown): string {
  if (value == null || value === "") return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && "_id" in value) return String((value as { _id: unknown })._id);
  return String(value);
}

export function playerIdListFromEntry(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => normalizePlayerId(item))
    .filter(Boolean);
}

export function captainIdFromEntry(value: unknown): string | null {
  const id = normalizePlayerId(value);
  return id || null;
}
