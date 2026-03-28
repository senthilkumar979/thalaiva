import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { buildMyTeamMatchRows } from "@/lib/myTeamMatchRows";
import { requireUser } from "@/lib/session";
import { CompetitionMatchScore } from "@/models/CompetitionMatchScore";
import { Entry } from "@/models/Entry";
import { Match } from "@/models/Match";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const session = await requireUser();
    const { id } = await params;
    await connectDb();
    const entry = await Entry.findOne({ competition: id, user: session.user.id }).lean();
    if (!entry) return NextResponse.json({ error: "No entry" }, { status: 404 });

    const allMatches = await Match.find({})
      .sort({ date: 1 })
      .populate("franchiseA", "shortCode name")
      .populate("franchiseB", "shortCode name")
      .lean();

    const cmsList = await CompetitionMatchScore.find({ competition: id, entry: entry._id })
      .populate({
        path: "playersWithPoints.player",
        select: "name franchise tier role",
        populate: { path: "franchise", select: "shortCode name" },
      })
      .lean();

    const cmsByMatch = new Map<
      string,
      {
        totalPointsThisMatch: number;
        rankThisMatch: number;
        playersWithPoints: {
          player: unknown;
          isCaptain: boolean;
          isViceCaptain: boolean;
          rawPoints: number;
          captainMultiplied: number;
        }[];
      }
    >();
    for (const row of cmsList) {
      cmsByMatch.set(String(row.match), {
        totalPointsThisMatch: row.totalPointsThisMatch,
        rankThisMatch: row.rankThisMatch,
        playersWithPoints: row.playersWithPoints.map((p) => ({
          ...p,
          isViceCaptain: p.isViceCaptain ?? false,
        })),
      });
    }

    const out = buildMyTeamMatchRows(allMatches, cmsByMatch);
    return NextResponse.json(out);
  } catch (e) {
    const err = e as Error & { status?: number };
    if (err.status) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
