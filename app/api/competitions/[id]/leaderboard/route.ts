import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getSwapPenaltyDeductedForEntries } from "@/lib/entrySwapPenaltyTotals";
import { getAuthSession } from "@/lib/session";
import { shouldRevealAllTeams } from "@/lib/competitionTeamVisibility";
import { entryTotalFantasyWithSwapBudget } from "@/lib/swapPenaltyRules";
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

    const rows = await Entry.find({ competition: id }).populate("user", "name email").lean();
    const penaltyMap = await getSwapPenaltyDeductedForEntries(rows.map((r) => r._id));

    const withDisplay = rows.map((r) => {
      const d = penaltyMap.get(String(r._id)) ?? 0;
      const displayTotal = entryTotalFantasyWithSwapBudget(r.totalScore ?? 0, d);
      return { row: r, displayTotal };
    });
    withDisplay.sort((a, b) => b.displayTotal - a.displayTotal);

    let rank = 1;
    const ranked = withDisplay.map((item, i) => {
      if (i > 0 && item.displayTotal < withDisplay[i - 1].displayTotal) rank = i + 1;
      const r = item.row;
      return {
        entryId: String(r._id),
        rank,
        totalScore: item.displayTotal,
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
