import type { ClientSession } from "mongoose";
import mongoose from "mongoose";
import { Entry } from "@/models/Entry";
import { EntrySwapAudit } from "@/models/EntrySwapAudit";

/** Backfill tier swap counts + leadership flag from legacy fields or audit rows. */
export async function ensureEntrySwapMigration(
  entryId: mongoose.Types.ObjectId,
  session?: ClientSession
): Promise<void> {
  const entry = session
    ? await Entry.findById(entryId).session(session)
    : await Entry.findById(entryId);
  if (!entry) return;

  const hasNewShape =
    entry.get("swapsUsedTierSlot1") != null ||
    entry.get("swapsUsedTierSlot2") != null ||
    entry.get("swapsUsedTierSlot3") != null;

  if (hasNewShape) {
    if (entry.leadershipChangeUsed == null && (entry.captainChangeUsed || entry.viceCaptainChangeUsed)) {
      entry.leadershipChangeUsed = Boolean(entry.captainChangeUsed || entry.viceCaptainChangeUsed);
      await entry.save({ session });
    }
    return;
  }

  const pipeline = [
    { $match: { entry: entryId, recordKind: { $ne: "leadership" } } },
    { $group: { _id: "$tierSlot", n: { $sum: 1 } } },
  ];
  const agg = session
    ? await EntrySwapAudit.aggregate<{ _id: number; n: number }>(pipeline).session(session)
    : await EntrySwapAudit.aggregate<{ _id: number; n: number }>(pipeline);

  const bySlot: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
  for (const row of agg) {
    if (row._id === 1 || row._id === 2 || row._id === 3) bySlot[row._id] = row.n;
  }

  const hasAudit = agg.length > 0;
  let t1 = Math.min(2, bySlot[1]);
  let t2 = Math.min(2, bySlot[2]);
  let t3 = Math.min(2, bySlot[3]);

  if (!hasAudit) {
    const old = entry.swapCountUsed ?? 0;
    let rem = old;
    t1 = Math.min(2, rem);
    rem -= t1;
    t2 = Math.min(2, rem);
    rem -= t2;
    t3 = Math.min(2, rem);
  }

  entry.set("swapsUsedTierSlot1", t1);
  entry.set("swapsUsedTierSlot2", t2);
  entry.set("swapsUsedTierSlot3", t3);
  entry.swapCountUsed = t1 + t2 + t3;
  entry.leadershipChangeUsed = Boolean(entry.captainChangeUsed || entry.viceCaptainChangeUsed);
  await entry.save({ session });
}
