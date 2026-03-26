import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getAuthSession } from "@/lib/session";
import { shouldRevealAllTeams } from "@/lib/competitionTeamVisibility";
import { Competition } from "@/models/Competition";
import { Entry } from "@/models/Entry";

interface RouteParams {
  params: Promise<{ id: string }>;
}

function userIdFromPopulatedUser(user: unknown): string | null {
  if (!user || typeof user !== "object") return null;
  if ("_id" in user && (user as { _id: unknown })._id != null) {
    return String((user as { _id: unknown })._id);
  }
  return null;
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    await connectDb();
    const [comp, session] = await Promise.all([
      Competition.findById(id).select("entriesFrozen").lean(),
      getAuthSession(),
    ]);
    if (!comp) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const rows = await Entry.find({ competition: id })
      .sort({ totalScore: -1 })
      .populate("user", "name email")
      .lean();
    let rank = 1;
    const ranked = rows.map((r, i) => {
      if (i > 0 && r.totalScore < rows[i - 1].totalScore) rank = i + 1;
      return {
        entryId: String(r._id),
        rank,
        totalScore: r.totalScore,
        customTeamName: r.customTeamName,
        user: r.user,
      };
    });

    const revealAll = shouldRevealAllTeams(comp.entriesFrozen, session);
    if (revealAll) return NextResponse.json(ranked);

    const uid = session?.user?.id;
    if (!uid) return NextResponse.json([]);
    const mine = ranked.filter((r) => userIdFromPopulatedUser(r.user) === uid);
    return NextResponse.json(mine);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
