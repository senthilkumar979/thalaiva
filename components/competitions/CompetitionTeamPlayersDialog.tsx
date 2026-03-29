"use client";

import {
  SubmittedPlayersTable,
  type SubmittedPlayerRow,
} from "@/components/competitions/SubmittedPlayersTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface CompetitionTeamPlayersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  competitionId: string;
  entryId: string | null;
  teamName: string | null;
}

function getTierLabel(tier: number | string | undefined) {
  if (!tier) return null;
  if (typeof tier === "string") tier = parseInt(tier, 10);
  if (tier === 1) return "Tier 1";
  if (tier === 2) return "Tier 2";
  if (tier === 3) return "Tier 3";
  return `Tier ${tier}`;
}

export const CompetitionTeamPlayersDialog = ({
  open,
  onOpenChange,
  competitionId,
  entryId,
  teamName,
}: CompetitionTeamPlayersDialogProps) => {
  const [rows, setRows] = useState<SubmittedPlayerRow[]>([]);
  const [loading, setLoading] = useState(false);

  // Add 'tier' prop if missing, e.g. backend does not provide it.
  function addTierToRows(players: SubmittedPlayerRow[]): (SubmittedPlayerRow & { tier?: number })[] {
    // If tier already present on all rows, just use it
    if (players.length > 0 && "tier" in players[0]) return players as (SubmittedPlayerRow & { tier?: number })[];
    // fallback: Not possible to infer tier without backend data, so skip
    return players;
  }

  useEffect(() => {
    if (!open || !entryId) return;
    setLoading(true);
    fetch(
      `/api/competitions/${competitionId}/submitted-players?entryId=${encodeURIComponent(entryId)}`
    )
      .then(async (r) => {
        if (r.status === 401 || r.status === 403) {
          toast.error(
            r.status === 401
              ? "Log in to view squads."
              : "You can only open other teams after entries are frozen."
          );
          onOpenChange(false);
          setRows([]);
          return;
        }
        const data = await r.json();
        data.sort((a: SubmittedPlayerRow, b: SubmittedPlayerRow) => {
          if (a.isCaptain && !b.isCaptain) return -1;
          if (!a.isCaptain && b.isCaptain) return 1;
          if (a.isViceCaptain && !b.isViceCaptain) return -1;
          if (!a.isViceCaptain && b.isViceCaptain) return 1;
          if (a.tier < b.tier) return -1;
          return 0;
        });
        const withTiers = addTierToRows(Array.isArray(data) ? data : []);
        setRows(withTiers);
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onOpenChange only for error close
  }, [open, entryId, competitionId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>{teamName ?? "Team squad"}</DialogTitle>
          <DialogDescription>
            Player, role, IPL team, <b>tier</b>, and points in this competition.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No players loaded.</p>
        ) : (
          <SubmittedPlayersTable
            rows={
              rows.map((row: SubmittedPlayerRow & { tier?: number }) => ({
                ...row,
                // We'll pass a tierLabel field for convenience
                tierLabel: getTierLabel(row.tier),
              }))
            }
            variant="entryOnly"
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
