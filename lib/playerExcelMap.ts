import type { PlayerRole } from "@/models/Player";

export function tierLabel(tier: 1 | 3 | 5 | null): string {
  if (tier === 1) return "Good (1 pt)";
  if (tier === 3) return "Super (3 pt)";
  if (tier === 5) return "Excellent (5 pt)";
  return "—";
}

export function mapValueToTier(value: string): 1 | 3 | 5 | null {
  const s = value.trim().toLowerCase();
  if (s === "good") return 1;
  if (s === "super") return 3;
  if (s === "excellent") return 5;
  return null;
}

export function mapCategoryToRole(category: string): PlayerRole | null {
  const s = category.trim().toLowerCase().replace(/[-_]/g, " ");
  if (!s) return null;
  if (/\ball[\s-]?round/.test(s) || s.includes("allrounder")) return "allrounder";
  if (s.includes("wicket") || /\bwk\b/.test(s) || s.includes("keeper")) return "wk";
  if (s.includes("bat") || s.includes("batter")) return "bat";
  if (s.includes("bowl")) return "bowl";
  if (s === "bat" || s === "bowl" || s === "wk" || s === "allrounder") return s as PlayerRole;
  return null;
}
