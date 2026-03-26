import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDb } from "@/lib/db";
import { parseDateOnlyLocal } from "@/lib/matchDate";
import { requireAdmin } from "@/lib/session";
import { Match } from "@/models/Match";

const createSchema = z.object({
  matchNumber: z.number().int().positive(),
  franchiseA: z.string().min(1),
  franchiseB: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  venue: z.enum(["home", "away"]),
});

export async function GET() {
  try {
    await connectDb();
    const matches = await Match.find()
      .sort({ date: 1 })
      .populate("franchiseA", "name shortCode logoUrl")
      .populate("franchiseB", "name shortCode logoUrl")
      .lean();
    return NextResponse.json(matches);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const json = await req.json();
    const parsed = createSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }
    await connectDb();
    const m = await Match.create({
      matchNumber: parsed.data.matchNumber,
      franchiseA: parsed.data.franchiseA,
      franchiseB: parsed.data.franchiseB,
      date: parseDateOnlyLocal(parsed.data.date),
      venue: parsed.data.venue,
      isScored: false,
    });
    const fresh = await Match.findById(m._id)
      .populate("franchiseA", "name shortCode logoUrl")
      .populate("franchiseB", "name shortCode logoUrl")
      .lean();
    return NextResponse.json(fresh);
  } catch (e) {
    const err = e as Error & { code?: number; status?: number };
    if (err.code === 11000) {
      return NextResponse.json({ error: "Match number already exists" }, { status: 400 });
    }
    if (err.status) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(e);
    return NextResponse.json({ error: "Failed to create match" }, { status: 500 });
  }
}
