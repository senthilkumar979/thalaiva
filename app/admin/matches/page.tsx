"use client";

import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { AdminCreateMatchPanel } from "@/components/admin/AdminCreateMatchPanel";
import { AdminEditMatchDialog } from "@/components/admin/AdminEditMatchDialog";
import {
  AdminMatchScheduleList,
  type AdminMatchRow,
} from "@/components/admin/AdminMatchScheduleList";
import { Button } from "@/components/ui/button";

interface Franchise {
  _id: string;
  name: string;
  shortCode: string;
}

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<AdminMatchRow[]>([]);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<AdminMatchRow | null>(null);
  const [matchNumber, setMatchNumber] = useState(1);
  const [fa, setFa] = useState("");
  const [fb, setFb] = useState("");
  const [venue, setVenue] = useState("");
  const [when, setWhen] = useState("");

  useEffect(() => {
    fetch("/api/matches")
      .then((r) => r.json())
      .then(setMatches)
      .catch(() => undefined);
    fetch("/api/franchises")
      .then((r) => r.json())
      .then(setFranchises)
      .catch(() => undefined);
  }, []);

  const resetCreateForm = () => {
    setFa("");
    setFb("");
    setVenue("");
    setWhen("");
  };

  const create = async () => {
    if (!fa || !fb || !when || (venue !== "home" && venue !== "away")) return;
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
  };

  const handleSaved = (updated: AdminMatchRow) => {
    setMatches((prev) => prev.map((x) => (x._id === updated._id ? updated : x)));
  };

  return (
    <div className="space-y-12">
      <header className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-slate-950/[0.03] via-transparent to-emerald-950/[0.06] px-6 py-8 dark:from-slate-950/40 dark:to-emerald-950/20 sm:px-8 sm:py-10">
        <div
          className="pointer-events-none absolute -right-12 top-0 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl dark:bg-emerald-500/10"
          aria-hidden
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-400/90">
              <span className="flex size-10 items-center justify-center rounded-2xl border border-emerald-500/25 bg-emerald-500/10 shadow-inner">
                <CalendarDays className="size-5" aria-hidden />
              </span>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Matches</h1>
              <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
                Build the season fixture by fixture. Each match unlocks fantasy scoring for every player in the two
                squads.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-stretch gap-3 sm:items-end">
            <div className="flex shrink-0 flex-col items-start gap-1 rounded-2xl border border-border/60 bg-background/60 px-4 py-3 text-left backdrop-blur-sm sm:items-end sm:text-right">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">Scheduled</span>
              <span className="font-mono text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                {matches.length}
              </span>
            </div>
            {!scheduleOpen ? (
              <Button type="button" size="lg" className="rounded-xl font-semibold" onClick={() => setScheduleOpen(true)}>
                Schedule match
              </Button>
            ) : null}
          </div>
        </div>
      </header>

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
          onCancel={() => {
            setScheduleOpen(false);
            resetCreateForm();
          }}
        />
      ) : null}

      <AdminMatchScheduleList matches={matches} onEdit={(m) => setEditingMatch(m)} />

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
