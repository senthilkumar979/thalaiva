"use client";

export const TeamPlayersDialogLoading = () => (
  <div className="min-h-0 flex-1 space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6">
    <div className="h-24 animate-pulse rounded-2xl bg-white/[0.06] ring-1 ring-white/10 sm:h-28" />
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="h-20 flex-1 animate-pulse rounded-xl bg-white/[0.06] ring-1 ring-white/10" />
      <div className="h-20 flex-1 animate-pulse rounded-xl bg-white/[0.06] ring-1 ring-white/10" />
      <div className="h-20 flex-1 animate-pulse rounded-xl bg-white/[0.06] ring-1 ring-white/10" />
    </div>
    <div className="h-40 animate-pulse rounded-xl bg-white/[0.06] ring-1 ring-inset ring-white/10 sm:h-48" />
  </div>
);
