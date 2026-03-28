import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type StatSurface = "default" | "shell";

export function parseNum(v: string): number {
  if (v === "") return 0;
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

export function StatInput({
  id,
  label,
  hint,
  value,
  onChange,
  decimals,
  surface = "default",
}: {
  id: string;
  label: string;
  hint: string;
  value: number;
  onChange: (n: number) => void;
  decimals?: boolean;
  surface?: StatSurface;
}) {
  const shell = surface === "shell";
  return (
    <div className="space-y-1">
      <Label
        htmlFor={id}
        className={cn(
          "text-xs font-medium leading-tight",
          shell ? "text-white/85" : "text-foreground"
        )}
      >
        {label}
        <span className={cn("ml-1 font-normal", shell ? "text-white/45" : "text-muted-foreground")}>
          {hint}
        </span>
      </Label>
      <Input
        id={id}
        inputMode={decimals ? "decimal" : "numeric"}
        className={cn(
          "h-9",
          shell &&
            "border-white/15 bg-white/5 text-white placeholder:text-white/35 focus-visible:border-emerald-400/40 focus-visible:ring-emerald-400/20"
        )}
        value={value === 0 ? "" : value}
        onChange={(e) => onChange(parseNum(e.target.value))}
      />
    </div>
  );
}

export function StatPanel({
  title,
  note,
  children,
  surface = "default",
}: {
  title: string;
  note?: string;
  children: ReactNode;
  surface?: StatSurface;
}) {
  const shell = surface === "shell";
  return (
    <div
      className={cn(
        "space-y-3 rounded-lg border p-3",
        shell ? "border-white/12 bg-white/[0.04]" : "border-border/50 bg-muted/20"
      )}
    >
      <h3
        className={cn(
          "border-b pb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em]",
          shell ? "border-white/10 text-white/65" : "border-border/60 text-muted-foreground"
        )}
      >
        {title}
      </h3>
      {note ? (
        <p
          className={cn("text-[11px] leading-snug", shell ? "text-white/50" : "text-muted-foreground")}
        >
          {note}
        </p>
      ) : null}
      {children}
    </div>
  );
}
