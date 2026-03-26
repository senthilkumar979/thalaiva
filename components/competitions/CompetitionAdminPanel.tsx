"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CompetitionAdminPanelProps {
  competitionId: string;
  initial: {
    name: string;
    description?: string;
    entryDeadline: string;
    entriesFrozen: boolean;
  };
  onUpdated: () => void;
}

export const CompetitionAdminPanel = ({
  competitionId,
  initial,
  onUpdated,
}: CompetitionAdminPanelProps) => {
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description ?? "");
  const [entryDeadline, setEntryDeadline] = useState(
    () => new Date(initial.entryDeadline).toISOString().slice(0, 16)
  );
  const [frozen, setFrozen] = useState(initial.entriesFrozen);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFrozen(initial.entriesFrozen);
    setName(initial.name);
    setDescription(initial.description ?? "");
    setEntryDeadline(new Date(initial.entryDeadline).toISOString().slice(0, 16));
  }, [initial.entriesFrozen, initial.name, initial.description, initial.entryDeadline]);

  const patch = async (body: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/competitions/${competitionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error((j as { error?: string }).error ?? "Update failed");
        return;
      }
      toast.success("Competition updated");
      onUpdated();
    } finally {
      setSaving(false);
    }
  };

  const saveDetails = () => {
    void patch({
      name: name.trim(),
      description: description.trim(),
      entryDeadline: new Date(entryDeadline).toISOString(),
    });
  };

  const toggleFreeze = () => {
    const next = !frozen;
    setFrozen(next);
    void (async () => {
      const res = await fetch(`/api/competitions/${competitionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entriesFrozen: next }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFrozen(!next);
        toast.error((j as { error?: string }).error ?? "Could not update");
        return;
      }
      toast.success(next ? "Entries frozen — teams are locked" : "Entries reopened");
      onUpdated();
    })();
  };

  return (
    <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-5 text-white">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-200/80">Admin</p>
      <h2 className="mt-1 text-lg font-semibold text-white">Edit competition</h2>
      <p className="mt-1 text-sm text-white/65">Only admins can change these settings.</p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant={frozen ? "default" : "outline"}
          className={
            frozen
              ? "border-amber-300/40 bg-amber-500/90 text-white hover:bg-amber-500"
              : "border-white/25 bg-white/10 text-white hover:bg-white/15"
          }
          disabled={saving}
          onClick={toggleFreeze}
        >
          {frozen ? "Entries closed (frozen)" : "Freeze entries (close)"}
        </Button>
      </div>

      <div className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`admin-name-${competitionId}`} className="text-white/80">
            Name
          </Label>
          <Input
            id={`admin-name-${competitionId}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border-white/20 bg-white/10 text-white placeholder:text-white/40"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`admin-desc-${competitionId}`} className="text-white/80">
            Description
          </Label>
          <textarea
            id={`admin-desc-${competitionId}`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`admin-deadline-${competitionId}`} className="text-white/80">
            Entry deadline
          </Label>
          <Input
            id={`admin-deadline-${competitionId}`}
            type="datetime-local"
            value={entryDeadline}
            onChange={(e) => setEntryDeadline(e.target.value)}
            className="border-white/20 bg-white/10 text-white"
          />
        </div>
        <Button
          type="button"
          className="bg-white font-semibold text-[#19398a] hover:bg-white/90"
          disabled={saving || !name.trim()}
          onClick={saveDetails}
        >
          Save details
        </Button>
      </div>
    </div>
  );
};
