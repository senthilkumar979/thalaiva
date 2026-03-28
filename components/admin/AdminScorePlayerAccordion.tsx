"use client";

import { useMemo, useState } from "react";
import { Award, ChevronDown, Info } from "lucide-react";
import { AdminScorePlayerRow, type StatFormValues } from "@/components/AdminScorePlayerRow";
import { AdminScoreTeamLogo } from "@/components/admin/AdminScoreTeamLogo";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AdminScorePointsBreakdownDrawer } from "@/components/admin/AdminScorePointsBreakdownDrawer";
import {
  getIplRoleIconUrl,
  IPL_ROLE_ICON_SVG,
  IPL_ROLE_LABELS,
  type KnownPlayerRole,
} from "@/lib/iplRoleIcons";
import { statFormToPlayerMatchStats } from "@/lib/adminScoreToUpdatedStats";
import { calculateFantasyPoints, FANTASY_SCORING_POINT_VALUES } from "@/lib/updatedScoring";
import { cn } from "@/lib/utils";
import type { PlayerRole } from "@/models/Player";

interface AdminScorePlayerAccordionProps {
  matchId: string;
  name: string;
  franchiseLabel: string;
  franchiseLogoUrl?: string;
  franchiseShortCode: string;
  role: PlayerRole;
  participated: boolean;
  onParticipationChange: (value: boolean) => void;
  value: StatFormValues;
  onChange: (next: StatFormValues) => void;
  isPlayerOfTheMatch: boolean;
  onPlayerOfMatchSelect: () => void;
}

function iplRoleLabel(role: PlayerRole): string {
  const k = role as KnownPlayerRole;
  return k in IPL_ROLE_LABELS ? IPL_ROLE_LABELS[k] : IPL_ROLE_LABELS.bat;
}

export const AdminScorePlayerAccordion = ({
  matchId,
  name,
  franchiseLabel,
  franchiseLogoUrl,
  franchiseShortCode,
  role,
  participated,
  onParticipationChange,
  value,
  onChange,
  isPlayerOfTheMatch,
  onPlayerOfMatchSelect,
}: AdminScorePlayerAccordionProps) => {
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const roleIconSrc = getIplRoleIconUrl(role) ?? IPL_ROLE_ICON_SVG.bat;

  const breakdown = useMemo(
    () =>
      calculateFantasyPoints(
        statFormToPlayerMatchStats(value, participated, matchId, isPlayerOfTheMatch)
      ),
    [value, participated, matchId, isPlayerOfTheMatch]
  );

  const displayPoints = Number.isFinite(breakdown.finalScore) ? breakdown.finalScore : 0;
  const showInfo = displayPoints >= 1;

  return (
    <>
      <details
        className={cn(
          "group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-sm ring-1 ring-white/5 transition-colors",
          "open:border-white/15 open:bg-white/[0.05] open:shadow-md open:shadow-black/15"
        )}
      >
        <summary
          className={cn(
            "flex cursor-pointer list-none items-center gap-2 px-3 py-3.5 sm:gap-3 sm:px-5",
            "[&::-webkit-details-marker]:hidden"
          )}
        >
          <div
            className="flex shrink-0 cursor-default flex-col gap-1 border-r border-white/10 pr-2 sm:pr-3"
            role="presentation"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-2">
              <input
                id={`participated-${value.playerId}`}
                type="checkbox"
                className="mt-0.5 size-4 shrink-0 rounded border-white/25 accent-emerald-400"
                checked={participated}
                onChange={(e) => onParticipationChange(e.target.checked)}
                onClick={(e) => e.stopPropagation()}
              />
              <Label
                htmlFor={`participated-${value.playerId}`}
                className="cursor-pointer text-left text-[11px] font-semibold leading-snug text-white sm:text-xs"
              >
                <span className="block">Played in XI</span>
                <span className="mt-0.5 block font-normal text-emerald-200/90">
                  +{FANTASY_SCORING_POINT_VALUES.XI_PARTICIPATION} pts
                </span>
              </Label>
            </div>
          </div>
          <AdminScoreTeamLogo logoUrl={franchiseLogoUrl} shortCode={franchiseShortCode} size="sm" />
          <div className="min-w-0 flex-1 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-white">{name}</span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border border-sky-400/25 bg-sky-500/15 px-2 py-0.5 text-[11px] font-medium text-sky-100"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- IPL SVG from iplt20.com */}
                <img src={roleIconSrc} alt="" className="size-4 shrink-0 object-contain" />
                {iplRoleLabel(role)}
              </span>
              <button
                type="button"
                className={cn(
                  "inline-flex items-center justify-center rounded-full p-1.5 transition-colors",
                  isPlayerOfTheMatch
                    ? "border border-amber-400/50 bg-gradient-to-br from-amber-400/25 to-amber-600/20 text-amber-100 shadow-[0_0_12px_-2px_rgba(251,191,36,0.45)] ring-1 ring-amber-300/35"
                    : "border border-amber-400/25 bg-transparent text-amber-200/60 hover:bg-amber-500/15 hover:text-amber-100"
                )}
                title={
                  isPlayerOfTheMatch
                    ? `Player of the match (+${FANTASY_SCORING_POINT_VALUES.PLAYER_OF_MATCH} pts) — click to clear`
                    : `Mark player of the match (+${FANTASY_SCORING_POINT_VALUES.PLAYER_OF_MATCH} pts; must be in XI)`
                }
                aria-pressed={isPlayerOfTheMatch}
                aria-label={
                  isPlayerOfTheMatch
                    ? `Player of the match, plus ${FANTASY_SCORING_POINT_VALUES.PLAYER_OF_MATCH} fantasy points. Click to clear.`
                    : `Mark as player of the match for plus ${FANTASY_SCORING_POINT_VALUES.PLAYER_OF_MATCH} fantasy points`
                }
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onPlayerOfMatchSelect();
                }}
              >
                <Award className="size-4 shrink-0" strokeWidth={2.25} aria-hidden />
              </button>
            </div>
            <div className="text-xs text-white/55">{franchiseLabel}</div>
          </div>
          <div
            className={cn(
              "flex shrink-0 items-center gap-1 tabular-nums text-lg font-semibold",
              participated ? "text-emerald-200" : "text-white/45"
            )}
          >
            <span>
              {displayPoints}
              <span className="ml-1 text-sm font-medium text-white/45">pts</span>
            </span>
            {showInfo ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="size-8 shrink-0 text-white/50 hover:bg-white/10 hover:text-white"
                aria-label="How these points were calculated"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setBreakdownOpen(true);
                }}
              >
                <Info className="size-4" />
              </Button>
            ) : null}
          </div>
          <ChevronDown
            className="size-5 shrink-0 text-white/45 transition-transform group-open:rotate-180 group-open:text-white/70"
            aria-hidden
          />
        </summary>
        <div className="space-y-4 border-t border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent p-3 sm:p-4">
          {participated ? (
            <AdminScorePlayerRow
              name={name}
              franchise={franchiseLabel}
              value={value}
              onChange={onChange}
              showHeader={false}
              surface="shell"
            />
          ) : (
            <p className="rounded-xl border border-dashed border-white/20 bg-white/[0.03] px-3 py-4 text-center text-sm text-white/60">
              Turn on <span className="font-medium text-white/80">Played in XI</span> on the left to enter batting,
              bowling, and fielding stats.
            </p>
          )}
        </div>
      </details>

      <AdminScorePointsBreakdownDrawer
        open={breakdownOpen}
        onOpenChange={setBreakdownOpen}
        playerName={name}
        franchiseShortCode={franchiseShortCode}
        franchiseLogoUrl={franchiseLogoUrl}
        franchiseLine={franchiseLabel !== franchiseShortCode ? franchiseLabel : undefined}
        role={role}
        pointsBreakdown={breakdown}
      />
    </>
  );
};
