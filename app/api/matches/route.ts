import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDb } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { Match } from "@/models/Match";

const createSchema = z.object({
  matchNumber: z.number().int().positive(),
  franchiseA: z.string().min(1),
  franchiseB: z.string().min(1),
  date: z.string().datetime(),
  venue: z.string().min(1).max(200),
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
      date: new Date(parsed.data.date),
      venue: parsed.data.venue,
      isScored: false,
    });
    return NextResponse.json(m);
  } catch (e) {
    const err = e as Error & { status?: number };
    if (err.status) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(e);
    return NextResponse.json({ error: "Failed to create match" }, { status: 500 });
  }
}
