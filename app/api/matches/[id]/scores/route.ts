import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { PlayerMatchScore } from "@/models/PlayerMatchScore";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    await connectDb();
    const rows = await PlayerMatchScore.find({ match: id })
      .populate("player", "name franchise tier role")
      .lean();
    return NextResponse.json(rows);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
