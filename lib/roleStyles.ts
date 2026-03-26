import { cn } from "@/lib/utils";

const ENTER_BADGE: Record<string, string> = {
  bat: "border border-sky-400/30 bg-sky-500/20 text-sky-100",
  bowl: "border border-emerald-400/30 bg-emerald-500/20 text-emerald-100",
  wk: "border border-violet-400/30 bg-violet-500/20 text-violet-100",
  allrounder: "border border-amber-400/30 bg-amber-500/20 text-amber-100",
};

const DEFAULT_BADGE: Record<string, string> = {
  bat: "border-sky-200/80 bg-sky-100 text-sky-900 dark:border-sky-500/40 dark:bg-sky-500/15 dark:text-sky-100",
  bowl: "border-emerald-200/80 bg-emerald-100 text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-100",
  wk: "border-violet-200/80 bg-violet-100 text-violet-900 dark:border-violet-500/40 dark:bg-violet-500/15 dark:text-violet-100",
  allrounder:
    "border-amber-200/80 bg-amber-100 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-100",
};

const COMPOSITION_LABEL: Record<string, string> = {
  bat: "text-sky-200/95",
  bowl: "text-emerald-200/95",
  wk: "text-violet-200/95",
  allrounder: "text-amber-200/95",
};

export function roleBadgeClass(role: string, tone: "enter" | "default"): string {
  const map = tone === "enter" ? ENTER_BADGE : DEFAULT_BADGE;
  return map[role] ?? (tone === "enter" ? "border border-white/20 bg-white/15 text-white" : "bg-muted text-muted-foreground");
}

export function compositionLabelClass(roleKey: "bat" | "bowl" | "wk" | "allrounder"): string {
  return cn("font-medium", COMPOSITION_LABEL[roleKey] ?? "text-white/55");
}
