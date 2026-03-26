import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getPlayerMatchFantasyPointsBreakdown } from "@/lib/scoring";
import { PlayerMatchScore } from "@/models/PlayerMatchScore";

interface RouteParams {
  params: Promise<{ id: string; matchId: string }>;
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { id, matchId } = await params;
    await connectDb();
    const doc = await PlayerMatchScore.findOne({ player: id, match: matchId })
      .populate({ path: "player", select: "name franchise tier role", populate: { path: "franchise", select: "shortCode name" } })
      .populate("match", "matchNumber date venue franchiseA franchiseB")
      .lean();
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const { total, breakdown } = getPlayerMatchFantasyPointsBreakdown({
      Batting: doc.Batting,
      Bowling: doc.Bowling,
      Fielding: doc.Fielding,
    });
    const player = doc.player as unknown as {
      name: string;
      franchise?: { shortCode?: string };
    };
    return NextResponse.json({
      ...doc,
      player,
      fantasyPoints: total,
      breakdown,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load score" }, { status: 500 });
  }
}
