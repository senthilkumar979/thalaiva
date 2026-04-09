import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { areCompetitionEntriesClosed } from "@/lib/competitionEntryGate";
import { requireUser } from "@/lib/session";
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

    const entry = await Entry.findOne({ competition: id, user: session.user.id }).lean();
    const scoredMatches = await countScoredMatches();
    const blockSequence = Math.floor(scoredMatches / 15);
    const nextUnscored = await Match.findOne({ isScored: false }).sort({ matchNumber: 1 }).lean();
    const nextMatchNumber = nextUnscored ? nextUnscored.matchNumber : null;
    const entriesClosed = areCompetitionEntriesClosed(comp.entriesFrozen, comp.entryDeadline);
    const swapWindowOpen = comp.swapWindowOpen === true;
    const activeSwapWindowId = comp.activeSwapWindow ? String(comp.activeSwapWindow) : null;

    const swapsUsed = entry?.swapCountUsed ?? 0;
    const swapsRemaining = Math.max(0, 6 - swapsUsed);

    const canSwap = Boolean(
      entry &&
        entriesClosed &&
        swapWindowOpen &&
        activeSwapWindowId &&
        swapsRemaining > 0
    );

    let reason: string | undefined;
    if (!entry) reason = "No team submitted";
    else if (!entriesClosed) reason = "Opens after the entry deadline";
    else if (!swapWindowOpen || !activeSwapWindowId) reason = "Swap window is closed";
    else if (swapsRemaining <= 0) reason = "All 6 swaps used";

    return NextResponse.json({
      canSwap,
      reason: canSwap ? undefined : reason,
      swapsRemaining,
      swapsUsed,
      scoredMatches,
      blockSequence,
      nextMatchNumber,
      swapWindowOpen,
      activeSwapWindowId,
      entriesClosed,
      captainChangeAvailable: entry ? !entry.captainChangeUsed : false,
      viceCaptainChangeAvailable: entry ? !entry.viceCaptainChangeUsed : false,
    });
  } catch (e) {
    const err = e as Error & { status?: number };
    if (err.status) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
