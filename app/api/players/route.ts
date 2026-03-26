import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDb } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { playerCreateSchema } from "@/lib/validators/playerCreate";
import { Franchise } from "@/models/Franchise";
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

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const json = await req.json();
    const parsed = playerCreateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }
    await connectDb();
    const fr = await Franchise.findById(parsed.data.franchise).lean();
    if (!fr) {
      return NextResponse.json({ error: "Franchise not found" }, { status: 400 });
    }
    const p = await Player.create({
      name: parsed.data.name,
      franchise: parsed.data.franchise,
      tier: parsed.data.tier,
      role: parsed.data.role,
      isActive: true,
      totalFantasyPoints: 0,
    });
    const populated = await Player.findById(p._id)
      .populate("franchise", "name shortCode logoUrl")
      .lean();
    return NextResponse.json(populated);
  } catch (e) {
    const err = e as Error & { status?: number };
    if (err.status) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(e);
    return NextResponse.json({ error: "Failed to create player" }, { status: 500 });
  }
}
