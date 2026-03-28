import type { ReactNode } from "react";
import { COMPETITION_BRAND_BG, COMPETITION_ORB_DEEP } from "@/components/competitions/competitionTheme";

interface CompetitionSubpageShellProps {
  children: ReactNode;
}

export const CompetitionSubpageShell = ({ children }: CompetitionSubpageShellProps) => (
  <div
    className="relative overflow-hidden rounded-2xl border border-white/10 px-2 py-8 text-white shadow-2xl sm:px-8 sm:py-10"
    style={{ backgroundColor: COMPETITION_BRAND_BG }}
  >
    <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
    <div
      className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full opacity-80 blur-3xl"
      style={{ backgroundColor: COMPETITION_ORB_DEEP }}
    />
    <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(100%,28rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
    <div className="relative mx-auto max-w-6xl">{children}</div>
  </div>
);
