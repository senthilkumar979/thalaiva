import type { PlayerRole, PlayerTier } from "@/models/Player";

export interface PlayerLeaderboardRow {
  _id: string;
  name: string;
  tier: PlayerTier;
  role: PlayerRole;
  totalFantasyPoints: number;
  franchise: {
    _id: string;
    name: string;
    shortCode: string;
    logoUrl?: string;
  } | null;
}

export function normalizePlayerLeaderboardResponse(raw: unknown[]): PlayerLeaderboardRow[] {
  return raw.map((p) => {
    const o = p as Record<string, unknown>;
    const fr = o.franchise as Record<string, unknown> | null | undefined;
    return {
      _id: String(o._id),
      name: String(o.name ?? ""),
      tier: Number(o.tier) as PlayerTier,
      role: o.role as PlayerRole,
      totalFantasyPoints: Number(o.totalFantasyPoints ?? 0),
      franchise: fr
        ? {
            _id: String(fr._id),
            name: String(fr.name ?? ""),
            shortCode: String(fr.shortCode ?? ""),
            logoUrl: fr.logoUrl ? String(fr.logoUrl) : undefined,
          }
        : null,
    };
  });
}

export type RoleFilter = "all" | PlayerRole;
export type TierFilter = "all" | PlayerTier;
export type SortMode = "points-desc" | "points-asc" | "name-asc" | "name-desc";

export function filterAndSortPlayerLeaderboard(
  rows: PlayerLeaderboardRow[],
  franchiseId: string | "all",
  role: RoleFilter,
  tier: TierFilter,
  sort: SortMode
): PlayerLeaderboardRow[] {
  let out = rows.filter((r) => {
    if (franchiseId !== "all") {
      const fid = r.franchise?._id ? String(r.franchise._id) : "";
      if (fid !== franchiseId) return false;
    }
    if (role !== "all" && r.role !== role) return false;
    if (tier !== "all" && r.tier !== tier) return false;
    return true;
  });

  out = [...out].sort((a, b) => {
    if (sort === "name-asc" || sort === "name-desc") {
      const cmp = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      return sort === "name-asc" ? cmp : -cmp;
    }
    const pa = a.totalFantasyPoints;
    const pb = b.totalFantasyPoints;
    if (pa !== pb) return sort === "points-desc" ? pb - pa : pa - pb;
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });

  return out;
}
