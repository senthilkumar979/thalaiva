"use client";

import Link from "next/link";
import { ArrowRight, CalendarClock, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface LobbyCompetition {
  _id: string;
  name: string;
  description?: string;
  entryDeadline: string;
  participants?: unknown[];
}

interface CompetitionLobbyCardProps {
  competition: LobbyCompetition;
  isAuthenticated: boolean;
  onJoin: (id: string) => void;
}

function formatDeadline(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export const CompetitionLobbyCard = ({
  competition: c,
  isAuthenticated,
  onJoin,
}: CompetitionLobbyCardProps) => {
  const open = new Date() < new Date(c.entryDeadline);
  const participantCount = Array.isArray(c.participants) ? c.participants.length : 0;

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.09] to-white/[0.02] p-6 shadow-[0_20px_60px_-28px_rgba(0,0,0,0.55)] backdrop-blur-md transition-all duration-300",
        "hover:border-white/20 hover:shadow-[0_24px_70px_-24px_rgba(25,57,138,0.45)] hover:-translate-y-0.5"
      )}
    >
      <div className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-amber-400/10 blur-3xl transition-opacity group-hover:opacity-100" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 size-32 rounded-full bg-sky-400/10 blur-2xl" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
            <Sparkles className="size-5 text-amber-300/90" />
          </span>
          <div className="min-w-0">
            <h2 className="font-semibold leading-tight tracking-tight text-white">{c.name}</h2>
            {c.description ? (
              <p className="mt-1 line-clamp-2 text-sm leading-snug text-white/55">{c.description}</p>
            ) : null}
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ring-1",
            open
              ? "bg-emerald-500/15 text-emerald-200 ring-emerald-400/30"
              : "bg-white/10 text-white/50 ring-white/15"
          )}
        >
          {open ? "Entries open" : "Closed"}
        </span>
      </div>

      <div className="relative mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/65">
        <span className="inline-flex items-center gap-1.5">
          <CalendarClock className="size-4 text-amber-300/80" />
          <time dateTime={c.entryDeadline}>{formatDeadline(c.entryDeadline)}</time>
        </span>
        <span className="inline-flex items-center gap-1.5 text-white/50">
          <Users className="size-4" />
          {participantCount} joined
        </span>
      </div>

      <div className="relative mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-5">
        <Link href={`/competitions/${c._id}`} className="inline-flex">
          <Button
            type="button"
            size="sm"
            className="rounded-lg bg-white font-semibold text-[#19398a] shadow-md hover:bg-white/90"
          >
            View league
            <ArrowRight className="size-4" />
          </Button>
        </Link>
        {isAuthenticated && open && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-lg border-white/25 bg-white/5 text-white hover:bg-white/10"
            onClick={() => onJoin(c._id)}
          >
            Join & enter
          </Button>
        )}
      </div>
    </article>
  );
};
