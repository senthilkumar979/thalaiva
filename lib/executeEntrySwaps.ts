import mongoose, { type ClientSession, type Types } from "mongoose";
import { Entry } from "@/models/Entry";
import { EntrySwapAudit } from "@/models/EntrySwapAudit";
import { SwapWindow } from "@/models/SwapWindow";
import {
  appendRosterVersion,
  ensureBaselineRosterVersionBeforeSwap,
} from "@/lib/entryRosterVersion";
import { getEffectiveFromMatchNumber } from "@/lib/swapEffectiveMatch";
import {
  applySwapToTiers,
  assertSwapPlayersValid,
  validateFullSquadAfterSwaps,
} from "@/lib/swapTierValidation";

const MAX_SWAPS = 6;

export interface SwapItemInput {
  tierSlot: 1 | 2 | 3;
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

export async function executeEntrySwaps(input: ExecuteSwapsInput, session: ClientSession): Promise<void> {
  const { swaps } = input;
  if (swaps.length === 0) throw new Error("No swaps provided");

  const entry = await Entry.findById(input.entryId).session(session);
  if (!entry) throw new Error("Entry not found");

  const win = await SwapWindow.findOne({
    _id: input.swapWindowId,
    competition: input.competitionId,
    isOpen: true,
  }).session(session);
  if (!win) throw new Error("Swap window is not open");

  const used = entry.swapCountUsed ?? 0;
  if (used + swaps.length > MAX_SWAPS) throw new Error(`You can only use ${MAX_SWAPS - used} more swap(s)`);

  const outs = new Set<string>();
  for (const s of swaps) {
    if (outs.has(s.playerOutId)) throw new Error("Duplicate player out in request");
    outs.add(s.playerOutId);
    await assertSwapPlayersValid(s.tierSlot, s.playerInId, s.playerOutId);
  }

  let tier1 = [...entry.tier1Players];
  let tier2 = [...entry.tier2Players];
  let tier3 = [...entry.tier3Players];

  for (const s of swaps) {
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
  let captain = entry.captain;
  let viceCaptain = entry.viceCaptain;
  let captainChanged = false;
  let viceChanged = false;

  if (!allIds.includes(String(captain))) {
    if (entry.captainChangeUsed) {
      throw new Error("Cannot remove captain from squad — captain was already changed once in this competition");
    }
    if (!input.newCaptainId) throw new Error("Captain left the squad — choose a new captain");
    captain = new mongoose.Types.ObjectId(input.newCaptainId);
    captainChanged = true;
  } else if (input.newCaptainId && String(input.newCaptainId) !== String(captain)) {
    if (entry.captainChangeUsed) throw new Error("Captain can only be changed once in this competition");
    captain = new mongoose.Types.ObjectId(input.newCaptainId);
    if (!allIds.includes(String(captain))) throw new Error("New captain must be in your squad");
    captainChanged = true;
  }

  if (viceCaptain && !allIds.includes(String(viceCaptain))) {
    if (entry.viceCaptainChangeUsed) {
      throw new Error("Cannot remove vice-captain from squad — vice-captain was already changed once");
    }
    if (!input.newViceCaptainId) throw new Error("Vice-captain left the squad — choose a new vice-captain");
    viceCaptain = new mongoose.Types.ObjectId(input.newViceCaptainId);
    viceChanged = true;
  } else if (input.newViceCaptainId && String(input.newViceCaptainId ?? "") !== String(viceCaptain ?? "")) {
    if (entry.viceCaptainChangeUsed) throw new Error("Vice-captain can only be changed once in this competition");
    viceCaptain = new mongoose.Types.ObjectId(input.newViceCaptainId);
    if (!allIds.includes(String(viceCaptain))) throw new Error("New vice-captain must be in your squad");
    viceChanged = true;
  }

  await validateFullSquadAfterSwaps(tier1, tier2, tier3, captain, viceCaptain);

  await ensureBaselineRosterVersionBeforeSwap(entry.toObject(), session);

  const effectiveFrom = await getEffectiveFromMatchNumber(session);

  entry.tier1Players = tier1;
  entry.tier2Players = tier2;
  entry.tier3Players = tier3;
  entry.captain = captain;
  entry.viceCaptain = viceCaptain;
  entry.swapCountUsed = used + swaps.length;
  if (captainChanged) entry.captainChangeUsed = true;
  if (viceChanged) entry.viceCaptainChangeUsed = true;

  await entry.save({ session });

  await appendRosterVersion(entry.toObject(), effectiveFrom, session);

  const remaining = MAX_SWAPS - (entry.swapCountUsed ?? 0);
  const docs = swaps.map((s, i) => ({
    swapWindow: input.swapWindowId,
    competition: input.competitionId,
    entry: input.entryId,
    user: input.userId,
    tierSlot: s.tierSlot,
    playerOut: new mongoose.Types.ObjectId(s.playerOutId),
    playerIn: new mongoose.Types.ObjectId(s.playerInId),
    effectiveFromMatchNumber: effectiveFrom,
    swapsRemainingAfter: remaining,
    captainUpdated: i === 0 && captainChanged,
    viceCaptainUpdated: i === 0 && viceChanged,
  }));
  await EntrySwapAudit.insertMany(docs, { session });
}
