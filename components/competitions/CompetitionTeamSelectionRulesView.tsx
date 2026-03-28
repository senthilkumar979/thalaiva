"use client";

import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { CompetitionBreadcrumb } from "@/components/competitions/CompetitionBreadcrumb";
import { CompetitionTeamSelectionRulesContent } from "@/components/competitions/CompetitionTeamSelectionRulesContent";
import { CompetitionSubpageShell } from "@/components/competitions/CompetitionSubpageShell";
import { useCompetitionName } from "@/hooks/useCompetitionName";

interface CompetitionTeamSelectionRulesViewProps {
  competitionId: string;
}

export const CompetitionTeamSelectionRulesView = ({
  competitionId,
}: CompetitionTeamSelectionRulesViewProps) => {
  const compName = useCompetitionName(competitionId) ?? "League";

  return (
    <CompetitionSubpageShell>
      <div className="space-y-8">
        <CompetitionBreadcrumb
          variant="dark"
          items={[
            { label: "Home", href: "/" },
            { label: "Competitions", href: "/competitions" },
            { label: compName, href: `/competitions/${competitionId}` },
            { label: "Team selection rules" },
          ]}
        />

        <header className="space-y-4">
          <div className="flex flex-wrap items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-amber-400/25 bg-white/[0.08] shadow-inner ring-1 ring-white/10">
              <ClipboardList className="size-5 text-amber-300/90" aria-hidden />
            </span>
            <div className="min-w-0 space-y-3">
              <div className="flex items-center gap-3">
                <span className="h-1 w-12 rounded-full bg-gradient-to-r from-amber-300 to-amber-500/40" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">
                  Draft & entry
                </span>
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Team selection rules</h1>
                <p className="max-w-2xl text-sm leading-relaxed text-white/65">
                  Everything that must be true to build and submit a valid fantasy squad for this competition — tiers,
                  franchise limits, role balance, captain, and eligibility.
                </p>
              </div>
            </div>
          </div>
        </header>

        <CompetitionTeamSelectionRulesContent competitionId={competitionId} />

        <Link
          href={`/competitions/${competitionId}`}
          className="inline-block text-sm font-medium text-amber-200/90 underline-offset-4 hover:underline"
        >
          ← Back to competition
        </Link>
      </div>
    </CompetitionSubpageShell>
  );
};
