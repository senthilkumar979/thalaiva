"use client";

import { ChevronDown } from "lucide-react";
import { AdminScorePlayerRow, type StatFormValues } from "@/components/AdminScorePlayerRow";
import { cn } from "@/lib/utils";

interface AdminScorePlayerAccordionProps {
  name: string;
  franchiseLabel: string;
  points: number;
  value: StatFormValues;
  onChange: (next: StatFormValues) => void;
}

export const AdminScorePlayerAccordion = ({
  name,
  franchiseLabel,
  points,
  value,
  onChange,
}: AdminScorePlayerAccordionProps) => (
  <details className="group rounded-xl border border-border/80 bg-card shadow-sm">
    <summary
      className={cn(
        "flex cursor-pointer list-none items-center gap-3 px-4 py-3",
        "[&::-webkit-details-marker]:hidden"
      )}
    >
      <div className="min-w-0 flex-1 text-left">
        <div className="font-medium">{name}</div>
        <div className="text-xs text-muted-foreground">{franchiseLabel}</div>
      </div>
      <span className="shrink-0 tabular-nums text-lg font-semibold text-emerald-600 dark:text-emerald-400">
        {points}
        <span className="ml-1 text-sm font-medium text-muted-foreground">pts</span>
      </span>
      <ChevronDown
        className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
        aria-hidden
      />
    </summary>
    <div className="border-t border-border/60 bg-muted/10 p-3">
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
