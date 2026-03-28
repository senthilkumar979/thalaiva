import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { Entry } from "@/models/Entry";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const session = await requireUser();
    const { id } = await params;
    await connectDb();
    const entry = await Entry.findOne({ competition: id, user: session.user.id })
      .populate("tier1Players", "name franchise tier role")
      .populate("tier2Players", "name franchise tier role")
      .populate("tier3Players", "name franchise tier role")
      .populate("captain", "name franchise tier role")
      .populate(
        "viceCaptain",
        "name franchise tier role"
      )
      .lean();
    if (!entry) return NextResponse.json(null);
    return NextResponse.json(entry);
  } catch (e) {
    const err = e as Error & { status?: number };
    if (err.status) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
