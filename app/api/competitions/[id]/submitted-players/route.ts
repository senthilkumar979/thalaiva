import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getAuthSession } from "@/lib/session";
import { shouldRevealAllTeams } from "@/lib/competitionTeamVisibility";
import { Competition } from "@/models/Competition";
import { CompetitionMatchScore } from "@/models/CompetitionMatchScore";
import { Entry } from "@/models/Entry";

interface RouteParams {
  params: Promise<{ id: string }>;
}

function tierPopulate(path: "tier1Players" | "tier2Players" | "tier3Players") {
  return {
    path,
    select: "name role tier totalFantasyPoints",
    populate: { path: "franchise", select: "name shortCode logoUrl" },
  };
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const entryIdQ = new URL(req.url).searchParams.get("entryId");
    await connectDb();
    const [comp, session] = await Promise.all([
      Competition.findById(id).select("entriesFrozen").lean(),
      getAuthSession(),
    ]);
    if (!comp) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const revealAll = shouldRevealAllTeams(comp.entriesFrozen, session);
    const uid = session?.user?.id;

    if (!revealAll) {
      if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      if (entryIdQ) {
        if (!mongoose.Types.ObjectId.isValid(entryIdQ)) {
          return NextResponse.json({ error: "Invalid entry" }, { status: 400 });
        }
        const own = await Entry.exists({
          _id: entryIdQ,
          competition: id,
          user: new mongoose.Types.ObjectId(uid),
        });
        if (!own) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else if (entryIdQ) {
      if (!mongoose.Types.ObjectId.isValid(entryIdQ)) {
        return NextResponse.json({ error: "Invalid entry" }, { status: 400 });
      }
      const exists = await Entry.exists({ _id: entryIdQ, competition: id });
      if (!exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const entryFilter = !revealAll
      ? { competition: id, user: new mongoose.Types.ObjectId(uid!) }
      : entryIdQ
        ? { _id: entryIdQ, competition: id }
        : { competition: id };

    const entries = await Entry.find(entryFilter)
      .select("customTeamName tier1Players tier2Players tier3Players")
      .populate(tierPopulate("tier1Players"))
      .populate(tierPopulate("tier2Players"))
      .populate(tierPopulate("tier3Players"))
      .lean();

    const scores = await CompetitionMatchScore.find({ competition: id }).select("entry playersWithPoints").lean();
    const pointsByEntryPlayer = new Map<string, number>();
    for (const s of scores) {
      const eid = String(s.entry);
      for (const row of s.playersWithPoints) {
        const pid = String(row.player);
        const key = `${eid}:${pid}`;
        pointsByEntryPlayer.set(key, (pointsByEntryPlayer.get(key) ?? 0) + row.captainMultiplied);
      }
    }

    interface PopFranchise {
      _id: unknown;
      name: string;
      shortCode: string;
      logoUrl?: string;
    }
    interface PopPlayer {
      _id: unknown;
      name: string;
      role: string;
      tier: number;
      totalFantasyPoints?: number;
      franchise?: PopFranchise | null;
    }

    const rows: {
      entryId: string;
      teamName: string;
      playerId: string;
      playerName: string;
      role: string;
      tier: number;
      franchiseName: string;
      franchiseShortCode: string;
      franchiseLogoUrl: string;
      pointsScored: number;
    }[] = [];

    for (const e of entries) {
      const eid = String(e._id);
      const teamName = e.customTeamName;
      const tiers = [e.tier1Players, e.tier2Players, e.tier3Players] as unknown as PopPlayer[][];
      for (const tier of tiers) {
        for (const pl of tier) {
          if (!pl || typeof pl !== "object" || !("_id" in pl)) continue;
          const pid = String(pl._id);
          const fr = pl.franchise && typeof pl.franchise === "object" ? pl.franchise : null;
          rows.push({
            entryId: eid,
            teamName,
            playerId: pid,
            playerName: pl.name,
            role: pl.role,
            tier: pl.tier,
            franchiseName: fr?.name ?? "",
            franchiseShortCode: fr?.shortCode ?? "",
            franchiseLogoUrl: fr?.logoUrl ?? "",
            pointsScored: pointsByEntryPlayer.get(`${eid}:${pid}`) ?? 0,
          });
        }
      }
    }

    rows.sort((a, b) => a.teamName.localeCompare(b.teamName) || a.playerName.localeCompare(b.playerName));
    return NextResponse.json(rows);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load submitted players" }, { status: 500 });
  }
}
