import {
  MATCH_PARTICIPATION_POINTS,
  PLAYER_OF_MATCH_POINTS,
  sectionFantasyPoints,
} from "@/lib/scoring";
import type { MatchScorePlayerRow } from "@/components/competitions/CompetitionMatchScoresAccordion";
import type { IPlayerMatchScore } from "@/models/PlayerMatchScore";

type LeanMatch = {
  franchiseA: { _id: unknown };
  playerOfMatch?: unknown;
};

/**
 * Maps PlayerMatchScore docs (with populated player) to MatchScorePlayerRow for a single match.
 */
export function mapPlayerMatchScoresToRows(
  match: LeanMatch,
  scores: (IPlayerMatchScore & {
    player: unknown;
  })[]
): MatchScorePlayerRow[] {
  const faId = String((match.franchiseA as { _id: unknown })._id);
  return scores.map((row) => {
    const pl = row.player as unknown as {
      _id: unknown;
      name: string;
      role: string;
      franchise?: { _id: unknown; shortCode?: string; name?: string; logoUrl?: string };
    };
    const fid = pl.franchise ? String(pl.franchise._id) : "";
    const side: "a" | "b" = fid === faId ? "a" : "b";
    const sec = sectionFantasyPoints({
      Batting: row.Batting,
      Bowling: row.Bowling,
      Fielding: row.Fielding,
    });
    const participated = Boolean(row.participated);
    const pomRaw = match.playerOfMatch;
    const pomId =
      pomRaw == null
        ? ""
        : typeof pomRaw === "object" && pomRaw !== null && "_id" in pomRaw
          ? String((pomRaw as { _id: unknown })._id)
          : String(pomRaw);
    const isPlayerOfMatch = participated && pomId !== "" && String(pl._id) === pomId;
    return {
      playerId: String(pl._id),
      name: pl.name,
      role: pl.role,
      franchiseShortCode: pl.franchise?.shortCode ?? "",
      franchiseLogoUrl: pl.franchise?.logoUrl,
      side,
      Batting: row.Batting,
      Bowling: row.Bowling,
      Fielding: row.Fielding,
      participated,
      isPlayerOfMatch,
      fantasyPoints: row.fantasyPoints,
      sectionPoints: {
        batting: sec.batting,
        bowling: sec.bowling,
        fielding: sec.fielding,
        participation:
          (participated ? MATCH_PARTICIPATION_POINTS : 0) +
          (isPlayerOfMatch ? PLAYER_OF_MATCH_POINTS : 0),
      },
    };
  });
}
