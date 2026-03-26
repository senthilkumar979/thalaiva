import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { Competition } from "@/models/Competition";

interface RouteParams {
  params: Promise<{ id: string }>;
}

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
