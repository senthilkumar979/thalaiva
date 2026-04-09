import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getPlayerMatchFantasyPointsBreakdown } from "@/lib/scoring";
import { PlayerMatchScore, type IPlayerMatchScore } from "@/models/PlayerMatchScore";

interface RouteParams {
  params: Promise<{ id: string; matchId: string }>;
}

function mongoRefIdString(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "object" && v !== null && "_id" in v && (v as { _id: unknown })._id != null) {
    return String((v as { _id: unknown })._id);
  }
  return String(v);
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { id, matchId } = await params;
    await connectDb();
    const doc = await PlayerMatchScore.findOne({ player: id, match: matchId })
      .populate({
        path: "player",
        select: "name franchise tier role",
        populate: { path: "franchise", select: "shortCode name logoUrl" },
      })
      .populate("match", "matchNumber date venue franchiseA franchiseB playerOfMatch")
      .lean();
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const participated = Boolean((doc as IPlayerMatchScore).participated);
    const pomId = mongoRefIdString(
      (doc as IPlayerMatchScore & { match?: { playerOfMatch?: unknown } }).match?.playerOfMatch
    );
    const playerIdStr = mongoRefIdString(doc.player);
    const isPlayerOfMatch = participated && pomId !== "" && playerIdStr === pomId;
    const { total, breakdown } = getPlayerMatchFantasyPointsBreakdown(
      {
        Batting: doc.Batting,
        Bowling: doc.Bowling,
        Fielding: doc.Fielding,
      },
      participated,
      isPlayerOfMatch
    );
    const player = doc.player as unknown as {
      name: string;
      franchise?: { shortCode?: string };
    };
    return NextResponse.json({
      ...doc,
      player,
      fantasyPoints: total,
      breakdown,
      isPlayerOfMatch,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load score" }, { status: 500 });
  }
}
