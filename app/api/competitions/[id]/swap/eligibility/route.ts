import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { areCompetitionEntriesClosed } from "@/lib/competitionEntryGate";
import { ensureEntrySwapMigration } from "@/lib/ensureEntrySwapMigration";
import { requireUser } from "@/lib/session";
import { getSwapPenaltyDeductedForEntries } from "@/lib/entrySwapPenaltyTotals";
import {
  entryTotalFantasyWithSwapBudget,
  MAX_PLAYER_SWAPS_TOTAL,
  totalPlayerSwapsFromEntry,
} from "@/lib/swapPenaltyRules";
import { countScoredMatches } from "@/lib/swapEffectiveMatch";
import { Competition } from "@/models/Competition";
import { Entry } from "@/models/Entry";
import { Match } from "@/models/Match";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const session = await requireUser();
    const { id } = await params;
    await connectDb();
    const comp = await Competition.findById(id).lean();
    if (!comp) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!comp.participants.map(String).includes(session.user.id)) {
      return NextResponse.json({ error: "Not a participant" }, { status: 403 });
    }

    let entry = await Entry.findOne({ competition: id, user: session.user.id }).lean();
    if (entry) {
      await ensureEntrySwapMigration(new mongoose.Types.ObjectId(entry._id));
      entry = await Entry.findOne({ competition: id, user: session.user.id }).lean();
    }
    const scoredMatches = await countScoredMatches();
    const blockSequence = Math.floor(scoredMatches / 15);
    const nextUnscored = await Match.findOne({ isScored: false }).sort({ matchNumber: 1 }).lean();
    const nextMatchNumber = nextUnscored ? nextUnscored.matchNumber : null;
    const entriesClosed = areCompetitionEntriesClosed(comp.entriesFrozen, comp.entryDeadline);
    const swapWindowOpen = comp.swapWindowOpen === true;
    const activeSwapWindowId = comp.activeSwapWindow ? String(comp.activeSwapWindow) : null;

    const swapsUsed = entry ? totalPlayerSwapsFromEntry(entry) : 0;
    const swapsRemaining = Math.max(0, MAX_PLAYER_SWAPS_TOTAL - swapsUsed);
    const t1 = entry?.swapsUsedTierSlot1 ?? 0;
    const t2 = entry?.swapsUsedTierSlot2 ?? 0;
    const t3 = entry?.swapsUsedTierSlot3 ?? 0;
    const tierRemaining = {
      1: Math.max(0, 2 - t1),
      2: Math.max(0, 2 - t2),
      3: Math.max(0, 2 - t3),
    } as const;
    const leadershipChangeAvailable = entry ? !entry.leadershipChangeUsed : false;

    const canSwap = Boolean(
      entry &&
        entriesClosed &&
        swapWindowOpen &&
        activeSwapWindowId &&
        (swapsRemaining > 0 || leadershipChangeAvailable)
    );

    let penaltyD = 0;
    if (entry) {
      const pm = await getSwapPenaltyDeductedForEntries([entry._id]);
      penaltyD = pm.get(String(entry._id)) ?? 0;
    }

    let reason: string | undefined;
    if (!entry) reason = "No team submitted";
    else if (!entriesClosed) reason = "Opens after the entry deadline";
    else if (!swapWindowOpen || !activeSwapWindowId) reason = "Swap window is closed";
    else if (swapsRemaining <= 0 && !leadershipChangeAvailable) {
      reason = "No player swaps or leadership changes left";
    }

    return NextResponse.json({
      canSwap,
      reason: canSwap ? undefined : reason,
      swapsRemaining,
      swapsUsed,
      swapsUsedTierSlot1: t1,
      swapsUsedTierSlot2: t2,
      swapsUsedTierSlot3: t3,
      tierRemaining,
      totalScore: entry
        ? entryTotalFantasyWithSwapBudget(entry.totalScore ?? 0, penaltyD)
        : 0,
      scoredMatches,
      blockSequence,
      nextMatchNumber,
      swapWindowOpen,
      activeSwapWindowId,
      entriesClosed,
      leadershipChangeAvailable,
      /** @deprecated Use leadershipChangeAvailable (single C or VC change per competition). */
      captainChangeAvailable: leadershipChangeAvailable,
      /** @deprecated Use leadershipChangeAvailable. */
      viceCaptainChangeAvailable: leadershipChangeAvailable,
    });
  } catch (e) {
    const err = e as Error & { status?: number };
    if (err.status) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
