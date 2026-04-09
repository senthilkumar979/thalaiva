import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import "@/models/Franchise";
import "@/models/Match";
import { Player } from "@/models/Player";
import { PlayerMatchScore } from "@/models/PlayerMatchScore";

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface PopulatedFranchise {
  _id?: mongoose.Types.ObjectId;
  shortCode?: string;
  name?: string;
}

interface PopulatedMatch {
  _id: mongoose.Types.ObjectId;
  matchNumber: number;
  date: Date;
  venue: string;
  franchiseA?: PopulatedFranchise | mongoose.Types.ObjectId;
  franchiseB?: PopulatedFranchise | mongoose.Types.ObjectId;
}

function shortCode(fr: PopulatedFranchise | mongoose.Types.ObjectId | undefined): string {
  if (!fr || typeof fr !== "object" || !("shortCode" in fr)) return "—";
  return String((fr as PopulatedFranchise).shortCode ?? "—");
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid player" }, { status: 400 });
    }
    await connectDb();
    const player = await Player.findById(id).select("name").lean();
    if (!player) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const raw = await PlayerMatchScore.find({ player: id })
      .populate({
        path: "match",
        select: "matchNumber date venue franchiseA franchiseB",
        populate: [
          { path: "franchiseA", select: "shortCode name" },
          { path: "franchiseB", select: "shortCode name" },
        ],
      })
      .lean();

    const rows = raw
      .filter((r) => r.match && typeof r.match === "object")
      .map((r) => {
        const m = r.match as unknown as PopulatedMatch;
        const a = shortCode(m.franchiseA as PopulatedFranchise);
        const b = shortCode(m.franchiseB as PopulatedFranchise);
        return {
          _id: String(r._id),
          fantasyPoints: r.fantasyPoints,
          participated: Boolean(r.participated),
          match: {
            matchNumber: m.matchNumber,
            date: m.date instanceof Date ? m.date.toISOString() : String(m.date),
            venue: m.venue ?? "",
            fixtureLabel: `${a} vs ${b}`,
          },
        };
      })
      .sort((x, y) => x.match.matchNumber - y.match.matchNumber);

    return NextResponse.json({
      player: { _id: String(player._id), name: player.name },
      rows,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load match scores" }, { status: 500 });
  }
}
