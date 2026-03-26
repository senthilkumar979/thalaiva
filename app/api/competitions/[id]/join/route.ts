import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { Competition } from "@/models/Competition";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_req: Request, { params }: RouteParams) {
  try {
    const session = await requireUser();
    const { id } = await params;
    await connectDb();
    const comp = await Competition.findById(id);
    if (!comp) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!comp.isActive) return NextResponse.json({ error: "Competition closed" }, { status: 400 });
    const uid = session.user.id;
    if (!comp.participants.map(String).includes(uid)) {
      comp.participants.push(new mongoose.Types.ObjectId(uid));
      await comp.save();
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    const err = e as Error & { status?: number };
    if (err.status) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(e);
    return NextResponse.json({ error: "Failed to join" }, { status: 500 });
  }
}
