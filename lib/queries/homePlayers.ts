import type { Types } from "mongoose";
import { connectDb } from "@/lib/db";
import type { PlayerRole, PlayerTier } from "@/models/Player";
import { Player } from "@/models/Player";

export interface HomePlayer {
  id: string;
  name: string;
  tier: PlayerTier;
  role: PlayerRole;
  totalFantasyPoints: number;
}

export interface HomeFranchiseGroup {
  id: string;
  name: string;
  shortCode: string;
  logoUrl: string;
  players: HomePlayer[];
}

export async function getPlayersGroupedByFranchise(): Promise<HomeFranchiseGroup[]> {
  try {
    await connectDb();
    type Populated = {
      _id: Types.ObjectId;
      name: string;
      tier: PlayerTier;
      role: PlayerRole;
      totalFantasyPoints?: number;
      franchise: { _id: Types.ObjectId; name: string; shortCode: string; logoUrl?: string } | null;
    };
    const raw = (await Player.find({ isActive: true })
      .populate("franchise", "name shortCode logoUrl")
      .sort({ name: 1 })
      .lean()) as unknown as Populated[];

    const map = new Map<string, HomeFranchiseGroup>();
    for (const p of raw) {
      const f = p.franchise;
      if (!f) continue;
      const id = String(f._id);
      if (!map.has(id)) {
        map.set(id, {
          id,
          name: f.name,
          shortCode: f.shortCode,
          logoUrl: f.logoUrl ?? "",
          players: [],
        });
      }
      map.get(id)!.players.push({
        id: String(p._id),
        name: p.name,
        tier: p.tier,
        role: p.role,
        totalFantasyPoints: typeof p.totalFantasyPoints === "number" ? p.totalFantasyPoints : 0,
      });
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  } catch (e) {
    console.error("getPlayersGroupedByFranchise", e);
    return [];
  }
}
