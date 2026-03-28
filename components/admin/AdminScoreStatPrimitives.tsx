import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
}: {
  id: string;
  label: string;
  hint: string;
  value: number;
  onChange: (n: number) => void;
  decimals?: boolean;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs font-medium leading-tight text-foreground">
        {label}
        <span className="ml-1 font-normal text-muted-foreground">{hint}</span>
      </Label>
      <Input
        id={id}
        inputMode={decimals ? "decimal" : "numeric"}
        className="h-9"
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
}: {
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-border/50 bg-muted/20 p-3">
      <h3 className="border-b border-border/60 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </h3>
      {note ? <p className="text-[11px] leading-snug text-muted-foreground">{note}</p> : null}
      {children}
    </div>
  );
}
