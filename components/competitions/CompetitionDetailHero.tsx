"use client";

import { CalendarClock, Sparkles, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CompetitionDetailData {
  name: string;
  description?: string;
  entryDeadline: string;
  /** Admin closed entries before deadline. */
  entriesFrozen?: boolean;
  participants?: unknown[];
}

interface CompetitionDetailHeroProps {
  competition: CompetitionDetailData;
}

function formatDeadline(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export const CompetitionDetailHero = ({ competition: c }: CompetitionDetailHeroProps) => {
  const frozen = c.entriesFrozen === true;
  const beforeDeadline = new Date() < new Date(c.entryDeadline);
  const open = !frozen && beforeDeadline;
  const count = Array.isArray(c.participants) ? c.participants.length : 0;

  return (
    <header className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.1] to-transparent p-6 shadow-inner sm:p-8">
      <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-amber-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 size-40 rounded-full bg-sky-400/10 blur-2xl" />
      <div className="relative">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white/55">
            <Sparkles className="size-3 text-amber-300/90" />
            League
          </span>
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1",
              open
                ? "bg-emerald-500/15 text-emerald-200 ring-emerald-400/25"
                : "bg-white/10 text-white/45 ring-white/15"
            )}
          >
            {open ? "Entries open" : frozen ? "Entries closed (frozen)" : "Entry closed"}
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl sm:leading-tight">
          {c.name}
        </h1>
        {c.description ? (
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-white/65">{c.description}</p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/70">
          <span className="inline-flex items-center gap-2">
            <CalendarClock className="size-4 shrink-0 text-amber-300/85" />
            <time dateTime={c.entryDeadline}>{formatDeadline(c.entryDeadline)}</time>
          </span>
          <span className="inline-flex items-center gap-2 text-white/55">
            <Users className="size-4" />
            {count} participant{count === 1 ? "" : "s"}
          </span>
        </div>
      </div>
    </header>
  );
};
