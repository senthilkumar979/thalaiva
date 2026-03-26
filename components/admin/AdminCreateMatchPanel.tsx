"use client";

import { Sparkles } from "lucide-react";
import { AdminCreateMatchFields } from "@/components/admin/AdminCreateMatchFields";
import type { AdminFranchiseOption } from "@/components/admin/adminCreateMatchShared";

interface AdminCreateMatchPanelProps {
  franchises: AdminFranchiseOption[];
  matchNumber: number;
  onMatchNumberChange: (n: number) => void;
  franchiseA: string;
  onFranchiseAChange: (id: string) => void;
  franchiseB: string;
  onFranchiseBChange: (id: string) => void;
  venue: string;
  onVenueChange: (v: string) => void;
  when: string;
  onWhenChange: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const AdminCreateMatchPanel = (props: AdminCreateMatchPanelProps) => (
  <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-card via-card to-emerald-500/[0.04] shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)] ring-1 ring-border/30 dark:from-card dark:via-card dark:to-emerald-950/30 dark:shadow-[0_24px_80px_-32px_rgba(0,0,0,0.5)]">
    <div
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_0%_-20%,rgba(16,185,129,0.12),transparent),radial-gradient(ellipse_60%_40%_at_100%_100%,rgba(20,184,166,0.08),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_0%_-20%,rgba(16,185,129,0.08),transparent)]"
      aria-hidden
    />
    <div className="relative border-b border-border/40 bg-muted/20 px-6 py-5 sm:px-8">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400/90">
          <Sparkles className="size-3" aria-hidden />
          New fixture
        </div>
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Schedule a match</h2>
        <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
          Pair two franchises, set venue and kickoff — then score fantasy points from the list below.
        </p>
      </div>
    </div>
    <AdminCreateMatchFields {...props} />
  </div>
);
