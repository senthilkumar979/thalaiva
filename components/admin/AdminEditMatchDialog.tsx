"use client";

import { useEffect, useState } from "react";
import { AdminCreateMatchFields } from "@/components/admin/AdminCreateMatchFields";
import type { AdminFranchiseOption } from "@/components/admin/adminCreateMatchShared";
import type { AdminMatchRow } from "@/components/admin/AdminMatchScheduleList";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toDateInputValue } from "@/lib/matchDate";
import { normalizeVenue } from "@/lib/matchVenue";
import { cn } from "@/lib/utils";

interface AdminEditMatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  match: AdminMatchRow | null;
  franchises: AdminFranchiseOption[];
  onSaved: (m: AdminMatchRow) => void;
}

export const AdminEditMatchDialog = ({
  open,
  onOpenChange,
  match,
  franchises,
  onSaved,
}: AdminEditMatchDialogProps) => {
  const [matchNumber, setMatchNumber] = useState(1);
  const [fa, setFa] = useState("");
  const [fb, setFb] = useState("");
  const [venue, setVenue] = useState("");
  const [when, setWhen] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!match) return;
    setMatchNumber(match.matchNumber);
    setFa(match.franchiseA._id);
    setFb(match.franchiseB._id);
    setVenue(normalizeVenue(match.venue));
    setWhen(toDateInputValue(match.date));
  }, [match]);

  const save = async () => {
    if (!match) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/matches/${match._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchNumber,
          franchiseA: fa,
          franchiseB: fb,
          venue,
          date: when,
        }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        alert(err.error ?? "Failed to save");
        return;
      }
      const updated = (await res.json()) as AdminMatchRow;
      onSaved(updated);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className={cn("max-h-[90vh] overflow-y-auto sm:max-w-lg")}
      >
        <DialogHeader>
          <DialogTitle>Edit match</DialogTitle>
          <DialogDescription>
            Update fixture details. Scored matches cannot be edited.
          </DialogDescription>
        </DialogHeader>
        {match ? (
          <AdminCreateMatchFields
            className="px-0 py-4 sm:px-0"
            franchises={franchises}
            matchNumber={matchNumber}
            onMatchNumberChange={setMatchNumber}
            franchiseA={fa}
            onFranchiseAChange={setFa}
            franchiseB={fb}
            onFranchiseBChange={setFb}
            venue={venue}
            onVenueChange={setVenue}
            when={when}
            onWhenChange={setWhen}
            onSubmit={save}
            submitLabel="Save changes"
            onCancel={() => onOpenChange(false)}
            isSubmitting={saving}
            footerHint=""
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
