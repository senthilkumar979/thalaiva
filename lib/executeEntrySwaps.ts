import mongoose, { type ClientSession, type HydratedDocument, type Types } from "mongoose";
import { Entry, type IEntryDocument } from "@/models/Entry";
import type { IEntrySwapAudit } from "@/models/EntrySwapAudit";
import { EntrySwapAudit } from "@/models/EntrySwapAudit";
import { SwapWindow } from "@/models/SwapWindow";
import { ensureEntrySwapMigration } from "@/lib/ensureEntrySwapMigration";
import {
  appendRosterVersion,
  ensureBaselineRosterVersionBeforeSwap,
} from "@/lib/entryRosterVersion";
import { getEffectiveFromMatchNumber } from "@/lib/swapEffectiveMatch";
import {
  leadershipPenaltyPoints,
  MAX_PLAYER_SWAPS_TOTAL,
  MAX_SWAPS_PER_TIER_SLOT,
  playerSwapPenaltyForTierSlot,
  type SwapTierSlot,
} from "@/lib/swapPenaltyRules";
import {
  applySwapToTiers,
  assertSwapPlayersValid,
  validateFullSquadAfterSwaps,
} from "@/lib/swapTierValidation";

export interface SwapItemInput {
  tierSlot: SwapTierSlot;
  playerOutId: string;
  playerInId: string;
}

export interface ExecuteSwapsInput {
  entryId: Types.ObjectId;
  userId: Types.ObjectId;
  competitionId: Types.ObjectId;
  swapWindowId: Types.ObjectId;
  swaps: SwapItemInput[];
  newCaptainId?: string | null;
  newViceCaptainId?: string | null;
}

function tierCountForSlot(
  entry: { swapsUsedTierSlot1?: number; swapsUsedTierSlot2?: number; swapsUsedTierSlot3?: number },
  slot: SwapTierSlot
): number {
  if (slot === 1) return entry.swapsUsedTierSlot1 ?? 0;
  if (slot === 2) return entry.swapsUsedTierSlot2 ?? 0;
  return entry.swapsUsedTierSlot3 ?? 0;
}

function addTierCount(
  entry: mongoose.Document & {
    swapsUsedTierSlot1?: number;
    swapsUsedTierSlot2?: number;
    swapsUsedTierSlot3?: number;
  },
  slot: SwapTierSlot,
  delta: number
): void {
  if (slot === 1) entry.set("swapsUsedTierSlot1", (entry.swapsUsedTierSlot1 ?? 0) + delta);
  else if (slot === 2) entry.set("swapsUsedTierSlot2", (entry.swapsUsedTierSlot2 ?? 0) + delta);
  else entry.set("swapsUsedTierSlot3", (entry.swapsUsedTierSlot3 ?? 0) + delta);
}

interface LoadAndValidateSwapResult {
  entry: HydratedDocument<IEntryDocument>;
  tier1: Types.ObjectId[];
  tier2: Types.ObjectId[];
  tier3: Types.ObjectId[];
  captain: Types.ObjectId;
  viceCaptain: Types.ObjectId | undefined;
  captainChanged: boolean;
  viceChanged: boolean;
  capId: string;
  viceId: string;
}

/** Same rules as {@link executeEntrySwaps} up to squad validation (no writes). */
async function loadAndValidateSwapInput(
  input: ExecuteSwapsInput,
  session?: ClientSession | null
): Promise<LoadAndValidateSwapResult> {
  await ensureEntrySwapMigration(input.entryId, session ?? undefined);

  const entry = session
    ? await Entry.findById(input.entryId).session(session)
    : await Entry.findById(input.entryId);
  if (!entry) throw new Error("Entry not found");

  const win = session
    ? await SwapWindow.findOne({
        _id: input.swapWindowId,
        competition: input.competitionId,
        isOpen: true,
      }).session(session)
    : await SwapWindow.findOne({
        _id: input.swapWindowId,
        competition: input.competitionId,
        isOpen: true,
      });
  if (!win) throw new Error("Swap window is not open");

  const swaps = input.swaps;
  const outs = new Set<string>();
  const incomingBySlot: Record<SwapTierSlot, number> = { 1: 0, 2: 0, 3: 0 };

  for (const s of swaps) {
    if (outs.has(s.playerOutId)) throw new Error("Duplicate player out in request");
    outs.add(s.playerOutId);
    incomingBySlot[s.tierSlot]++;
  }

  for (const slot of [1, 2, 3] as const) {
    const cur = tierCountForSlot(entry, slot);
    const inc = incomingBySlot[slot];
    if (cur + inc > MAX_SWAPS_PER_TIER_SLOT) {
      throw new Error(`Tier slot ${slot} allows at most ${MAX_SWAPS_PER_TIER_SLOT} swaps — ${cur} used, ${inc} requested`);
    }
  }

  const totalPlayerSwapsBefore =
    (entry.swapsUsedTierSlot1 ?? 0) + (entry.swapsUsedTierSlot2 ?? 0) + (entry.swapsUsedTierSlot3 ?? 0);
  if (totalPlayerSwapsBefore + swaps.length > MAX_PLAYER_SWAPS_TOTAL) {
    throw new Error(
      `You can only use ${MAX_PLAYER_SWAPS_TOTAL - totalPlayerSwapsBefore} more player swap(s) this competition`
    );
  }

  let tier1 = [...entry.tier1Players];
  let tier2 = [...entry.tier2Players];
  let tier3 = [...entry.tier3Players];

  for (const s of swaps) {
    const tierArr =
      s.tierSlot === 1 ? tier1 : s.tierSlot === 2 ? tier2 : tier3;
    await assertSwapPlayersValid(s.tierSlot, s.playerInId, s.playerOutId, tierArr);
    const applied = applySwapToTiers(
      tier1,
      tier2,
      tier3,
      s.tierSlot,
      new mongoose.Types.ObjectId(s.playerOutId),
      new mongoose.Types.ObjectId(s.playerInId)
    );
    tier1 = applied.tier1;
    tier2 = applied.tier2;
    tier3 = applied.tier3;
  }

  const allIds = [...tier1, ...tier2, ...tier3].map(String);
  const capId = String(entry.captain);
  const viceId = entry.viceCaptain ? String(entry.viceCaptain) : "";

  let removesCaptain = false;
  let removesVice = false;
  for (const s of swaps) {
    if (s.playerOutId === capId) removesCaptain = true;
    if (viceId && s.playerOutId === viceId) removesVice = true;
  }
  if (removesCaptain && removesVice) {
    throw new Error("Cannot swap out both captain and vice-captain in one request — split across windows");
  }

  let captain = entry.captain;
  let viceCaptain = entry.viceCaptain;
  let captainChanged = false;
  let viceChanged = false;

  if (!allIds.includes(String(captain))) {
    if (entry.leadershipChangeUsed) {
      throw new Error(
        "Cannot remove captain from squad — leadership (captain or vice-captain) was already changed once"
      );
    }
    if (!input.newCaptainId) throw new Error("Captain left the squad — choose a new captain");
    captain = new mongoose.Types.ObjectId(input.newCaptainId);
    captainChanged = true;
  } else if (input.newCaptainId && String(input.newCaptainId) !== String(captain)) {
    if (entry.leadershipChangeUsed) {
      throw new Error("Captain can no longer be changed — leadership change already used");
    }
    captain = new mongoose.Types.ObjectId(input.newCaptainId);
    if (!allIds.includes(String(captain))) throw new Error("New captain must be in your squad");
    captainChanged = true;
  }

  if (viceCaptain && !allIds.includes(String(viceCaptain))) {
    if (entry.leadershipChangeUsed) {
      throw new Error(
        "Cannot remove vice-captain from squad — leadership (captain or vice-captain) was already changed once"
      );
    }
    if (!input.newViceCaptainId) throw new Error("Vice-captain left the squad — choose a new vice-captain");
    viceCaptain = new mongoose.Types.ObjectId(input.newViceCaptainId);
    viceChanged = true;
  } else if (input.newViceCaptainId && String(input.newViceCaptainId ?? "") !== String(viceCaptain ?? "")) {
    if (entry.leadershipChangeUsed) {
      throw new Error("Vice-captain can no longer be changed — leadership change already used");
    }
    viceCaptain = new mongoose.Types.ObjectId(input.newViceCaptainId);
    if (!allIds.includes(String(viceCaptain))) throw new Error("New vice-captain must be in your squad");
    viceChanged = true;
  }

  if (captainChanged && viceChanged) {
    throw new Error("Change only captain or vice-captain in one request");
  }

  if (swaps.length === 0 && !captainChanged && !viceChanged) {
    throw new Error("No player swaps or leadership changes");
  }

  await validateFullSquadAfterSwaps(tier1, tier2, tier3, captain, viceCaptain);

  return {
    entry,
    tier1,
    tier2,
    tier3,
    captain,
    viceCaptain,
    captainChanged,
    viceChanged,
    capId,
    viceId,
  };
}

/** Dry-run the same checks as execute (swap window, limits, franchise, full squad roles). */
export async function validateSwapRequest(
  input: ExecuteSwapsInput,
  session?: ClientSession | null
): Promise<void> {
  await loadAndValidateSwapInput(input, session);
}

/** Pass a session when the deployment supports transactions (replica set / mongos). Omit on standalone MongoDB. */
export async function executeEntrySwaps(
  input: ExecuteSwapsInput,
  session?: ClientSession | null
): Promise<void> {
  const {
    entry,
    tier1,
    tier2,
    tier3,
    captain,
    viceCaptain,
    captainChanged,
    viceChanged,
    capId,
    viceId,
  } = await loadAndValidateSwapInput(input, session);

  const swaps = input.swaps;

  let playerPenaltyTotal = 0;
  for (const s of swaps) {
    playerPenaltyTotal += playerSwapPenaltyForTierSlot(s.tierSlot);
  }

  const leadershipPenalty = leadershipPenaltyPoints(captainChanged, viceChanged);
  const totalPenalty = playerPenaltyTotal + leadershipPenalty;

  await ensureBaselineRosterVersionBeforeSwap(entry.toObject(), session ?? undefined);

  const effectiveFrom = await getEffectiveFromMatchNumber(session ?? undefined);

  entry.tier1Players = tier1;
  entry.tier2Players = tier2;
  entry.tier3Players = tier3;
  entry.captain = captain;
  entry.viceCaptain = viceCaptain;

  for (const s of swaps) {
    addTierCount(entry, s.tierSlot, 1);
  }

  entry.swapCountUsed =
    (entry.swapsUsedTierSlot1 ?? 0) + (entry.swapsUsedTierSlot2 ?? 0) + (entry.swapsUsedTierSlot3 ?? 0);

  if (captainChanged || viceChanged) {
    entry.leadershipChangeUsed = true;
    entry.captainChangeUsed = true;
    entry.viceCaptainChangeUsed = true;
  }

  entry.totalScore = (entry.totalScore ?? 0) + totalPenalty;

  await entry.save(session ? { session } : {});

  await appendRosterVersion(entry.toObject(), effectiveFrom, session ?? undefined);

  const finalTotalSwaps =
    (entry.swapsUsedTierSlot1 ?? 0) + (entry.swapsUsedTierSlot2 ?? 0) + (entry.swapsUsedTierSlot3 ?? 0);
  const swapsRemainingAfter = Math.max(0, MAX_PLAYER_SWAPS_TOTAL - finalTotalSwaps);

  const docs: IEntrySwapAudit[] = [];

  for (let i = 0; i < swaps.length; i++) {
    const s = swaps[i];
    const pp = playerSwapPenaltyForTierSlot(s.tierSlot);
    docs.push({
      swapWindow: input.swapWindowId,
      competition: input.competitionId,
      entry: input.entryId,
      user: input.userId,
      recordKind: "player",
      tierSlot: s.tierSlot,
      playerOut: new mongoose.Types.ObjectId(s.playerOutId),
      playerIn: new mongoose.Types.ObjectId(s.playerInId),
      effectiveFromMatchNumber: effectiveFrom,
      swapsRemainingAfter,
      penaltyPoints: pp,
      captainUpdated: false,
      viceCaptainUpdated: false,
    });
  }

  if (captainChanged || viceChanged) {
    const baseLead = {
      swapWindow: input.swapWindowId,
      competition: input.competitionId,
      entry: input.entryId,
      user: input.userId,
      recordKind: "leadership" as const,
      tierSlot: 0 as const,
      effectiveFromMatchNumber: effectiveFrom,
      swapsRemainingAfter,
      penaltyPoints: leadershipPenaltyPoints(captainChanged, viceChanged),
      captainUpdated: captainChanged,
      viceCaptainUpdated: viceChanged,
    };
    if (captainChanged) {
      docs.push({
        ...baseLead,
        playerOut: new mongoose.Types.ObjectId(capId),
        playerIn: captain,
      });
    } else {
      docs.push({
        ...baseLead,
        ...(viceId ? { playerOut: new mongoose.Types.ObjectId(viceId) } : {}),
        playerIn: viceCaptain as Types.ObjectId,
      });
    }
  }

  if (docs.length > 0) await EntrySwapAudit.insertMany(docs, session ? { session } : {});
}
