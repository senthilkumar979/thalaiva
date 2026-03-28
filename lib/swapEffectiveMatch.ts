import type { ClientSession } from "mongoose";
import { Match } from "@/models/Match";

/** First unscored match by global order; if all scored, next hypothetical match number. */
export async function getEffectiveFromMatchNumber(session?: ClientSession): Promise<number> {
  const q = Match.findOne({ isScored: false }).sort({ matchNumber: 1 }).lean();
  const nextUnscored = session ? await q.session(session) : await q;
  if (nextUnscored) return nextUnscored.matchNumber;
  const last = session
    ? await Match.findOne().sort({ matchNumber: -1 }).session(session).lean()
    : await Match.findOne().sort({ matchNumber: -1 }).lean();
  return last ? last.matchNumber + 1 : 1;
}

export async function countScoredMatches(session?: ClientSession): Promise<number> {
  if (session) return Match.countDocuments({ isScored: true }).session(session);
  return Match.countDocuments({ isScored: true });
}
