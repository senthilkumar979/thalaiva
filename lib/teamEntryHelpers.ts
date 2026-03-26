export function playerIdListFromEntry(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && "_id" in item) return String((item as { _id: string })._id);
      return "";
    })
    .filter(Boolean);
}

export function captainIdFromEntry(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && "_id" in value) return String((value as { _id: string })._id);
  return null;
}
