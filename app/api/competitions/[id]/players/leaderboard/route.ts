import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDb } from "@/lib/db";
import { Competition } from "@/models/Competition";
import "@/models/Franchise";
import { Player } from "@/models/Player";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * All active players in the pool with franchise and total fantasy points.
 * Points are accumulated across scored IPL matches (global player pool); the competition id
 * scopes this view to a league context.
 */
export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid competition" }, { status: 400 });
    }
    await connectDb();
    const comp = await Competition.findById(id).select("_id").lean();
    if (!comp) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const players = await Player.find({ isActive: true })
      .populate("franchise", "name shortCode logoUrl")
      .sort({ totalFantasyPoints: -1, name: 1 })
      .lean();

    return NextResponse.json({ players });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load players" }, { status: 500 });
  }
}
