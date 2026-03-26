import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDb } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { Competition } from "@/models/Competition";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const patchSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  entryDeadline: z.string().datetime().optional(),
  entriesFrozen: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    await connectDb();
    const comp = await Competition.findById(id).populate("createdBy", "name email").lean();
    if (!comp) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(comp);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load competition" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
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
    const comp = await Competition.findById(id);
    if (!comp) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (data.name !== undefined) comp.name = data.name;
    if (data.description !== undefined) comp.description = data.description;
    if (data.entryDeadline !== undefined) comp.entryDeadline = new Date(data.entryDeadline);
    if (data.entriesFrozen !== undefined) comp.entriesFrozen = data.entriesFrozen;
    if (data.isActive !== undefined) comp.isActive = data.isActive;
    await comp.save();
    const fresh = await Competition.findById(id).populate("createdBy", "name email").lean();
    return NextResponse.json(fresh);
  } catch (e) {
    const err = e as Error & { status?: number };
    if (err.status) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(e);
    return NextResponse.json({ error: "Failed to update competition" }, { status: 500 });
  }
}
