import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDb } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { Player } from "@/models/Player";

const querySchema = z.object({
  tier: z.enum(["1", "3", "5"]).optional(),
});

export async function GET(req: Request) {
  try {
    await connectDb();
    const { searchParams } = new URL(req.url);
    const parsed = querySchema.safeParse({
      tier: searchParams.get("tier") ?? undefined,
    });
    if (!parsed.success) return NextResponse.json({ error: "Invalid query" }, { status: 400 });
    const filter: Record<string, unknown> = { isActive: true };
    if (parsed.data.tier) filter.tier = Number(parsed.data.tier);
    const players = await Player.find(filter)
      .populate("franchise", "name shortCode logoUrl")
      .sort({ name: 1 })
      .lean();
    return NextResponse.json(players);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load players" }, { status: 500 });
  }
}

export async function POST() {
  try {
    await requireAdmin();
    return NextResponse.json({ error: "Use POST /api/players/bulk for CSV" }, { status: 405 });
  } catch (e) {
    const err = e as Error & { status?: number };
    return NextResponse.json({ error: err.message }, { status: err.status ?? 500 });
  }
}
