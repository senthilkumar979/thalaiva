import type { ReactNode } from "react";

export function TeamSelectionSectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-white/15 bg-white p-4 text-slate-900 shadow-xl sm:p-6">
      <h2 className="mb-3 border-b border-slate-200 pb-2 text-base font-semibold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}

export function TeamSelectionP({ children }: { children: ReactNode }) {
  return <p className="mb-3 text-sm leading-relaxed text-slate-600 last:mb-0">{children}</p>;
}

export function TeamSelectionUl({ children }: { children: ReactNode }) {
  return (
    <ul className="mb-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600 last:mb-0">{children}</ul>
  );
}

export function TeamSelectionLi({ children }: { children: ReactNode }) {
  return <li>{children}</li>;
}
