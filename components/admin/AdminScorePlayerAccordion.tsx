"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Info } from "lucide-react";
import { AdminScorePlayerRow, type StatFormValues } from "@/components/AdminScorePlayerRow";
import { AdminScoreTeamLogo } from "@/components/admin/AdminScoreTeamLogo";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  getIplRoleIconUrl,
  IPL_ROLE_ICON_SVG,
  IPL_ROLE_LABELS,
  type KnownPlayerRole,
} from "@/lib/iplRoleIcons";
import { statFormToPlayerMatchStats } from "@/lib/adminScoreToUpdatedStats";
import { getUpdatedScoreBreakdownLines } from "@/lib/adminUpdatedScoreBreakdown";
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
}: AdminScorePlayerAccordionProps) => {
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const roleIconSrc = getIplRoleIconUrl(role) ?? IPL_ROLE_ICON_SVG.bat;

  const breakdown = useMemo(
    () => calculateFantasyPoints(statFormToPlayerMatchStats(value, participated, matchId)),
    [value, participated, matchId]
  );

  const displayPoints = Number.isFinite(breakdown.finalScore) ? breakdown.finalScore : 0;
  const lineItems = useMemo(() => getUpdatedScoreBreakdownLines(breakdown), [breakdown]);
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
            "flex cursor-pointer list-none items-center gap-3 px-4 py-3.5 sm:px-5",
            "[&::-webkit-details-marker]:hidden"
          )}
        >
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
          <div className="flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2.5">
            <input
              id={`participated-${value.playerId}`}
              type="checkbox"
              className="size-4 shrink-0 rounded border-white/25 accent-emerald-400"
              checked={participated}
              onChange={(e) => onParticipationChange(e.target.checked)}
            />
            <Label
              htmlFor={`participated-${value.playerId}`}
              className="cursor-pointer text-sm font-medium leading-none text-white"
            >
              Played in XI (+{FANTASY_SCORING_POINT_VALUES.XI_PARTICIPATION} pts)
            </Label>
          </div>
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
              Check &quot;Played in XI&quot; to enter batting, bowling, and fielding stats.
            </p>
          )}
        </div>
      </details>

      <Dialog open={breakdownOpen} onOpenChange={setBreakdownOpen}>
        <DialogContent
          showCloseButton
          className="fixed top-0 right-0 left-auto flex h-full max-h-[100dvh] max-w-md translate-x-0 translate-y-0 flex-col gap-0 overflow-y-auto rounded-none rounded-l-xl border-l p-0 sm:max-w-md"
        >
          <DialogHeader className="border-b bg-muted/30 px-4 py-4 text-left">
            <DialogTitle className="text-lg">Points breakdown</DialogTitle>
            <DialogDescription className="text-left">{name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 px-4 py-4 text-sm">
            <p className="text-xs leading-relaxed text-muted-foreground">
              Per current fantasy rules (same engine as competitions). Captain, vice-captain, and playoff multipliers
              apply on entries only.
            </p>
            {lineItems.length === 0 ? (
              <p className="text-muted-foreground">No line items (only base total).</p>
            ) : (
              <ul className="space-y-2">
                {lineItems.map((row) => (
                  <li key={row.label} className="flex justify-between gap-4 tabular-nums">
                    <span className="text-foreground/90">{row.label}</span>
                    <span className="font-medium text-foreground">+{row.points}</span>
                  </li>
                ))}
              </ul>
            )}
            <Separator />
            <div className="flex justify-between gap-4 tabular-nums text-muted-foreground">
              <span>Raw total</span>
              <span className="font-medium text-foreground">{Number.isFinite(breakdown.rawTotal) ? breakdown.rawTotal : 0}</span>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/40 px-3 py-2 font-semibold tabular-nums">
              <span>Final score</span>
              <span>{displayPoints}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
