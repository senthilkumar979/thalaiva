import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { Competition } from "@/models/Competition";

export async function GET() {
  try {
    await requireAdmin();
    await connectDb();
    const list = await Competition.find()
      .sort({ entryDeadline: -1 })
      .populate("createdBy", "name email")
      .lean();
    return NextResponse.json(list);
  } catch (e) {
    const err = e as Error & { status?: number };
    if (err.status) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(e);
    return NextResponse.json({ error: "Failed to load competitions" }, { status: 500 });
  }
}
