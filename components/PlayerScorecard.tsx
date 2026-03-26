"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cricketOversToDecimal } from "@/lib/scoring";
import type { IBattingStats, IBowlingStats, IFieldingStats } from "@/models/PlayerMatchScore";

interface PlayerScorecardProps {
  name: string;
  franchiseLabel: string;
  batting: IBattingStats;
  bowling: IBowlingStats;
  fielding: IFieldingStats;
}

export const PlayerScorecard = ({ name, franchiseLabel, batting, bowling, fielding }: PlayerScorecardProps) => {
  const overs = cricketOversToDecimal(bowling.oversBowled);
  const economy = overs > 0 ? (bowling.runsConceded / overs).toFixed(2) : "—";
  const sr = batting.ballsFaced > 0 ? ((batting.runs / batting.ballsFaced) * 100).toFixed(2) : "—";
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {name}{" "}
          <span className="text-sm font-normal text-muted-foreground">({franchiseLabel})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <div className="space-y-1 text-sm">
          <div className="font-medium">Batting</div>
          <div>Runs: {batting.runs}</div>
          <div>Balls: {batting.ballsFaced}</div>
          <div>4s / 6s: {batting.fours} / {batting.sixes}</div>
          <div>SR: {sr}</div>
          <div>Out: {batting.isOut ? "Yes" : "No"}</div>
        </div>
        <div className="space-y-1 text-sm">
          <div className="font-medium">Bowling</div>
          <div>Overs: {bowling.oversBowled}</div>
          <div>Wickets: {bowling.wickets}</div>
          <div>Runs: {bowling.runsConceded}</div>
          <div>Economy: {economy}</div>
          <div>Maidens / Dots: {bowling.maidenOvers} / {bowling.dotBalls}</div>
        </div>
        <div className="space-y-1 text-sm">
          <div className="font-medium">Fielding</div>
          <div>Catches: {fielding.catches}</div>
          <div>Stumpings: {fielding.stumpings}</div>
          <div>Run-outs: {fielding.runOuts}</div>
        </div>
      </CardContent>
    </Card>
  );
};
