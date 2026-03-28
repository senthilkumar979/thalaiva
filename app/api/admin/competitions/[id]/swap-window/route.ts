import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDb } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { countScoredMatches } from "@/lib/swapEffectiveMatch";
import { Competition } from "@/models/Competition";
import { SwapWindow } from "@/models/SwapWindow";

const bodySchema = z.object({
  action: z.enum(["open", "close"]),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    await connectDb();
    const comp = await Competition.findById(id);
    if (!comp) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (parsed.data.action === "open") {
      if (comp.swapWindowOpen) {
        return NextResponse.json({ error: "Swap window is already open" }, { status: 400 });
      }
      const scoredMatches = await countScoredMatches();
      const blockSequence = Math.floor(scoredMatches / 15);
      if (blockSequence < 1) {
        return NextResponse.json(
          { error: "At least 15 matches must be scored before opening a swap window" },
          { status: 400 }
        );
      }

      const [win] = await SwapWindow.create([
        {
          competition: comp._id,
          blockSequence,
          isOpen: true,
          openedAt: new Date(),
        },
      ]);

      comp.swapWindowOpen = true;
      comp.activeSwapWindow = win._id as mongoose.Types.ObjectId;
      await comp.save();

      return NextResponse.json({
        swapWindow: win,
        scoredMatches,
        blockSequence,
      });
    }

    if (!comp.swapWindowOpen || !comp.activeSwapWindow) {
      return NextResponse.json({ error: "No open swap window" }, { status: 400 });
    }

    const activeId = comp.activeSwapWindow;
    await SwapWindow.updateOne(
      { _id: activeId },
      { $set: { isOpen: false, closedAt: new Date() } }
    );
    await Competition.findByIdAndUpdate(comp._id, {
      $set: { swapWindowOpen: false },
      $unset: { activeSwapWindow: "" },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    const err = e as Error & { status?: number };
    if (err.status) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
