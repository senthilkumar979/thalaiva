import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDb } from "@/lib/db";
import { areCompetitionEntriesClosed } from "@/lib/competitionEntryGate";
import { validateSwapRequest } from "@/lib/executeEntrySwaps";
import { requireUser } from "@/lib/session";
import { Competition } from "@/models/Competition";
import { Entry } from "@/models/Entry";

const swapItemSchema = z.object({
  tierSlot: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  playerOutId: z.string().min(1),
  playerInId: z.string().min(1),
});

const bodySchema = z
  .object({
    swaps: z.array(swapItemSchema).default([]),
    newCaptainId: z.string().optional(),
    newViceCaptainId: z.string().optional(),
  })
  .refine(
    (d) =>
      d.swaps.length > 0 ||
      Boolean(d.newCaptainId?.trim()) ||
      Boolean(d.newViceCaptainId?.trim()),
    { message: "Provide at least one player swap or a captain/vice-captain change" }
  );

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** Dry-run swap validation (same rules as POST …/swap, no writes). */
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const session = await requireUser();
    const { id } = await params;
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
    }

    await connectDb();
    const comp = await Competition.findById(id);
    if (!comp) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!comp.participants.map(String).includes(session.user.id)) {
      return NextResponse.json({ error: "Not a participant" }, { status: 403 });
    }
    if (!areCompetitionEntriesClosed(comp.entriesFrozen, comp.entryDeadline)) {
      return NextResponse.json({ error: "Swaps are only available after entries close" }, { status: 400 });
    }
    if (!comp.swapWindowOpen || !comp.activeSwapWindow) {
      return NextResponse.json({ error: "Swap window is closed" }, { status: 400 });
    }

    const entry = await Entry.findOne({ competition: id, user: session.user.id });
    if (!entry) return NextResponse.json({ error: "No entry found" }, { status: 404 });

    const swapPayload = {
      entryId: entry._id,
      userId: new mongoose.Types.ObjectId(session.user.id),
      competitionId: new mongoose.Types.ObjectId(id),
      swapWindowId: comp.activeSwapWindow as mongoose.Types.ObjectId,
      swaps: parsed.data.swaps,
      newCaptainId: parsed.data.newCaptainId,
      newViceCaptainId: parsed.data.newViceCaptainId,
    };

    await validateSwapRequest(swapPayload, undefined);

    return NextResponse.json({ ok: true });
  } catch (e) {
    const err = e as Error & { status?: number };
    if (err.status) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(e);
    return NextResponse.json({ error: (e as Error).message ?? "Validation failed" }, { status: 400 });
  }
}
