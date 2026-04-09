import mongoose from "mongoose";
import { EntrySwapAudit } from "@/models/EntrySwapAudit";

/** Sum of |penaltyPoints| per entry (fantasy points deducted via swaps). */
export async function getSwapPenaltyDeductedForEntries(
  entryIds: mongoose.Types.ObjectId[]
): Promise<Map<string, number>> {
  if (entryIds.length === 0) return new Map();
  const rows = await EntrySwapAudit.aggregate<{ _id: mongoose.Types.ObjectId; d: number }>([
    { $match: { entry: { $in: entryIds } } },
    { $group: { _id: "$entry", d: { $sum: { $abs: "$penaltyPoints" } } } },
  ]);
  return new Map(rows.map((r) => [String(r._id), r.d]));
}
