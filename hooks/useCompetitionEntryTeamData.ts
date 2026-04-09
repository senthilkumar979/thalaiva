"use client";

import type { SubmittedPlayerRow } from "@/components/competitions/SubmittedPlayersTable";
import {
  totalPenaltyPointsDeducted,
  type TeamSwapAuditRow,
} from "@/components/competitions/TeamSwapAuditSection";
import type { LeaderboardRow } from "@/components/LeaderboardTable";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function addTierToRows(
  players: SubmittedPlayerRow[],
): (SubmittedPlayerRow & { tier?: number })[] {
  if (players.length > 0 && "tier" in players[0])
    return players as (SubmittedPlayerRow & { tier?: number })[];
  return players;
}

export function useCompetitionEntryTeamData(
  competitionId: string,
  entryId: string,
  initialTeamName: string | null | undefined,
  initialTotalFantasyPoints: number | undefined,
) {
  const router = useRouter();
  const [rows, setRows] = useState<SubmittedPlayerRow[]>([]);
  const [swapRows, setSwapRows] = useState<TeamSwapAuditRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [leaderboardMeta, setLeaderboardMeta] = useState<{
    teamName: string;
    totalFantasy: number;
  } | null>(null);

  useEffect(() => {
    fetch(`/api/competitions/${competitionId}/leaderboard`)
      .then((r) => r.json())
      .then((rowsData: LeaderboardRow[]) => {
        const row = Array.isArray(rowsData)
          ? rowsData.find((x) => x.entryId === entryId)
          : undefined;
        if (row)
          setLeaderboardMeta({
            teamName: row.customTeamName,
            totalFantasy: row.totalScore,
          });
        else setLeaderboardMeta(null);
      })
      .catch(() => setLeaderboardMeta(null));
  }, [competitionId, entryId]);

  useEffect(() => {
    if (!entryId) return;
    setLoading(true);
    const q = encodeURIComponent(entryId);
    const playersUrl = `/api/competitions/${competitionId}/submitted-players?entryId=${q}`;
    const auditUrl = `/api/competitions/${competitionId}/swap/audit?entryId=${q}`;

    Promise.all([fetch(playersUrl), fetch(auditUrl)])
      .then(async ([playersRes, auditRes]) => {
        if (playersRes.status === 401 || playersRes.status === 403) {
          toast.error(
            playersRes.status === 401
              ? "Log in to view squads."
              : "You can only open other teams after entries are frozen.",
          );
          router.replace(`/competitions/${competitionId}`);
          setRows([]);
          setSwapRows([]);
          return;
        }
        const data = await playersRes.json();
        if (Array.isArray(data)) {
          data.sort((a: SubmittedPlayerRow, b: SubmittedPlayerRow) => {
            if (a.isCaptain && !b.isCaptain) return -1;
            if (!a.isCaptain && b.isCaptain) return 1;
            if (a.isViceCaptain && !b.isViceCaptain) return -1;
            if (!a.isViceCaptain && b.isViceCaptain) return 1;
            if (a.tier < b.tier) return -1;
            if (a.tier > b.tier) return 1;
            if (a.pointsScored > b.pointsScored) return -1;
            if (a.pointsScored < b.pointsScored) return 1;
            return 0;
          });
          setRows(addTierToRows(data));
        } else {
          setRows([]);
        }

        if (auditRes.ok) {
          const auditJson = await auditRes.json();
          setSwapRows(Array.isArray(auditJson.rows) ? auditJson.rows : []);
        } else {
          setSwapRows([]);
        }
      })
      .catch(() => {
        setRows([]);
        setSwapRows([]);
      })
      .finally(() => setLoading(false));
  }, [entryId, competitionId, router]);

  const penaltyTotal = totalPenaltyPointsDeducted(swapRows);
  const displayName =
    leaderboardMeta?.teamName?.trim() ||
    initialTeamName?.trim() ||
    "Team squad";
  const competitionTotalFantasyPoints =
    leaderboardMeta?.totalFantasy ?? initialTotalFantasyPoints;

  return {
    rows,
    swapRows,
    loading,
    displayName,
    competitionTotalFantasyPoints,
    penaltyTotal,
  };
}
