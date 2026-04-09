import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { shouldRevealAllTeams } from "@/lib/competitionTeamVisibility";
import { getAuthSession } from "@/lib/session";
import { Competition } from "@/models/Competition";
import { Entry } from "@/models/Entry";
import { EntrySwapAudit } from "@/models/EntrySwapAudit";
import "@/models/SwapWindow";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const playerPopulate = {
  path: "playerOut",
  select: "name tier role",
  populate: { path: "franchise", select: "name shortCode logoUrl" },
} as const;

const playerInPopulate = {
  path: "playerIn",
  select: "name tier role",
  populate: { path: "franchise", select: "name shortCode logoUrl" },
} as const;

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const entryIdQ = new URL(req.url).searchParams.get("entryId");
    await connectDb();
    const [comp, session] = await Promise.all([
      Competition.findById(id).select("entriesFrozen").lean(),
      getAuthSession(),
    ]);
    if (!comp) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const revealAll = shouldRevealAllTeams(comp.entriesFrozen, session);
    const uid = session?.user?.id;

    let targetEntryId: mongoose.Types.ObjectId;

    if (!entryIdQ) {
      if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const entry = await Entry.findOne({ competition: id, user: uid }).select("_id").lean();
      if (!entry) return NextResponse.json({ rows: [] });
      targetEntryId = entry._id;
    } else {
      if (!mongoose.Types.ObjectId.isValid(entryIdQ)) {
        return NextResponse.json({ error: "Invalid entry" }, { status: 400 });
      }
      if (!revealAll) {
        if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const own = await Entry.exists({
          _id: entryIdQ,
          competition: id,
          user: new mongoose.Types.ObjectId(uid),
        });
        if (!own) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      } else {
        const exists = await Entry.exists({ _id: entryIdQ, competition: id });
        if (!exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      targetEntryId = new mongoose.Types.ObjectId(entryIdQ);
    }

    const rows = await EntrySwapAudit.find({ entry: targetEntryId })
      .sort({ createdAt: -1 })
      .populate(playerPopulate)
      .populate(playerInPopulate)
      .populate("swapWindow", "blockSequence openedAt closedAt")
      .lean();

    return NextResponse.json({ rows });
  } catch (e) {
    const err = e as Error & { status?: number };
    if (err.status) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
