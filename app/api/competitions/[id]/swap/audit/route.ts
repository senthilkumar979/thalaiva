import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { Entry } from "@/models/Entry";
import { EntrySwapAudit } from "@/models/EntrySwapAudit";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const session = await requireUser();
    const { id } = await params;
    await connectDb();
    const entry = await Entry.findOne({ competition: id, user: session.user.id }).select("_id").lean();
    if (!entry) return NextResponse.json({ rows: [] });

    const rows = await EntrySwapAudit.find({ entry: entry._id })
      .sort({ createdAt: -1 })
      .populate("playerOut", "name tier")
      .populate("playerIn", "name tier")
      .populate("swapWindow", "blockSequence openedAt closedAt")
      .lean();

    return NextResponse.json({ rows });
  } catch (e) {
    const err = e as Error & { status?: number };
    if (err.status) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
