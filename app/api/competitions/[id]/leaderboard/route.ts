import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { Entry } from "@/models/Entry";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    await connectDb();
    const rows = await Entry.find({ competition: id })
      .sort({ totalScore: -1 })
      .populate("user", "name email")
      .lean();
    let rank = 1;
    const ranked = rows.map((r, i) => {
      if (i > 0 && r.totalScore < rows[i - 1].totalScore) rank = i + 1;
      return {
        rank,
        totalScore: r.totalScore,
        customTeamName: r.customTeamName,
        user: r.user,
      };
    });
    return NextResponse.json(ranked);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
