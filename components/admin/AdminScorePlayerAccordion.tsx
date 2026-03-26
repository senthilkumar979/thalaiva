"use client";

import { ChevronDown } from "lucide-react";
import { AdminScorePlayerRow, type StatFormValues } from "@/components/AdminScorePlayerRow";
import { AdminScoreTeamLogo } from "@/components/admin/AdminScoreTeamLogo";
import { Label } from "@/components/ui/label";
import {
  getIplRoleIconUrl,
  IPL_ROLE_ICON_SVG,
  IPL_ROLE_LABELS,
  type KnownPlayerRole,
} from "@/lib/iplRoleIcons";
import { MATCH_PARTICIPATION_POINTS } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import type { PlayerRole } from "@/models/Player";

interface AdminScorePlayerAccordionProps {
  name: string;
  franchiseLabel: string;
  franchiseLogoUrl?: string;
  franchiseShortCode: string;
  role: PlayerRole;
  points: number;
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
  name,
  franchiseLabel,
  franchiseLogoUrl,
  franchiseShortCode,
  role,
  points,
  participated,
  onParticipationChange,
  value,
  onChange,
}: AdminScorePlayerAccordionProps) => {
  const roleIconSrc = getIplRoleIconUrl(role) ?? IPL_ROLE_ICON_SVG.bat;
  return (
    <details className="group rounded-xl border border-border/80 bg-card shadow-sm">
      <summary
        className={cn(
          "flex cursor-pointer list-none items-center gap-3 px-4 py-3",
          "[&::-webkit-details-marker]:hidden"
        )}
      >
        <AdminScoreTeamLogo logoUrl={franchiseLogoUrl} shortCode={franchiseShortCode} size="sm" />
        <div className="min-w-0 flex-1 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{name}</span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- IPL SVG from iplt20.com */}
              <img src={roleIconSrc} alt="" className="size-4 shrink-0 object-contain" />
              {iplRoleLabel(role)}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">{franchiseLabel}</div>
        </div>
        <span
          className={cn(
            "shrink-0 tabular-nums text-lg font-semibold",
            participated ? "text-primary" : "text-muted-foreground"
          )}
        >
          {points}
          <span className="ml-1 text-sm font-medium text-muted-foreground">pts</span>
        </span>
        <ChevronDown
          className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="space-y-4 border-t border-border/60 bg-muted/10 p-3">
        <div className="flex items-center gap-3 rounded-lg border border-primary/15 bg-primary/5 px-3 py-2">
          <input
            id={`participated-${value.playerId}`}
            type="checkbox"
            className="size-4 shrink-0 rounded border-input accent-primary"
            checked={participated}
            onChange={(e) => onParticipationChange(e.target.checked)}
          />
          <Label htmlFor={`participated-${value.playerId}`} className="cursor-pointer text-sm font-medium leading-none">
            Played in this match (+{MATCH_PARTICIPATION_POINTS} participation)
          </Label>
        </div>
        <AdminScorePlayerRow
          name={name}
          franchise={franchiseLabel}
          value={value}
          onChange={onChange}
          showHeader={false}
        />
      </div>
    </details>
  );
};
