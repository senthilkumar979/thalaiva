"use client";

import { Trophy } from "lucide-react";

interface CompetitionsEmptyStateProps {
  isAuthenticated: boolean;
}

export const CompetitionsEmptyState = ({ isAuthenticated }: CompetitionsEmptyStateProps) => (
  <div className="rounded-2xl border border-dashed border-white/20 bg-white/[0.03] px-6 py-16 text-center">
    <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
      <Trophy className="size-8 text-white/40" />
    </div>
    <p className="text-lg font-medium text-white/80">No leagues yet</p>
    <p className="mx-auto mt-2 max-w-sm text-sm text-white/50">
      {isAuthenticated
        ? "Create the first competition above, or check back soon."
        : "Sign in to create a league, or ask a host to share their competition link."}
    </p>
  </div>
);
