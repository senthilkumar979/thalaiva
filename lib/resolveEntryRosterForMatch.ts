import type { ClientSession, Types } from "mongoose";
import { EntryRosterVersion } from "@/models/EntryRosterVersion";
import type { IEntry } from "@/models/Entry";

export interface ResolvedEntryRoster {
  tier1Players: Types.ObjectId[];
  tier2Players: Types.ObjectId[];
  tier3Players: Types.ObjectId[];
  captain: Types.ObjectId;
  viceCaptain?: Types.ObjectId;
}

function rosterPlayerIds(r: ResolvedEntryRoster): Types.ObjectId[] {
  return [...r.tier1Players, ...r.tier2Players, ...r.tier3Players];
}

/** Roster + flat ids for scoring loops. */
export interface ResolvedEntryRosterWithIds extends ResolvedEntryRoster {
  playerIds: Types.ObjectId[];
}

export async function resolveEntryRosterForMatch(
  entryId: Types.ObjectId,
  matchNumber: number,
  entryFallback: IEntry,
  session?: ClientSession
): Promise<ResolvedEntryRosterWithIds> {
  const q = EntryRosterVersion.findOne({
    entry: entryId,
    effectiveFromMatchNumber: { $lte: matchNumber },
  })
    .sort({ effectiveFromMatchNumber: -1 })
    .lean();

  const v = session ? await q.session(session) : await q;

  if (v) {
    const roster: ResolvedEntryRoster = {
      tier1Players: v.tier1Players,
      tier2Players: v.tier2Players,
      tier3Players: v.tier3Players,
      captain: v.captain,
      viceCaptain: v.viceCaptain,
    };
    return { ...roster, playerIds: rosterPlayerIds(roster) };
  }

  const roster: ResolvedEntryRoster = {
    tier1Players: entryFallback.tier1Players,
    tier2Players: entryFallback.tier2Players,
    tier3Players: entryFallback.tier3Players,
    captain: entryFallback.captain,
    viceCaptain: entryFallback.viceCaptain,
  };
  return { ...roster, playerIds: rosterPlayerIds(roster) };
}
