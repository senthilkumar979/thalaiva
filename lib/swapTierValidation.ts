import type { Types } from "mongoose";
import { Player, type PlayerTier } from "@/models/Player";
import {
  countRolesFromPlayerDocs,
  squadCompositionMessages,
  squadCompositionSatisfied,
} from "@/lib/squadComposition";

const TIER_BY_SLOT: Record<1 | 2 | 3, PlayerTier> = {
  1: 1,
  2: 3,
  3: 5,
};

function tierKey(slot: 1 | 2 | 3): "tier1Players" | "tier2Players" | "tier3Players" {
  if (slot === 1) return "tier1Players";
  if (slot === 2) return "tier2Players";
  return "tier3Players";
}

export async function assertSwapPlayersValid(
  tierSlot: 1 | 2 | 3,
  playerInId: string,
  playerOutId: string
): Promise<void> {
  const expectedTier = TIER_BY_SLOT[tierSlot];
  const [playerIn, playerOut] = await Promise.all([
    Player.findById(playerInId).lean(),
    Player.findById(playerOutId).lean(),
  ]);
  if (!playerIn || !playerOut) throw new Error("Invalid player");
  if (!playerIn.isActive) throw new Error(`Player ${playerIn.name} is inactive`);
  if (playerIn.tier !== expectedTier) {
    throw new Error(`Incoming player must be tier ${expectedTier}`);
  }
  if (String(playerIn._id) === String(playerOut._id)) throw new Error("Cannot swap a player with themselves");
}

/** Apply swap on copies; validates franchise uniqueness per tier and full squad rules. */
export async function validateFullSquadAfterSwaps(
  tier1: Types.ObjectId[],
  tier2: Types.ObjectId[],
  tier3: Types.ObjectId[],
  captain: Types.ObjectId,
  viceCaptain: Types.ObjectId | undefined
): Promise<void> {
  const allIds = [...tier1, ...tier2, ...tier3].map(String);
  if (new Set(allIds).size !== 15) throw new Error("A player can only appear once across tiers");

  const allPlayers = await Player.find({ _id: { $in: [...tier1, ...tier2, ...tier3] } })
    .select("role franchise tier name")
    .lean();
  if (allPlayers.length !== 15) throw new Error("Invalid player selection");

  for (const t of [1, 2, 3] as const) {
    const ids = tierKey(t) === "tier1Players" ? tier1 : tierKey(t) === "tier2Players" ? tier2 : tier3;
    const tier = TIER_BY_SLOT[t];
    const inTier = allPlayers.filter((p) => ids.map(String).includes(String(p._id)));
    if (inTier.length !== 5) throw new Error("Tier must have 5 players");
    for (const p of inTier) {
      if (p.tier !== tier) throw new Error(`Player ${p.name} is not tier ${tier}`);
    }
    const franchises = inTier.map((p) => String(p.franchise));
    if (new Set(franchises).size !== 5) {
      throw new Error("Each tier must have 5 players from different franchises");
    }
  }

  if (!allIds.includes(String(captain))) throw new Error("Captain must be one of the 15 players");
  if (viceCaptain) {
    if (!allIds.includes(String(viceCaptain))) throw new Error("Vice-captain must be one of the 15 players");
    if (String(captain) === String(viceCaptain)) {
      throw new Error("Captain and vice-captain must be different players");
    }
    const capFr = allPlayers.find((p) => String(p._id) === String(captain))?.franchise;
    const viceFr = allPlayers.find((p) => String(p._id) === String(viceCaptain))?.franchise;
    if (String(capFr) === String(viceFr)) {
      throw new Error("Captain and vice-captain must be from different franchises");
    }
  }

  const counts = countRolesFromPlayerDocs(allPlayers);
  if (!squadCompositionSatisfied(counts)) {
    const detail = squadCompositionMessages(counts).join(" ");
    throw new Error(detail || "Squad does not meet role composition rules");
  }
}

export function applySwapToTiers(
  tier1: Types.ObjectId[],
  tier2: Types.ObjectId[],
  tier3: Types.ObjectId[],
  tierSlot: 1 | 2 | 3,
  playerOut: Types.ObjectId,
  playerIn: Types.ObjectId
): { tier1: Types.ObjectId[]; tier2: Types.ObjectId[]; tier3: Types.ObjectId[] } {
  const key = tierKey(tierSlot);
  const mapTier = (arr: Types.ObjectId[]) =>
    arr.map((id) => (String(id) === String(playerOut) ? playerIn : id));
  return {
    tier1: key === "tier1Players" ? mapTier(tier1) : [...tier1],
    tier2: key === "tier2Players" ? mapTier(tier2) : [...tier2],
    tier3: key === "tier3Players" ? mapTier(tier3) : [...tier3],
  };
}
