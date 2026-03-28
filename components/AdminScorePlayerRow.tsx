"use client";

import { StatInput, StatPanel } from "@/components/admin/AdminScoreStatPrimitives";
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
}

export const AdminScorePlayerRow = ({
  name,
  franchise,
  value,
  onChange,
  showHeader = true,
}: AdminScorePlayerRowProps) => {
  const b = value.Batting;
  const bw = value.Bowling;
  const f = value.Fielding;
  const pid = value.playerId;

  return (
    <div
      className={cn(
        "grid gap-4",
        showHeader ? "rounded-lg border border-border/60 p-3 md:grid-cols-4 md:gap-3" : "md:grid-cols-3"
      )}
    >
      {showHeader ? (
        <div className="min-w-0">
          <div className="font-medium leading-snug">{name}</div>
          <div className="text-xs text-muted-foreground">{franchise}</div>
        </div>
      ) : null}

      <StatPanel title="Batting">
        <div className="grid grid-cols-2 gap-2">
          <StatInput
            id={`${pid}-runs`}
            label="Runs"
            hint={`+${P.PER_RUN}/run`}
            value={b.runs}
            onChange={(n) => onChange({ ...value, Batting: { ...b, runs: n } })}
          />
          <StatInput
            id={`${pid}-balls`}
            label="Balls faced"
            hint="SR & milestones"
            value={b.ballsFaced}
            onChange={(n) => onChange({ ...value, Batting: { ...b, ballsFaced: n } })}
          />
          <StatInput
            id={`${pid}-fours`}
            label="Fours"
            hint={`+${P.PER_FOUR}/4`}
            value={b.fours}
            onChange={(n) => onChange({ ...value, Batting: { ...b, fours: n } })}
          />
          <StatInput
            id={`${pid}-sixes`}
            label="Sixes"
            hint={`+${P.PER_SIX}/6`}
            value={b.sixes}
            onChange={(n) => onChange({ ...value, Batting: { ...b, sixes: n } })}
          />
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-md border border-border/40 bg-background/80 px-2 py-1.5 text-xs">
          <input
            type="checkbox"
            className="size-3.5 rounded border-input accent-primary"
            checked={b.isOut}
            onChange={(e) => onChange({ ...value, Batting: { ...b, isOut: e.target.checked } })}
          />
          <span className="font-medium">Dismissed</span>
          <span className="text-muted-foreground">(unchecked = not out)</span>
        </label>
      </StatPanel>

      <StatPanel
        title="Bowling"
        note="Economy and wicket-haul bonuses use these figures. Check hat-trick only when it applies."
      >
        <div className="grid grid-cols-2 gap-2">
          <StatInput
            id={`${pid}-overs`}
            label="Overs"
            hint={`+${P.PER_OVER}/full over`}
            value={bw.oversBowled}
            onChange={(n) => onChange({ ...value, Bowling: { ...bw, oversBowled: n } })}
            decimals
          />
          <StatInput
            id={`${pid}-wkts`}
            label="Wickets"
            hint={`+${P.PER_WICKET}/wk`}
            value={bw.wickets}
            onChange={(n) => onChange({ ...value, Bowling: { ...bw, wickets: n } })}
          />
          <StatInput
            id={`${pid}-dots`}
            label="Dot balls"
            hint={`+${P.PER_DOT_BALL}/dot`}
            value={bw.dotBalls}
            onChange={(n) => onChange({ ...value, Bowling: { ...bw, dotBalls: n } })}
          />
          <StatInput
            id={`${pid}-maidens`}
            label="Maidens"
            hint={`+${P.PER_MAIDEN}/mdn`}
            value={bw.maidenOvers}
            onChange={(n) => onChange({ ...value, Bowling: { ...bw, maidenOvers: n } })}
          />
          <StatInput
            id={`${pid}-conc`}
            label="Runs conceded"
            hint="economy"
            value={bw.runsConceded}
            onChange={(n) => onChange({ ...value, Bowling: { ...bw, runsConceded: n } })}
          />
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-md border border-border/40 bg-background/80 px-2 py-1.5 text-xs">
          <input
            type="checkbox"
            className="size-3.5 rounded border-input accent-primary"
            checked={bw.hasHattrick}
            onChange={(e) => onChange({ ...value, Bowling: { ...bw, hasHattrick: e.target.checked } })}
          />
          <span className="font-medium">Hat-trick</span>
          <span className="text-muted-foreground">(admin-flagged · +{P.HATTRICK_BONUS} pts)</span>
        </label>
      </StatPanel>

      <StatPanel title="Fielding">
        <div className="grid grid-cols-2 gap-2">
          <StatInput
            id={`${pid}-ct`}
            label="Catches"
            hint={`+${P.PER_CATCH}/ct`}
            value={f.catches}
            onChange={(n) => onChange({ ...value, Fielding: { ...f, catches: n } })}
          />
          <StatInput
            id={`${pid}-st`}
            label="Stumpings"
            hint={`+${P.PER_STUMPING}/st`}
            value={f.stumpings}
            onChange={(n) => onChange({ ...value, Fielding: { ...f, stumpings: n } })}
          />
          <StatInput
            id={`${pid}-ro`}
            label="Direct run-outs"
            hint={`+${P.PER_DIRECT_RUNOUT}/RO`}
            value={f.runOuts}
            onChange={(n) => onChange({ ...value, Fielding: { ...f, runOuts: n } })}
          />
          <StatInput
            id={`${pid}-aro`}
            label="Assisted run-outs"
            hint={`+${P.PER_ASSISTED_RUNOUT}/assist`}
            value={f.assistedRunOuts}
            onChange={(n) => onChange({ ...value, Fielding: { ...f, assistedRunOuts: n } })}
          />
        </div>
      </StatPanel>
    </div>
  );
};
