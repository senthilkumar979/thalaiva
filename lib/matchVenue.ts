export type MatchVenue = "home" | "away";

export function normalizeVenue(v: string): MatchVenue {
  const s = v?.toLowerCase().trim();
  if (s === "away") return "away";
  return "home";
}

export function formatVenueLabel(v: string): string {
  const s = v?.toLowerCase().trim();
  if (s === "home") return "Home";
  if (s === "away") return "Away";
  return v;
}
