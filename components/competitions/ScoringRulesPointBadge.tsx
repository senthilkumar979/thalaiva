import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const scoringPointsBadgeClass =
  "shrink-0 border border-[#19398a]/20 bg-[#19398a]/10 px-2.5 py-0.5 text-[13px] font-semibold tabular-nums text-[#0f2a6b]";

export function ScoringRulesPointBadge({ children, className }: { children: ReactNode; className?: string }) {
  return <Badge className={cn(scoringPointsBadgeClass, className)}>{children}</Badge>;
}
