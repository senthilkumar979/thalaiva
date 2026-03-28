import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDb } from "@/lib/db";
import { validateEntrySelection } from "@/lib/validation";
import { requireUser } from "@/lib/session";
import { Competition } from "@/models/Competition";
import { Entry } from "@/models/Entry";
import { syncRosterVersionFromEntryIfNoSwaps } from "@/lib/entryRosterVersion";

const entrySchema = z.object({
  customTeamName: z.string().min(1).max(120),
  tier1Players: z.array(z.string()).length(5),
  tier2Players: z.array(z.string()).length(5),
  tier3Players: z.array(z.string()).length(5),
  captain: z.string().min(1),
  viceCaptain: z.string().min(1),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const session = await requireUser();
    const { id } = await params;
    const json = await req.json();
    const parsed = entrySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid entry", details: parsed.error.flatten() }, { status: 400 });
    }
    await connectDb();
    const comp = await Competition.findById(id);
    if (!comp) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (comp.entriesFrozen || new Date() > comp.entryDeadline) {
      return NextResponse.json(
        { error: comp.entriesFrozen ? "Entries are closed" : "Entry deadline passed" },
        { status: 400 }
      );
    }
    if (!comp.participants.map(String).includes(session.user.id)) {
      return NextResponse.json({ error: "Join the competition first" }, { status: 400 });
    }
    await validateEntrySelection(parsed.data);
    const payload = {
      competition: new mongoose.Types.ObjectId(id),
      user: new mongoose.Types.ObjectId(session.user.id),
      customTeamName: parsed.data.customTeamName,
      tier1Players: parsed.data.tier1Players.map((x) => new mongoose.Types.ObjectId(x)),
      tier2Players: parsed.data.tier2Players.map((x) => new mongoose.Types.ObjectId(x)),
      tier3Players: parsed.data.tier3Players.map((x) => new mongoose.Types.ObjectId(x)),
      captain: new mongoose.Types.ObjectId(parsed.data.captain),
      viceCaptain: new mongoose.Types.ObjectId(parsed.data.viceCaptain),
      totalScore: 0,
    };
    let entry = await Entry.findOne({ competition: id, user: session.user.id });
    if (!entry) entry = new Entry(payload);
    else {
      const prevScore = entry.totalScore;
      Object.assign(entry, payload);
      entry.totalScore = prevScore;
    }
    await entry.save();
    await syncRosterVersionFromEntryIfNoSwaps(entry.toObject());
    return NextResponse.json(entry);
  } catch (e) {
    const err = e as Error & { status?: number };
    if (err.status) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(e);
    return NextResponse.json({ error: (e as Error).message ?? "Failed to save entry" }, { status: 400 });
  }
}
