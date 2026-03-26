import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDb } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { Competition } from "@/models/Competition";

const createSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  entryDeadline: z.string().datetime(),
});

export async function GET() {
  try {
    await connectDb();
    const list = await Competition.find({ isActive: true })
      .sort({ entryDeadline: 1 })
      .populate("createdBy", "name email")
      .lean();
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load competitions" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireUser();
    const json = await req.json();
    const parsed = createSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }
    await connectDb();
    const comp = await Competition.create({
      name: parsed.data.name,
      description: parsed.data.description ?? "",
      createdBy: session.user.id,
      entryDeadline: new Date(parsed.data.entryDeadline),
      entriesFrozen: false,
      isActive: true,
      participants: [session.user.id],
    });
    return NextResponse.json(comp);
  } catch (e) {
    const err = e as Error & { status?: number };
    if (err.status) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(e);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
