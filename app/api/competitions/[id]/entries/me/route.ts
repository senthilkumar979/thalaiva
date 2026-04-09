import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getSwapPenaltyDeductedForEntries } from "@/lib/entrySwapPenaltyTotals";
import { requireUser } from "@/lib/session";
import { entryTotalFantasyWithSwapBudget } from "@/lib/swapPenaltyRules";
import { Entry } from "@/models/Entry";
import { Franchise } from "../../../../../../models/Franchise";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const session = await requireUser();
    const { id } = await params;
    await connectDb();
    const entry = await Entry.findOne({ competition: id, user: session.user.id })
      .populate("tier1Players", "name franchise tier role")
      .populate("tier2Players", "name franchise tier role")
      .populate("tier3Players", "name franchise tier role")
      .populate("captain", "name franchise tier role")
      .populate("viceCaptain", "name franchise tier role")
      .lean();
    const franchises = await Franchise.find().lean();

    const mapPlayersWithFranchises = (players: unknown[] | undefined) => players?.map((p: unknown) => ({
      ...(p as { name: string; franchise: string }),
      franchise: franchises.find((f) => f._id.toString() === String((p as { franchise: string }).franchise ?? "")),
    })) ?? []

    const mapPlayerWithFranchise = (player: unknown) => ({
      ...(player as { name: string; franchise: string }),
      franchise: franchises.find((f) => f._id.toString() === String((player as { franchise: string }).franchise ?? "")),
    })

    const entryWithFranchises = {
      ...entry,
      tier1Players: mapPlayersWithFranchises(entry?.tier1Players ?? []),
      tier2Players: mapPlayersWithFranchises(entry?.tier2Players ?? []),
      tier3Players: mapPlayersWithFranchises(entry?.tier3Players ?? []),
      captain: mapPlayerWithFranchise(entry?.captain),
      viceCaptain: mapPlayerWithFranchise(entry?.viceCaptain),
    }

    if (!entry) return NextResponse.json(null);
    const penaltyMap = await getSwapPenaltyDeductedForEntries([entry._id]);
    const d = penaltyMap.get(String(entry._id)) ?? 0;
    return NextResponse.json({
      ...entryWithFranchises,
      totalScore: entryTotalFantasyWithSwapBudget(entry.totalScore ?? 0, d),
    });
  } catch (e) {
    const err = e as Error & { status?: number };
    if (err.status) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
