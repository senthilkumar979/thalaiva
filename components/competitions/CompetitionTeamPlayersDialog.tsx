"use client";

import { TeamPlayersDialogHero } from "@/components/competitions/TeamPlayersDialogHero";
import { TeamPlayersDialogLoading } from "@/components/competitions/TeamPlayersDialogLoading";
import { TeamPlayersDialogTabs } from "@/components/competitions/TeamPlayersDialogTabs";
import type { SubmittedPlayerRow } from "@/components/competitions/SubmittedPlayersTable";
import {
  totalPenaltyPointsDeducted,
  type TeamSwapAuditRow,
} from "@/components/competitions/TeamSwapAuditSection";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface CompetitionTeamPlayersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  competitionId: string;
  entryId: string | null;
  teamName: string | null;
}

export const CompetitionTeamPlayersDialog = ({
  open,
  onOpenChange,
  competitionId,
  entryId,
  teamName,
}: CompetitionTeamPlayersDialogProps) => {
  const [rows, setRows] = useState<SubmittedPlayerRow[]>([]);
  const [swapRows, setSwapRows] = useState<TeamSwapAuditRow[]>([]);
  const [loading, setLoading] = useState(false);

  function addTierToRows(players: SubmittedPlayerRow[]): (SubmittedPlayerRow & { tier?: number })[] {
    if (players.length > 0 && "tier" in players[0]) return players as (SubmittedPlayerRow & { tier?: number })[];
    return players;
  }

  useEffect(() => {
    if (!open || !entryId) return;
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
              : "You can only open other teams after entries are frozen."
          );
          onOpenChange(false);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onOpenChange only for error close
  }, [open, entryId, competitionId]);

  const penaltyTotal = totalPenaltyPointsDeducted(swapRows);
  const displayName = teamName?.trim() || "Team squad";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[min(92vh,880px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl lg:max-w-5xl",
          "border-white/15 bg-blue-950/[10] text-white shadow-2xl ring-1 ring-white/10 sm:rounded-2xl",
          "[&_[data-slot=dialog-close]]:text-white/70 [&_[data-slot=dialog-close]]:hover:bg-white/10 [&_[data-slot=dialog-close]]:hover:text-white [&_[data-slot=dialog-close]]:opacity-100"
        )}
      >
        <TeamPlayersDialogHero
          displayName={displayName}
          loading={loading}
          squadCount={rows.length}
          transferCount={swapRows.length}
          penaltyTotal={penaltyTotal}
        />

        {loading ? <TeamPlayersDialogLoading /> : <TeamPlayersDialogTabs rows={rows} swapRows={swapRows} />}
      </DialogContent>
    </Dialog>
  );
};
