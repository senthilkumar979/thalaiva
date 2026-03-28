"use client";

import type { IBattingStats, IBowlingStats, IFieldingStats } from "@/models/PlayerMatchScore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  getPlayerMatchFantasyPointsBreakdown,
  groupBreakdownBySection,
} from "@/lib/scoring";

interface PlayerMatchScoreDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playerName: string;
  matchTitle: string;
  Batting: IBattingStats;
  Bowling: IBowlingStats;
  Fielding: IFieldingStats;
  participated: boolean;
}

function BreakdownList({
  title,
  rows,
  className,
}: {
  title: string;
  rows: { label: string; points: number }[];
  className?: string;
}) {
  const sum = rows.reduce((s, r) => s + r.points, 0);
  if (rows.length === 0 && sum === 0) return null;
  return (
    <div className={cn("space-y-1.5", className)}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No fantasy points in this section.</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {rows.map((r) => (
            <li key={r.label} className="flex justify-between gap-4 tabular-nums">
              <span className="text-foreground/90">{r.label}</span>
              <span className={r.points < 0 ? "text-destructive" : "text-foreground"}>{r.points > 0 ? "+" : ""}{r.points}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export const PlayerMatchScoreDetailDrawer = ({
  open,
  onOpenChange,
  playerName,
  matchTitle,
  Batting,
  Bowling,
  Fielding,
  participated,
}: PlayerMatchScoreDetailDrawerProps) => {
  const { total, breakdown } = getPlayerMatchFantasyPointsBreakdown(
    { Batting, Bowling, Fielding },
    participated
  );
  const grouped = groupBreakdownBySection(breakdown);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="fixed top-0 right-0 left-auto flex h-full max-h-[100dvh] max-w-md translate-x-0 translate-y-0 flex-col gap-0 overflow-y-auto rounded-none rounded-l-xl border-l p-0 sm:max-w-md"
      >
        <DialogHeader className="border-b bg-muted/30 px-4 py-4 text-left">
          <DialogTitle className="text-lg">{playerName}</DialogTitle>
          <p className="text-sm font-normal text-muted-foreground">{matchTitle}</p>
        </DialogHeader>

        <div className="space-y-6 px-4 py-4 text-sm">
          <section className="space-y-2">
            <h3 className="font-semibold text-foreground">Batting — raw</h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
              <dt>Runs</dt>
              <dd className="tabular-nums text-foreground">{Batting.runs}</dd>
              <dt>Balls</dt>
              <dd className="tabular-nums text-foreground">{Batting.ballsFaced}</dd>
              <dt>4s / 6s</dt>
              <dd className="tabular-nums text-foreground">
                {Batting.fours} / {Batting.sixes}
              </dd>
              <dt>Out</dt>
              <dd className="tabular-nums text-foreground">{Batting.isOut ? "Yes" : "No"}</dd>
            </dl>
            <BreakdownList title="Batting — fantasy" rows={grouped.batting} />
          </section>

          <Separator />

          <section className="space-y-2">
            <h3 className="font-semibold text-foreground">Bowling — raw</h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
              <dt>Wickets</dt>
              <dd className="tabular-nums text-foreground">{Bowling.wickets}</dd>
              <dt>Overs</dt>
              <dd className="tabular-nums text-foreground">{Bowling.oversBowled}</dd>
              <dt>Runs conc.</dt>
              <dd className="tabular-nums text-foreground">{Bowling.runsConceded}</dd>
              <dt>Maidens / Dots</dt>
              <dd className="tabular-nums text-foreground">
                {Bowling.maidenOvers} / {Bowling.dotBalls}
              </dd>
            </dl>
            <BreakdownList title="Bowling — fantasy" rows={grouped.bowling} />
          </section>

          <Separator />

          <section className="space-y-2">
            <h3 className="font-semibold text-foreground">Fielding — raw</h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
              <dt>Catches</dt>
              <dd className="tabular-nums text-foreground">{Fielding.catches}</dd>
              <dt>Stumpings</dt>
              <dd className="tabular-nums text-foreground">{Fielding.stumpings}</dd>
              <dt>Run-outs</dt>
              <dd className="tabular-nums text-foreground">{Fielding.runOuts}</dd>
            </dl>
            <BreakdownList title="Fielding — fantasy" rows={grouped.fielding} />
          </section>

          {grouped.participation.length > 0 && (
            <>
              <Separator />
              <BreakdownList title="Bonus" rows={grouped.participation} />
            </>
          )}

          <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2 font-semibold tabular-nums">
            <span>Total fantasy</span>
            <span>{total}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
