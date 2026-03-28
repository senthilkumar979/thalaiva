import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { Match } from "@/models/Match";
import { Player } from "@/models/Player";
import { PlayerMatchScore } from "@/models/PlayerMatchScore";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    await connectDb();
    const m = await Match.findById(id)
      .populate("franchiseA", "name shortCode logoUrl")
      .populate("franchiseB", "name shortCode logoUrl")
      .populate("playerOfMatch", "name shortCode")
      .lean();
    if (!m) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const players = await Player.find({
      franchise: { $in: [m.franchiseA, m.franchiseB] },
      isActive: true,
    })
      .populate("franchise", "name shortCode logoUrl")
      .sort({ name: 1 })
      .lean();
    const playerScores = await PlayerMatchScore.find({ match: id }).lean();
    return NextResponse.json({ match: m, players, playerScores });
  } catch (e) {
    const err = e as Error & { status?: number };
    if (err.status) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
