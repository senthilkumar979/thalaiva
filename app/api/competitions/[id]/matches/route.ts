import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { Competition } from "@/models/Competition";
import { Match } from "@/models/Match";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    await connectDb();
    const comp = await Competition.findById(id).select("name").lean();
    if (!comp) return NextResponse.json({ error: "Competition not found" }, { status: 404 });

    const matches = await Match.find({})
      .sort({ matchNumber: 1 })
      .populate("franchiseA", "name shortCode logoUrl")
      .populate("franchiseB", "name shortCode logoUrl")
      .lean();

    const out = matches.map((m) => {
      const mid = String(m._id);
      const fa = m.franchiseA as unknown as { _id: unknown; name: string; shortCode: string; logoUrl?: string };
      const fb = m.franchiseB as unknown as { _id: unknown; name: string; shortCode: string; logoUrl?: string };
      return {
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
      };
    });

    return NextResponse.json({
      competition: { _id: String(comp._id), name: comp.name },
      matches: out,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load matches" }, { status: 500 });
  }
}
