import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { buildMatchHighlights } from "@/lib/buildMatchHighlights";
import { mapPlayerMatchScoresToRows } from "@/lib/mapMatchPlayerScores";
import { Competition } from "@/models/Competition";
import { Match } from "@/models/Match";
import { PlayerMatchScore } from "@/models/PlayerMatchScore";

interface RouteParams {
  params: Promise<{ id: string; matchId: string }>;
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { id, matchId } = await params;
    await connectDb();
    const comp = await Competition.findById(id).select("name").lean();
    if (!comp) return NextResponse.json({ error: "Competition not found" }, { status: 404 });

    const m = await Match.findById(matchId)
      .populate("franchiseA", "name shortCode logoUrl")
      .populate("franchiseB", "name shortCode logoUrl")
      .lean();
    if (!m) return NextResponse.json({ error: "Match not found" }, { status: 404 });

    const fa = m.franchiseA as unknown as { _id: unknown; name: string; shortCode: string; logoUrl?: string };
    const fb = m.franchiseB as unknown as { _id: unknown; name: string; shortCode: string; logoUrl?: string };
    const mid = String(m._id);

    const franchisePayload = {
      franchiseA: {
        _id: String(fa._id),
        name: fa.name,
        shortCode: fa.shortCode,
        logoUrl: fa.logoUrl,
      },
      franchiseB: {
        _id: String(fb._id),
        name: fb.name,
        shortCode: fb.shortCode,
        logoUrl: fb.logoUrl,
      },
    };

    const matchPayload = {
      _id: mid,
      matchNumber: m.matchNumber,
      date: m.date,
      venue: m.venue,
      isScored: m.isScored,
    };

    if (!m.isScored) {
      return NextResponse.json({
        competition: { _id: String(comp._id), name: comp.name },
        scored: false,
        match: matchPayload,
        ...franchisePayload,
        players: [],
        highlights: null,
      });
    }

    const scores = await PlayerMatchScore.find({ match: matchId })
      .populate({
        path: "player",
        select: "name franchise tier role",
        populate: { path: "franchise", select: "shortCode name logoUrl" },
      })
      .lean();

    const players = mapPlayerMatchScoresToRows(m, scores);
    const highlights = buildMatchHighlights(players);

    return NextResponse.json({
      competition: { _id: String(comp._id), name: comp.name },
      scored: true,
      match: matchPayload,
      ...franchisePayload,
      players,
      highlights,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load scoreboard" }, { status: 500 });
  }
}
