"use client";

import {
  StatInput,
  StatPanel,
  type StatSurface,
} from "@/components/admin/AdminScoreStatPrimitives";
import { FANTASY_SCORING_POINT_VALUES as P } from "@/lib/updatedScoring";
import { cn } from "@/lib/utils";

export interface StatFormValues {
  playerId: string;
  Batting: {
    runs: number;
    ballsFaced: number;
    fours: number;
    sixes: number;
    isOut: boolean;
  };
  Bowling: {
    wickets: number;
    oversBowled: number;
    maidenOvers: number;
    runsConceded: number;
    dotBalls: number;
    hasHattrick: boolean;
  };
  Fielding: {
    catches: number;
    stumpings: number;
    runOuts: number;
    assistedRunOuts: number;
  };
}

interface AdminScorePlayerRowProps {
  name: string;
  franchise: string;
  value: StatFormValues;
  onChange: (next: StatFormValues) => void;
  showHeader?: boolean;
  /** Glass panels on admin IPL score shell */
  surface?: StatSurface;
}

export const AdminScorePlayerRow = ({
  name,
  franchise,
  value,
  onChange,
  showHeader = true,
  surface = "default",
}: AdminScorePlayerRowProps) => {
  const b = value.Batting;
  const bw = value.Bowling;
  const f = value.Fielding;
  const pid = value.playerId;
  const shell = surface === "shell";
  const chkRow = cn(
    "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs",
    shell
      ? "border border-white/12 bg-white/[0.04] text-white"
      : "border border-border/40 bg-background/80"
  );
  const chkMuted = shell ? "text-white/50" : "text-muted-foreground";

  return (
    <div
      className={cn(
        "grid gap-4",
        showHeader
          ? cn(
              "rounded-lg border p-3 md:grid-cols-4 md:gap-3",
              shell ? "border-white/12 bg-white/[0.03]" : "border-border/60"
            )
          : "md:grid-cols-3"
      )}
    >
      {showHeader ? (
        <div className="min-w-0">
          <div className={cn("font-medium leading-snug", shell && "text-white")}>{name}</div>
          <div className={cn("text-xs", shell ? "text-white/55" : "text-muted-foreground")}>
            {franchise}
          </div>
        </div>
      ) : null}

      <StatPanel title="Batting" surface={surface}>
        <div className="grid grid-cols-2 gap-2">
          <StatInput
            id={`${pid}-runs`}
            label="Runs"
            hint={`+${P.PER_RUN}/run`}
            value={b.runs}
            surface={surface}
            onChange={(n) => onChange({ ...value, Batting: { ...b, runs: n } })}
          />
          <StatInput
            id={`${pid}-balls`}
            label="Balls faced"
            hint="SR & milestones"
            value={b.ballsFaced}
            surface={surface}
            onChange={(n) => onChange({ ...value, Batting: { ...b, ballsFaced: n } })}
          />
          <StatInput
            id={`${pid}-fours`}
            label="Fours"
            hint={`+${P.PER_FOUR}/4`}
            value={b.fours}
            surface={surface}
            onChange={(n) => onChange({ ...value, Batting: { ...b, fours: n } })}
          />
          <StatInput
            id={`${pid}-sixes`}
            label="Sixes"
            hint={`+${P.PER_SIX}/6`}
            value={b.sixes}
            surface={surface}
            onChange={(n) => onChange({ ...value, Batting: { ...b, sixes: n } })}
          />
        </div>
        <label className={chkRow}>
          <input
            type="checkbox"
            className={cn(
              "size-3.5 rounded accent-emerald-500",
              shell ? "border-white/25" : "border-input"
            )}
            checked={b.isOut}
            onChange={(e) => onChange({ ...value, Batting: { ...b, isOut: e.target.checked } })}
          />
          <span className="font-medium">Dismissed</span>
          <span className={chkMuted}>(unchecked = not out)</span>
        </label>
      </StatPanel>

      <StatPanel
        title="Bowling"
        surface={surface}
        note="Economy and wicket-haul bonuses use these figures. Check hat-trick only when it applies."
      >
        <div className="grid grid-cols-2 gap-2">
          <StatInput
            id={`${pid}-overs`}
            label="Overs"
            hint={`+${P.PER_OVER}/full over`}
            value={bw.oversBowled}
            surface={surface}
            onChange={(n) => onChange({ ...value, Bowling: { ...bw, oversBowled: n } })}
            decimals
          />
          <StatInput
            id={`${pid}-wkts`}
            label="Wickets"
            hint={`+${P.PER_WICKET}/wk`}
            value={bw.wickets}
            surface={surface}
            onChange={(n) => onChange({ ...value, Bowling: { ...bw, wickets: n } })}
          />
          <StatInput
            id={`${pid}-dots`}
            label="Dot balls"
            hint={`+${P.PER_DOT_BALL}/dot`}
            value={bw.dotBalls}
            surface={surface}
            onChange={(n) => onChange({ ...value, Bowling: { ...bw, dotBalls: n } })}
          />
          <StatInput
            id={`${pid}-maidens`}
            label="Maidens"
            hint={`+${P.PER_MAIDEN}/mdn`}
            value={bw.maidenOvers}
            surface={surface}
            onChange={(n) => onChange({ ...value, Bowling: { ...bw, maidenOvers: n } })}
          />
          <StatInput
            id={`${pid}-conc`}
            label="Runs conceded"
            hint="economy"
            value={bw.runsConceded}
            surface={surface}
            onChange={(n) => onChange({ ...value, Bowling: { ...bw, runsConceded: n } })}
          />
        </div>
        <label className={chkRow}>
          <input
            type="checkbox"
            className={cn(
              "size-3.5 rounded accent-emerald-500",
              shell ? "border-white/25" : "border-input"
            )}
            checked={bw.hasHattrick}
            onChange={(e) => onChange({ ...value, Bowling: { ...bw, hasHattrick: e.target.checked } })}
          />
          <span className="font-medium">Hat-trick</span>
          <span className={chkMuted}>(admin-flagged · +{P.HATTRICK_BONUS} pts)</span>
        </label>
      </StatPanel>

      <StatPanel title="Fielding" surface={surface}>
        <div className="grid grid-cols-2 gap-2">
          <StatInput
            id={`${pid}-ct`}
            label="Catches"
            hint={`+${P.PER_CATCH}/ct`}
            value={f.catches}
            surface={surface}
            onChange={(n) => onChange({ ...value, Fielding: { ...f, catches: n } })}
          />
          <StatInput
            id={`${pid}-st`}
            label="Stumpings"
            hint={`+${P.PER_STUMPING}/st`}
            value={f.stumpings}
            surface={surface}
            onChange={(n) => onChange({ ...value, Fielding: { ...f, stumpings: n } })}
          />
          <StatInput
            id={`${pid}-ro`}
            label="Direct run-outs"
            hint={`+${P.PER_DIRECT_RUNOUT}/RO`}
            value={f.runOuts}
            surface={surface}
            onChange={(n) => onChange({ ...value, Fielding: { ...f, runOuts: n } })}
          />
          <StatInput
            id={`${pid}-aro`}
            label="Assisted run-outs"
            hint={`+${P.PER_ASSISTED_RUNOUT}/assist`}
            value={f.assistedRunOuts}
            surface={surface}
            onChange={(n) => onChange({ ...value, Fielding: { ...f, assistedRunOuts: n } })}
          />
        </div>
      </StatPanel>
    </div>
  );
};
