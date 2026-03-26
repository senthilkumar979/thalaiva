"use client";

import { Loader2 } from "lucide-react";

export const CompetitionDetailLoading = () => (
  <div className="flex min-h-[50vh] items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-[#0a1f4a] via-[#19398a] to-[#071229]">
    <Loader2 className="size-10 animate-spin text-white/50" />
  </div>
);
