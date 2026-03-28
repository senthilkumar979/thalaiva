import type { Types } from "mongoose";
import {
  countRolesFromPlayerDocs,
  squadCompositionMessages,
  squadCompositionSatisfied,
} from "@/lib/squadComposition";
import { Player, type PlayerTier } from "@/models/Player";

export interface EntryPlayerPayload {
  tier1Players: string[];
  tier2Players: string[];
  tier3Players: string[];
  captain: string;
  viceCaptain: string;
}

function assertLen(ids: string[], n: number, label: string): void {
  if (ids.length !== n) throw new Error(`${label} must have exactly ${n} players`);
}

async function loadPlayersForTier(
  ids: string[],
  expectedTier: PlayerTier
): Promise<{ id: Types.ObjectId; franchise: Types.ObjectId }[]> {
  assertLen(ids, 5, `Tier ${expectedTier}`);
  const players = await Player.find({ _id: { $in: ids } }).lean();
  if (players.length !== 5) throw new Error("Invalid or duplicate player id in tier");
  for (const p of players) {
    if (p.tier !== expectedTier) throw new Error(`Player ${p.name} is not tier ${expectedTier}`);
    if (!p.isActive) throw new Error(`Player ${p.name} is inactive`);
  }
  const franchises = players.map((p) => String(p.franchise));
  if (new Set(franchises).size !== 5) throw new Error("Each tier needs 5 different franchises");
  return players.map((p) => ({ id: p._id, franchise: p.franchise as Types.ObjectId }));
}

export async function validateEntrySelection(payload: EntryPlayerPayload): Promise<void> {
  const t1 = await loadPlayersForTier(payload.tier1Players, 1);
  const t2 = await loadPlayersForTier(payload.tier2Players, 3);
  const t3 = await loadPlayersForTier(payload.tier3Players, 5);
  const allIds = [...payload.tier1Players, ...payload.tier2Players, ...payload.tier3Players];
  if (new Set(allIds).size !== 15) throw new Error("A player can only appear once across tiers");
  if (!allIds.includes(payload.captain)) throw new Error("Captain must be one of the 15 players");
  if (!allIds.includes(payload.viceCaptain)) throw new Error("Vice-captain must be one of the 15 players");
  if (payload.captain === payload.viceCaptain) {
    throw new Error("Captain and vice-captain must be different players");
  }
  const allPlayers = await Player.find({ _id: { $in: allIds } }).select("role franchise").lean();
  if (allPlayers.length !== 15) throw new Error("Invalid player selection");
  const capFr = allPlayers.find((p) => String(p._id) === payload.captain)?.franchise;
  const viceFr = allPlayers.find((p) => String(p._id) === payload.viceCaptain)?.franchise;
  if (String(capFr) === String(viceFr)) {
    throw new Error("Captain and vice-captain must be from different franchises");
  }
  const counts = countRolesFromPlayerDocs(allPlayers);
  if (!squadCompositionSatisfied(counts)) {
    const detail = squadCompositionMessages(counts).join(" ");
    throw new Error(detail || "Squad does not meet role composition rules");
  }
  void t1;
  void t2;
  void t3;
}
