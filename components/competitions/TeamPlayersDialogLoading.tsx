"use client";

export const TeamPlayersDialogLoading = () => (
  <div className="space-y-6 px-6 py-6">
    <div className="h-28 animate-pulse rounded-2xl bg-white/[0.06] ring-1 ring-white/10" />
    <div className="flex gap-3">
      <div className="h-20 flex-1 animate-pulse rounded-xl bg-white/[0.06] ring-1 ring-white/10" />
      <div className="h-20 flex-1 animate-pulse rounded-xl bg-white/[0.06] ring-1 ring-white/10" />
      <div className="h-20 flex-1 animate-pulse rounded-xl bg-white/[0.06] ring-1 ring-white/10" />
    </div>
    <div className="h-48 animate-pulse rounded-xl bg-white/[0.06] ring-1 ring-inset ring-white/10" />
  </div>
);
