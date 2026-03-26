import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDb } from "@/lib/db";
import { parsePlayerCsv } from "@/lib/csvParser";
import { requireAdmin } from "@/lib/session";
import { Franchise } from "@/models/Franchise";
import { Player } from "@/models/Player";

const bulkRowSchema = z.object({
  name: z.string().min(1),
  franchise: z.string().min(1),
  tier: z.union([z.literal(1), z.literal(3), z.literal(5)]),
  role: z.enum(["bat", "bowl", "allrounder", "wk"]),
});

const bodySchema = z.union([
  z.object({ csv: z.string().min(1) }),
  z.object({ rows: z.array(bulkRowSchema).min(1) }),
]);

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    await connectDb();
    const rows =
      "csv" in parsed.data ? parsePlayerCsv(parsed.data.csv) : parsed.data.rows;
    const created: string[] = [];
    for (const row of rows) {
      const fr = await Franchise.findOne({
        $or: [{ shortCode: row.franchise.toUpperCase() }, { name: row.franchise }],
      }).lean();
      if (!fr) continue;
      const p = await Player.create({
        name: row.name,
        franchise: fr._id,
        tier: row.tier,
        role: row.role,
        isActive: true,
        totalFantasyPoints: 0,
      });
      created.push(String(p._id));
    }
    return NextResponse.json({ created: created.length, ids: created });
  } catch (e) {
    const err = e as Error & { status?: number };
    if (err.status) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(e);
    return NextResponse.json({ error: (e as Error).message ?? "Upload failed" }, { status: 400 });
  }
}
