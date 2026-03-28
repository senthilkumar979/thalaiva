import type { ReactNode } from "react";

/**
 * Same outer treatment as `app/competitions/[id]/page.tsx`: deep blue gradient, sky/amber glows, top highlight.
 */
export const AdminIplShell = ({ children }: { children: ReactNode }) => (
  <div className="relative overflow-hidden rounded-2xl border border-white/10 text-white shadow-2xl">
    <div
      className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0a1f4a] via-[#19398a] to-[#071229]"
      aria-hidden
    />
    <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-sky-500/12 blur-3xl" aria-hidden />
    <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" aria-hidden />
    <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(100%,28rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent" aria-hidden />
    <div className="relative z-10 space-y-8 px-4 py-8 sm:px-8 sm:py-10">{children}</div>
  </div>
);
