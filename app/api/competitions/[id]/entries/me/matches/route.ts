import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { CompetitionMatchScore } from "@/models/CompetitionMatchScore";
import { Entry } from "@/models/Entry";

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
    const cms = await CompetitionMatchScore.find({ competition: id, entry: entry._id })
      .populate("match", "matchNumber date venue franchiseA franchiseB isScored")
      .lean();
    const sorted = cms
      .filter((row) => row.match && typeof row.match === "object" && "date" in row.match)
      .sort((a, b) => {
        const ma = a.match as unknown as { date: string };
        const mb = b.match as unknown as { date: string };
        return new Date(ma.date).getTime() - new Date(mb.date).getTime();
      });
    let cumulative = 0;
    const out = sorted.map((row) => {
      cumulative += row.totalPointsThisMatch;
      return {
        match: row.match,
        totalPointsThisMatch: row.totalPointsThisMatch,
        rankThisMatch: row.rankThisMatch,
        cumulative,
      };
    });
    return NextResponse.json(out);
  } catch (e) {
    const err = e as Error & { status?: number };
    if (err.status) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
