"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  };
  Fielding: {
    catches: number;
    stumpings: number;
    runOuts: number;
  };
}

interface AdminScorePlayerRowProps {
  name: string;
  franchise: string;
  value: StatFormValues;
  onChange: (next: StatFormValues) => void;
  /** When false, only stat columns render (e.g. inside an accordion body). */
  showHeader?: boolean;
}

const n = (v: string) => (v === "" ? 0 : Number(v));

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
  return (
    <div
      className={
        showHeader
          ? "grid gap-3 rounded-md border p-3 md:grid-cols-4"
          : "grid gap-3 md:grid-cols-3"
      }
    >
      {showHeader ? (
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-xs text-muted-foreground">{franchise}</div>
        </div>
      ) : null}
      <div className="space-y-2">
        <Label className="text-xs">Batting</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Runs"
            value={b.runs || ""}
            onChange={(e) => onChange({ ...value, Batting: { ...b, runs: n(e.target.value) } })}
          />
          <Input
            placeholder="Balls"
            value={b.ballsFaced || ""}
            onChange={(e) => onChange({ ...value, Batting: { ...b, ballsFaced: n(e.target.value) } })}
          />
          <Input
            placeholder="4s"
            value={b.fours || ""}
            onChange={(e) => onChange({ ...value, Batting: { ...b, fours: n(e.target.value) } })}
          />
          <Input
            placeholder="6s"
            value={b.sixes || ""}
            onChange={(e) => onChange({ ...value, Batting: { ...b, sixes: n(e.target.value) } })}
          />
        </div>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={b.isOut}
            onChange={(e) => onChange({ ...value, Batting: { ...b, isOut: e.target.checked } })}
          />
          Out
        </label>
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Bowling</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Wkts"
            value={bw.wickets || ""}
            onChange={(e) => onChange({ ...value, Bowling: { ...bw, wickets: n(e.target.value) } })}
          />
          <Input
            placeholder="Overs"
            value={bw.oversBowled || ""}
            onChange={(e) => onChange({ ...value, Bowling: { ...bw, oversBowled: n(e.target.value) } })}
          />
          <Input
            placeholder="Maidens"
            value={bw.maidenOvers || ""}
            onChange={(e) => onChange({ ...value, Bowling: { ...bw, maidenOvers: n(e.target.value) } })}
          />
          <Input
            placeholder="Runs conc"
            value={bw.runsConceded || ""}
            onChange={(e) => onChange({ ...value, Bowling: { ...bw, runsConceded: n(e.target.value) } })}
          />
          <Input
            placeholder="Dots"
            value={bw.dotBalls || ""}
            onChange={(e) => onChange({ ...value, Bowling: { ...bw, dotBalls: n(e.target.value) } })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Fielding</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Catches"
            value={f.catches || ""}
            onChange={(e) => onChange({ ...value, Fielding: { ...f, catches: n(e.target.value) } })}
          />
          <Input
            placeholder="Stumpings"
            value={f.stumpings || ""}
            onChange={(e) => onChange({ ...value, Fielding: { ...f, stumpings: n(e.target.value) } })}
          />
          <Input
            placeholder="Run-outs"
            value={f.runOuts || ""}
            onChange={(e) => onChange({ ...value, Fielding: { ...f, runOuts: n(e.target.value) } })}
          />
        </div>
      </div>
    </div>
  );
};
