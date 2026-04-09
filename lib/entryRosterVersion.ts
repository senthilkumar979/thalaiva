import type { ClientSession } from "mongoose";
import type { Types } from "mongoose";
import { EntryRosterVersion } from "@/models/EntryRosterVersion";
import type { IEntry } from "@/models/Entry";
import { hasAnyPlayerSwap } from "@/lib/swapPenaltyRules";

function snapshotFromEntry(entry: IEntry): {
  tier1Players: Types.ObjectId[];
  tier2Players: Types.ObjectId[];
  tier3Players: Types.ObjectId[];
  captain: Types.ObjectId;
  viceCaptain?: Types.ObjectId;
} {
  return {
    tier1Players: [...entry.tier1Players],
    tier2Players: [...entry.tier2Players],
    tier3Players: [...entry.tier3Players],
    captain: entry.captain,
    viceCaptain: entry.viceCaptain,
  };
}

/** While no swaps yet, keep baseline snapshot in sync with squad edits (entries still open). */
export async function syncRosterVersionFromEntryIfNoSwaps(
  entry: IEntry & { _id: Types.ObjectId },
  session?: ClientSession
): Promise<void> {
  if (hasAnyPlayerSwap(entry)) return;

  const snap = snapshotFromEntry(entry);
  const op = EntryRosterVersion.findOneAndUpdate(
    { entry: entry._id, effectiveFromMatchNumber: 1 },
    {
      $set: {
        competition: entry.competition,
        ...snap,
      },
    },
    { upsert: true, session, new: true }
  );
  await op;
}

/** Before first swap, persist current entry as v1; then caller updates entry and adds v2. */
export async function ensureBaselineRosterVersionBeforeSwap(
  entry: IEntry & { _id: Types.ObjectId },
  session?: ClientSession
): Promise<void> {
  const exists = session
    ? await EntryRosterVersion.findOne({ entry: entry._id }).session(session).lean()
    : await EntryRosterVersion.findOne({ entry: entry._id }).lean();
  if (exists) return;

  const snap = snapshotFromEntry(entry);
  await EntryRosterVersion.create(
    [
      {
        entry: entry._id,
        competition: entry.competition,
        effectiveFromMatchNumber: 1,
        ...snap,
      },
    ],
    { session }
  );
}

export async function appendRosterVersion(
  entry: IEntry & { _id: Types.ObjectId },
  effectiveFromMatchNumber: number,
  session?: ClientSession
): Promise<void> {
  const snap = snapshotFromEntry(entry);
  await EntryRosterVersion.create(
    [
      {
        entry: entry._id,
        competition: entry.competition,
        effectiveFromMatchNumber,
        ...snap,
      },
    ],
    { session }
  );
}
