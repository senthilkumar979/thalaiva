"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { CompetitionBreadcrumb } from "@/components/competitions/CompetitionBreadcrumb";
import { TeamBuilder } from "@/components/TeamBuilder";

interface Competition {
  name: string;
  entryDeadline: string;
}

const THEME_BG = "#19398a";

export default function EnterCompetitionPage() {
  const params = useParams();
  const id = String(params.id);
  const { status } = useSession();
  const [comp, setComp] = useState<Competition | null>(null);

  useEffect(() => {
    fetch(`/api/competitions/${id}`)
      .then((r) => r.json())
      .then(setComp)
      .catch(() => undefined);
  }, [id]);

  const shell = (children: React.ReactNode) => (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/10 px-2 py-8 text-white shadow-2xl sm:px-8 sm:py-10"
      style={{ backgroundColor: THEME_BG }}
    >
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-[#0c1f5c]/80 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(100%,28rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      <div className="relative mx-auto max-w-10xl">{children}</div>
    </div>
  );

  if (status === "loading") {
    return shell(
      <div className="flex min-h-[40vh] items-center justify-center text-white/80">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return shell(
      <div className="px-2 py-12 text-center text-sm text-white/85">
        Please log in to enter this competition.
      </div>
    );
  }

  if (!comp) {
    return shell(
      <div className="flex min-h-[40vh] items-center justify-center text-white/80">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  const deadlinePassed = new Date() > new Date(comp.entryDeadline);

  return shell(
    <div className="space-y-10">
      <CompetitionBreadcrumb
        variant="dark"
        items={[
          { label: "Home", href: "/" },
          { label: "Competitions", href: "/competitions" },
          { label: comp.name, href: `/competitions/${id}` },
          { label: "Enter team" },
        ]}
      />
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="h-1 w-12 rounded-full bg-gradient-to-r from-amber-300 to-amber-500/40" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">
            Competition entry
          </span>
        </div>
        <div className="space-y-3">
          <h1 className="max-w-3xl text-3xl font-bold leading-[1.15] tracking-tight text-white sm:text-4xl sm:leading-tight">
            Build your fantasy squad
          </h1>
          <p className="max-w-2xl text-[15px] leading-relaxed text-white/65 sm:text-base">
            Fifteen picks across three tiers, role rules that mirror real cricket balance, then name your
            captain for double points.
          </p>
        </div>
      </header>
      <TeamBuilder competitionId={id} deadlinePassed={deadlinePassed} />
    </div>
  );
}
