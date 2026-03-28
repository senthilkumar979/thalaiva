"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  SubmittedPlayersTable,
  type SubmittedPlayerRow,
} from "@/components/competitions/SubmittedPlayersTable";

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
  const [loading, setLoading] = useState(false);

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
          if (a.role < b.role) return -1;
          if (a.role > b.role) return 1;
          return 0;
        });
        setRows(Array.isArray(data) ? data : []);
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
          <DialogDescription>Player, role, IPL team, and points in this competition.</DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No players loaded.</p>
        ) : (
          <SubmittedPlayersTable rows={rows} variant="entryOnly" />
        )}
      </DialogContent>
    </Dialog>
  );
};
