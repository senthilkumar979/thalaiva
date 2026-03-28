import type { Types } from "mongoose";

export interface MyTeamPlayerPointsRow {
  player: {
    _id: string;
    name: string;
    franchise?: { shortCode?: string };
    tier?: string;
    role?: string;
  };
  isCaptain: boolean;
  isViceCaptain: boolean;
  rawPoints: number;
  captainMultiplied: number;
}

export interface MyTeamMatchRow {
  match: {
    _id: string;
    matchNumber: number;
    date: string;
    venue: string;
    isScored: boolean;
    franchiseA?: { shortCode?: string; name?: string };
    franchiseB?: { shortCode?: string; name?: string };
  };
  totalPointsThisMatch: number;
  rankThisMatch: number | null;
  cumulative: number;
  playersWithPoints: MyTeamPlayerPointsRow[];
}

interface LeanFranchise {
  shortCode?: string;
  name?: string;
}

function serializeFranchise(f: unknown): LeanFranchise | undefined {
  if (!f || typeof f !== "object") return undefined;
  const o = f as LeanFranchise;
  return { shortCode: o.shortCode, name: o.name };
}

function serializePlayerPoints(
  rows: {
    player: unknown;
    isCaptain: boolean;
    isViceCaptain?: boolean;
    rawPoints: number;
    captainMultiplied: number;
  }[]
): MyTeamPlayerPointsRow[] {
  return rows.map((row) => {
    const p = row.player;
    let player: MyTeamPlayerPointsRow["player"] = { _id: "", name: "" };
    if (p && typeof p === "object" && "_id" in p) {
      const pl = p as {
        _id: Types.ObjectId | string;
        name?: string;
        franchise?: LeanFranchise;
        tier?: string;
        role?: string;
      };
      player = {
        _id: String(pl._id),
        name: pl.name ?? "",
        franchise: pl.franchise ? { shortCode: pl.franchise.shortCode } : undefined,
        tier: pl.tier,
        role: pl.role,
      };
    } else {
      player = { _id: String(row.player), name: "" };
    }
    return {
      player,
      isCaptain: row.isCaptain,
      isViceCaptain: Boolean(row.isViceCaptain),
      rawPoints: row.rawPoints,
      captainMultiplied: row.captainMultiplied,
    };
  });
}

export function buildMyTeamMatchRows(
  allMatches: {
    _id: Types.ObjectId;
    matchNumber: number;
    date: Date;
    venue: string;
    isScored: boolean;
    franchiseA?: unknown;
    franchiseB?: unknown;
  }[],
  cmsByMatch: Map<
    string,
    {
      totalPointsThisMatch: number;
      rankThisMatch: number;
      playersWithPoints: {
        player: unknown;
        isCaptain: boolean;
        isViceCaptain?: boolean;
        rawPoints: number;
        captainMultiplied: number;
      }[];
    }
  >
): MyTeamMatchRow[] {
  let cumulative = 0;
  return allMatches.map((m) => {
    const mid = String(m._id);
    const cms = cmsByMatch.get(mid);
    const totalPointsThisMatch = cms?.totalPointsThisMatch ?? 0;
    const rankThisMatch = cms != null ? cms.rankThisMatch : null;
    const playersWithPoints = cms ? serializePlayerPoints(cms.playersWithPoints) : [];
    if (cms) cumulative += totalPointsThisMatch;
    return {
      match: {
        _id: mid,
        matchNumber: m.matchNumber,
        date: m.date instanceof Date ? m.date.toISOString() : String(m.date),
        venue: m.venue,
        isScored: Boolean(m.isScored),
        franchiseA: serializeFranchise(m.franchiseA),
        franchiseB: serializeFranchise(m.franchiseB),
      },
      totalPointsThisMatch,
      rankThisMatch,
      cumulative,
      playersWithPoints,
    };
  });
}
