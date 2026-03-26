import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDb } from "@/lib/db";
import { parseDateOnlyLocal } from "@/lib/matchDate";
import { requireAdmin } from "@/lib/session";
import { Match } from "@/models/Match";

const patchSchema = z.object({
  matchNumber: z.number().int().positive().optional(),
  franchiseA: z.string().min(1).optional(),
  franchiseB: z.string().min(1).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  venue: z.enum(["home", "away"]).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const json = await req.json();
    const parsed = patchSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }
    const data = parsed.data;
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }
    await connectDb();
    const match = await Match.findById(id);
    if (!match) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (match.isScored) {
      return NextResponse.json({ error: "Cannot edit a match that is already scored" }, { status: 400 });
    }
    if (data.matchNumber !== undefined) match.matchNumber = data.matchNumber;
    if (data.franchiseA !== undefined) match.franchiseA = new mongoose.Types.ObjectId(data.franchiseA);
    if (data.franchiseB !== undefined) match.franchiseB = new mongoose.Types.ObjectId(data.franchiseB);
    if (data.date !== undefined) match.date = parseDateOnlyLocal(data.date);
    if (data.venue !== undefined) match.venue = data.venue;
    await match.save();
    const fresh = await Match.findById(id)
      .populate("franchiseA", "name shortCode logoUrl")
      .populate("franchiseB", "name shortCode logoUrl")
      .lean();
    return NextResponse.json(fresh);
  } catch (e) {
    const err = e as Error & { code?: number };
    if (err.code === 11000) {
      return NextResponse.json({ error: "Match number already exists" }, { status: 400 });
    }
    const http = e as Error & { status?: number };
    if (http.status) return NextResponse.json({ error: http.message }, { status: http.status });
    console.error(e);
    return NextResponse.json({ error: "Failed to update match" }, { status: 500 });
  }
}
