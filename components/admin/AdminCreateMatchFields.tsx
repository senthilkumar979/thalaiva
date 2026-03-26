"use client";

import { Button } from "@/components/ui/button";
import {
  AdminMatchFranchisePair,
  AdminMatchMetaFields,
} from "@/components/admin/AdminMatchFormSections";
import type { AdminFranchiseOption } from "@/components/admin/adminCreateMatchShared";
import { cn } from "@/lib/utils";

interface AdminCreateMatchFieldsProps {
  franchises: AdminFranchiseOption[];
  matchNumber: number;
  onMatchNumberChange: (n: number) => void;
  franchiseA: string;
  onFranchiseAChange: (id: string) => void;
  franchiseB: string;
  onFranchiseBChange: (id: string) => void;
  venue: string;
  onVenueChange: (v: string) => void;
  when: string;
  onWhenChange: (v: string) => void;
  onSubmit: () => void;
  submitLabel?: string;
  onCancel?: () => void;
  isSubmitting?: boolean;
  className?: string;
  footerHint?: string;
}

export const AdminCreateMatchFields = ({
  franchises,
  matchNumber,
  onMatchNumberChange,
  franchiseA,
  onFranchiseAChange,
  franchiseB,
  onFranchiseBChange,
  venue,
  onVenueChange,
  when,
  onWhenChange,
  onSubmit,
  submitLabel = "Create match",
  onCancel,
  isSubmitting,
  className,
  footerHint,
}: AdminCreateMatchFieldsProps) => {
  const venueOk = venue === "home" || venue === "away";
  const ready = Boolean(franchiseA && franchiseB && when && venueOk);
  const hint =
    footerHint === ""
      ? null
      : (footerHint ??
        (!ready ? "Fill all fields to enable." : "Fixture will appear in the schedule below."));

  return (
    <div className={cn("relative space-y-8 px-6 py-8 sm:px-8", className)}>
      <AdminMatchFranchisePair
        franchises={franchises}
        franchiseA={franchiseA}
        onFranchiseAChange={onFranchiseAChange}
        franchiseB={franchiseB}
        onFranchiseBChange={onFranchiseBChange}
      />
      <AdminMatchMetaFields
        matchNumber={matchNumber}
        onMatchNumberChange={onMatchNumberChange}
        when={when}
        onWhenChange={onWhenChange}
        venue={venue}
        onVenueChange={onVenueChange}
      />
      <div className="flex flex-wrap items-center gap-4 border-t border-border/40 pt-6">
        {onCancel ? (
          <Button type="button" variant="outline" size="lg" disabled={isSubmitting} onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button
          type="button"
          size="lg"
          disabled={!ready || isSubmitting}
          onClick={onSubmit}
          className={cn(
            "h-12 min-w-[180px] rounded-xl px-8 font-semibold shadow-lg shadow-emerald-900/10 transition-all",
            "bg-emerald-600 text-white hover:bg-emerald-500 dark:shadow-emerald-950/40",
            "disabled:opacity-40"
          )}
        >
          {isSubmitting ? "Saving…" : submitLabel}
        </Button>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </div>
    </div>
  );
};
