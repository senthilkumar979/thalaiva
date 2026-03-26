import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { Franchise } from "@/models/Franchise";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDb();
    const rows = await Franchise.find().sort({ shortCode: 1 }).lean();
    return NextResponse.json(rows);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
