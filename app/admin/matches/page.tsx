"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Loader2 } from "lucide-react";
import { AdminCreateMatchPanel } from "@/components/admin/AdminCreateMatchPanel";
import { AdminEditMatchDialog } from "@/components/admin/AdminEditMatchDialog";
import { AdminMatchScheduleList, type AdminMatchRow } from "@/components/admin/AdminMatchScheduleList";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";

interface Franchise {
  _id: string;
  name: string;
  shortCode: string;
  logoUrl?: string;
}

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<AdminMatchRow[]>([]);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<AdminMatchRow | null>(null);
  const [matchNumber, setMatchNumber] = useState(1);
  const [fa, setFa] = useState("");
  const [fb, setFb] = useState("");
  const [venue, setVenue] = useState("");
  const [when, setWhen] = useState("");

  useEffect(() => {
    let cancelled = false;
    setListLoading(true);
    Promise.all([fetch("/api/matches"), fetch("/api/franchises")])
      .then(async ([rm, rf]) => {
        const m = rm.ok ? await rm.json() : [];
        const f = rf.ok ? await rf.json() : [];
        if (!cancelled) {
          setMatches(Array.isArray(m) ? m : []);
          setFranchises(Array.isArray(f) ? f : []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMatches([]);
          setFranchises([]);
        }
      })
      .finally(() => {
        if (!cancelled) setListLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const resetCreateForm = () => {
    setFa("");
    setFb("");
    setVenue("");
    setWhen("");
  };

  const create = async () => {
    if (!fa || !fb || !when || (venue !== "home" && venue !== "away")) return;
    setCreating(true);
    try {
      const res = await fetch("/api/matches", {
        method: "POST",
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
        alert(err.error ?? "Could not create match");
        return;
      }
      const m = (await res.json()) as AdminMatchRow;
      setMatches((prev) => [...prev, m]);
      setMatchNumber(m.matchNumber + 1);
      resetCreateForm();
      setScheduleOpen(false);
    } finally {
      setCreating(false);
    }
  };

  const handleSaved = (updated: AdminMatchRow) => {
    setMatches((prev) => prev.map((x) => (x._id === updated._id ? updated : x)));
  };

  return (
    <div className="space-y-8 sm:space-y-10">
      <AdminPageHeader
        accent="emerald"
        segment="Admin · Fixtures"
        title="Matches"
        description="Build the season fixture by fixture. Each match unlocks fantasy scoring for every player in the two squads."
        icon={CalendarDays}
        actions={
          <>
            <div className="flex flex-col items-start gap-1 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-left backdrop-blur-sm sm:items-end sm:text-right">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/50">Scheduled</span>
              <span className="font-mono text-2xl font-semibold tabular-nums tracking-tight text-white">
                {matches.length}
              </span>
            </div>
            {!scheduleOpen ? (
              <Button
                type="button"
                size="lg"
                className="h-11 rounded-xl border border-white/25 bg-white/5 font-semibold text-white hover:bg-white/10"
                onClick={() => setScheduleOpen(true)}
              >
                Schedule match
              </Button>
            ) : null}
          </>
        }
      />

      {listLoading ? (
        <div className="flex min-h-[36vh] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
          <Loader2 className="size-10 animate-spin text-white/50" aria-hidden />
        </div>
      ) : (
        <>
          {scheduleOpen ? (
            <AdminCreateMatchPanel
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
              onSubmit={create}
              isSubmitting={creating}
              onCancel={() => {
                setScheduleOpen(false);
                resetCreateForm();
              }}
            />
          ) : null}

          <AdminMatchScheduleList matches={matches} onEdit={(m) => setEditingMatch(m)} />
        </>
      )}

      <AdminEditMatchDialog
        open={editingMatch !== null}
        onOpenChange={(open) => {
          if (!open) setEditingMatch(null);
        }}
        match={editingMatch}
        franchises={franchises}
        onSaved={handleSaved}
      />
    </div>
  );
}
