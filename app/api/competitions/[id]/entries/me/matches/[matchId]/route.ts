import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { CompetitionMatchScore } from "@/models/CompetitionMatchScore";
import { Entry } from "@/models/Entry";

interface RouteParams {
  params: Promise<{ id: string; matchId: string }>;
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const session = await requireUser();
    const { id, matchId } = await params;
    await connectDb();
    const entry = await Entry.findOne({ competition: id, user: session.user.id }).lean();
    if (!entry) return NextResponse.json({ error: "No entry" }, { status: 404 });
    const cms = await CompetitionMatchScore.findOne({
      competition: id,
      entry: entry._id,
      match: matchId,
    })
      .populate({
        path: "playersWithPoints.player",
        select: "name franchise tier role",
        populate: { path: "franchise", select: "name shortCode" },
      })
      .populate("match")
      .lean();
    if (!cms) return NextResponse.json({ error: "No score for this match" }, { status: 404 });
    return NextResponse.json(cms);
  } catch (e) {
    const err = e as Error & { status?: number };
    if (err.status) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
