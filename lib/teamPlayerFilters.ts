import type { PlayerWithFranchise } from "@/hooks/usePlayersByTier";
import type { RoleFilterValue } from "@/lib/squadComposition";

export function filterPlayersByFranchise(
  players: PlayerWithFranchise[],
  team: string
): PlayerWithFranchise[] {
  if (team === "all") return players;
  return players.filter((p) => {
    if (p.franchise && typeof p.franchise === "object") return p.franchise.shortCode === team;
    return false;
  });
}

export function filterPlayersByRole(
  players: PlayerWithFranchise[],
  role: RoleFilterValue
): PlayerWithFranchise[] {
  if (role === "all") return players;
  return players.filter((p) => p.role === role);
}
