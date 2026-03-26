"use client";

import type { FantasyPointsBreakdown } from "@/lib/scoring";

interface PointsBreakdownProps {
  items: FantasyPointsBreakdown[];
}

export const PointsBreakdown = ({ items }: PointsBreakdownProps) => (
  <ul className="space-y-1 text-sm">
    {items.map((x) => (
      <li key={x.label} className="flex justify-between gap-4 border-b border-dashed py-1 last:border-0">
        <span>{x.label}</span>
        <span className="tabular-nums font-medium">{x.points > 0 ? `+${x.points}` : x.points}</span>
      </li>
    ))}
  </ul>
);
