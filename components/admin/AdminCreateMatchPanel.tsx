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
  onSubmit: () => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const AdminCreateMatchPanel = (props: AdminCreateMatchPanelProps) => (
  <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] shadow-[0_24px_80px_-32px_rgba(0,0,0,0.45)] ring-1 ring-white/10">
    <div
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_0%_-20%,rgba(16,185,129,0.14),transparent),radial-gradient(ellipse_60%_40%_at_100%_100%,rgba(20,184,166,0.1),transparent)]"
      aria-hidden
    />
    <div className="relative border-b border-white/10 bg-white/[0.04] px-6 py-5 sm:px-8">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-100">
          <Sparkles className="size-3" aria-hidden />
          New fixture
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">Schedule a match</h2>
        <p className="max-w-lg text-sm leading-relaxed text-white/65">
          Pair two franchises, set venue and kickoff — then score fantasy points from the list below.
        </p>
      </div>
    </div>
    <AdminCreateMatchFields {...props} forIplShell />
  </div>
);
