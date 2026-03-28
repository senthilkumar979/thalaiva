import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FantasyLineRows({ rows }: { rows: { label: string; points: number }[] }) {
  return (
    <ul className="mt-3 space-y-1.5 text-sm">
      {rows.map((r) => (
        <li key={r.label} className="flex justify-between gap-4 tabular-nums">
          <span className="text-white/85">{r.label}</span>
          <span className={cn("font-medium", r.points < 0 ? "text-rose-300" : "text-emerald-200")}>
            {r.points > 0 ? "+" : ""}
            {r.points}
          </span>
        </li>
      ))}
    </ul>
  );
}

const fantasyAccent = {
  amber: "border-amber-400/25 bg-white/[0.04] ring-amber-400/10",
  sky: "border-sky-400/25 bg-white/[0.04] ring-sky-400/10",
  emerald: "border-emerald-400/25 bg-white/[0.04] ring-emerald-400/10",
  violet: "border-violet-400/25 bg-white/[0.04] ring-violet-400/10",
} as const;

export function FantasySectionCard({
  title,
  rows,
  accent,
}: {
  title: string;
  rows: { label: string; points: number }[];
  accent: keyof typeof fantasyAccent;
}) {
  return (
    <section className={cn("rounded-xl border p-4 ring-1", fantasyAccent[accent])}>
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-white/45">No fantasy points in this section.</p>
      ) : (
        <FantasyLineRows rows={rows} />
      )}
    </section>
  );
}

export function RawBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4 ring-1 ring-white/5">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function RawDl({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
      {items.map(({ label, value }) => (
        <div key={label} className="contents">
          <dt className="text-white/50">{label}</dt>
          <dd className="tabular-nums text-white">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
