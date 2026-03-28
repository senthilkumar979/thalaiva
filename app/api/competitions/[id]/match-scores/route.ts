import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { MATCH_PARTICIPATION_POINTS, sectionFantasyPoints } from "@/lib/scoring";
import { Competition } from "@/models/Competition";
import { Match } from "@/models/Match";
import { PlayerMatchScore } from "@/models/PlayerMatchScore";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    await connectDb();
    const comp = await Competition.findById(id).select("name").lean();
    if (!comp) return NextResponse.json({ error: "Competition not found" }, { status: 404 });

    const matches = await Match.find({ isScored: true })
      .sort({ date: -1 })
      .populate("franchiseA", "name shortCode logoUrl")
      .populate("franchiseB", "name shortCode logoUrl")
      .lean();

    const matchIds = matches.map((m) => m._id);
    const allScores =
      matchIds.length === 0
        ? []
        : await PlayerMatchScore.find({ match: { $in: matchIds } })
            .populate({
              path: "player",
              select: "name franchise tier role",
              populate: { path: "franchise", select: "shortCode name" },
            })
            .lean();

    const byMatch = new Map<string, typeof allScores>();
    for (const row of allScores) {
      const mid = String(row.match);
      const list = byMatch.get(mid) ?? [];
      list.push(row);
      byMatch.set(mid, list);
    }

    const out = [];
    for (const m of matches) {
      const mid = String(m._id);
      const scores = byMatch.get(mid) ?? [];
      const faId = String((m.franchiseA as { _id: unknown })._id);

      const players = scores.map((row) => {
        const pl = row.player as unknown as {
          _id: unknown;
          name: string;
          role: string;
          franchise?: { _id: unknown; shortCode?: string; name?: string };
        };
        const fid = pl.franchise ? String(pl.franchise._id) : "";
        const side: "a" | "b" = fid === faId ? "a" : "b";
        const sec = sectionFantasyPoints({
          Batting: row.Batting,
          Bowling: row.Bowling,
          Fielding: row.Fielding,
        });
        const participated = Boolean(row.participated);
        return {
          playerId: String(pl._id),
          name: pl.name,
          role: pl.role,
          franchiseShortCode: pl.franchise?.shortCode ?? "",
          side,
          Batting: row.Batting,
          Bowling: row.Bowling,
          Fielding: row.Fielding,
          participated,
          fantasyPoints: row.fantasyPoints,
          sectionPoints: {
            batting: sec.batting,
            bowling: sec.bowling,
            fielding: sec.fielding,
            participation: participated ? MATCH_PARTICIPATION_POINTS : 0,
          },
        };
      });

      const fa = m.franchiseA as unknown as { _id: unknown; name: string; shortCode: string; logoUrl?: string };
      const fb = m.franchiseB as unknown as { _id: unknown; name: string; shortCode: string; logoUrl?: string };

      out.push({
        match: {
          _id: mid,
          matchNumber: m.matchNumber,
          date: m.date,
          venue: m.venue,
          isScored: m.isScored,
        },
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
        players,
      });
    }

    return NextResponse.json({
      competition: { _id: String(comp._id), name: comp.name },
      matches: out,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load match scores" }, { status: 500 });
  }
}
