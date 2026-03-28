import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type AdminPageAccent = "emerald" | "violet" | "amber" | "slate";

/** Light theme (legacy cards on gray bg) */
const ACCENT_LIGHT: Record<
  AdminPageAccent,
  { gradient: string; blur: string; iconBox: string; iconText: string }
> = {
  emerald: {
    gradient:
      "from-slate-950/[0.03] via-transparent to-emerald-950/[0.06] dark:from-slate-950/40 dark:to-emerald-950/20",
    blur: "bg-emerald-500/20 dark:bg-emerald-500/10",
    iconBox: "border-emerald-500/25 bg-emerald-500/10",
    iconText: "text-emerald-700 dark:text-emerald-400/90",
  },
  violet: {
    gradient:
      "from-slate-950/[0.03] via-transparent to-violet-950/[0.06] dark:from-slate-950/40 dark:to-violet-950/20",
    blur: "bg-violet-500/20 dark:bg-violet-500/10",
    iconBox: "border-violet-500/25 bg-violet-500/10",
    iconText: "text-violet-700 dark:text-violet-400/90",
  },
  amber: {
    gradient:
      "from-slate-950/[0.03] via-transparent to-amber-950/[0.06] dark:from-slate-950/40 dark:to-amber-950/20",
    blur: "bg-amber-500/20 dark:bg-amber-500/10",
    iconBox: "border-amber-500/25 bg-amber-500/10",
    iconText: "text-amber-800 dark:text-amber-400/90",
  },
  slate: {
    gradient: "from-slate-950/[0.04] via-transparent to-slate-950/[0.06] dark:from-slate-950/50 dark:to-slate-900/30",
    blur: "bg-slate-500/15 dark:bg-slate-500/10",
    iconBox: "border-border bg-muted/50",
    iconText: "text-foreground/80",
  },
};

/** Dark / IPL glass — aligned with `CompetitionDetailHero` */
const ACCENT_DARK: Record<
  AdminPageAccent,
  { accentBlur: string; iconBox: string; iconText: string }
> = {
  emerald: {
    accentBlur: "bg-emerald-400/15",
    iconBox: "border-emerald-400/30 bg-emerald-500/15",
    iconText: "text-emerald-200",
  },
  violet: {
    accentBlur: "bg-violet-400/12",
    iconBox: "border-violet-400/30 bg-violet-500/15",
    iconText: "text-violet-200",
  },
  amber: {
    accentBlur: "bg-amber-400/12",
    iconBox: "border-amber-400/30 bg-amber-500/15",
    iconText: "text-amber-200",
  },
  slate: {
    accentBlur: "bg-white/5",
    iconBox: "border-white/15 bg-white/5",
    iconText: "text-white",
  },
};

interface AdminPageHeaderProps {
  accent?: AdminPageAccent;
  /** `dark` matches competition detail IPL shell + `CompetitionDetailHero` glass card */
  variant?: "light" | "dark";
  segment: string;
  title: string;
  description: string;
  icon: LucideIcon;
  actions?: ReactNode;
  footer?: ReactNode;
}

export const AdminPageHeader = ({
  accent = "slate",
  variant = "dark",
  segment,
  title,
  description,
  icon: Icon,
  actions,
  footer,
}: AdminPageHeaderProps) => {
  if (variant === "light") {
    const a = ACCENT_LIGHT[accent];
    return (
      <header
        className={cn(
          "relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br px-6 py-8 sm:px-8 sm:py-10",
          a.gradient
        )}
      >
        <div
          className={cn(
            "pointer-events-none absolute -right-12 top-0 h-40 w-40 rounded-full blur-3xl",
            a.blur
          )}
          aria-hidden
        />
        <div className="relative space-y-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex min-w-0 gap-4">
              <span
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-2xl border shadow-inner",
                  a.iconBox
                )}
              >
                <Icon className={cn("size-5", a.iconText)} aria-hidden />
              </span>
              <div className="min-w-0 space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  {segment}
                </p>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
                <p className="max-w-2xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
                  {description}
                </p>
              </div>
            </div>
            {actions ? (
              <div className="flex shrink-0 flex-col items-stretch gap-3 sm:flex-row lg:flex-col lg:items-end">
                {actions}
              </div>
            ) : null}
          </div>
          {footer ? <div className="border-t border-border/50 pt-6">{footer}</div> : null}
        </div>
      </header>
    );
  }

  const d = ACCENT_DARK[accent];
  return (
    <header className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.1] to-transparent p-6 shadow-inner sm:p-8">
      <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-amber-400/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-10 -left-10 size-40 rounded-full bg-sky-400/10 blur-2xl" aria-hidden />
      <div
        className={cn("pointer-events-none absolute -right-8 top-4 size-40 rounded-full blur-2xl", d.accentBlur)}
        aria-hidden
      />
      <div className="relative space-y-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex min-w-0 gap-4">
            <span
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-2xl border shadow-inner",
                d.iconBox
              )}
            >
              <Icon className={cn("size-5", d.iconText)} aria-hidden />
            </span>
            <div className="min-w-0 space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">{segment}</p>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h1>
              <p className="max-w-2xl text-[15px] leading-relaxed text-white/65 sm:text-base">{description}</p>
            </div>
          </div>
          {actions ? (
            <div className="flex shrink-0 flex-col items-stretch gap-3 sm:flex-row lg:flex-col lg:items-end">
              {actions}
            </div>
          ) : null}
        </div>
        {footer ? <div className="border-t border-white/10 pt-6">{footer}</div> : null}
      </div>
    </header>
  );
};
