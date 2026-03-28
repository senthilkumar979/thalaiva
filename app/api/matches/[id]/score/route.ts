import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDb } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { submitMatchScores, type PlayerStatInput } from "@/lib/scoreSubmission";
import { Match } from "@/models/Match";
import { Player } from "@/models/Player";

const statSchema = z.object({
  playerId: z.string().min(1),
  participated: z.boolean(),
  Batting: z.object({
    runs: z.number().min(0),
    ballsFaced: z.number().min(0),
    fours: z.number().min(0),
    sixes: z.number().min(0),
    isOut: z.boolean(),
  }),
  Bowling: z.object({
    wickets: z.number().min(0),
    oversBowled: z.number().min(0),
    maidenOvers: z.number().min(0),
    runsConceded: z.number().min(0),
    dotBalls: z.number().min(0),
    hasHattrick: z.boolean(),
  }),
  Fielding: z.object({
    catches: z.number().min(0),
    stumpings: z.number().min(0),
    runOuts: z.number().min(0),
    assistedRunOuts: z.number().min(0),
  }),
});

const bodySchema = z.object({
  stats: z.array(statSchema).min(1),
  /** Optional; must be one of the players in `stats` and in playing XI for +50 PoM points. */
  playerOfMatchPlayerId: z.string().nullable().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
    }
    await connectDb();
    const match = await Match.findById(id).lean();
    if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });
    const fa = String(match.franchiseA);
    const fb = String(match.franchiseB);
    const statIds = new Set(parsed.data.stats.map((s) => s.playerId));
    for (const s of parsed.data.stats) {
      const p = await Player.findById(s.playerId).lean();
      if (!p) return NextResponse.json({ error: `Unknown player ${s.playerId}` }, { status: 400 });
      const fid = String(p.franchise);
      if (fid !== fa && fid !== fb) {
        return NextResponse.json({ error: `Player ${p.name} not in this match` }, { status: 400 });
      }
    }
    const pom = parsed.data.playerOfMatchPlayerId?.trim() ?? null;
    if (pom && !statIds.has(pom)) {
      return NextResponse.json(
        { error: "Player of the match must be one of the players in this score sheet" },
        { status: 400 }
      );
    }
    if (pom) {
      const pomRow = parsed.data.stats.find((s) => s.playerId === pom);
      if (!pomRow?.participated) {
        return NextResponse.json(
          { error: "Player of the match must have playing XI (participation) checked" },
          { status: 400 }
        );
      }
    }
    await submitMatchScores(id, parsed.data.stats as PlayerStatInput[], {
      playerOfMatchPlayerId: pom,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const err = e as Error & { status?: number };
    if (err.status) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(e);
    return NextResponse.json({ error: (e as Error).message ?? "Scoring failed" }, { status: 500 });
  }
}
