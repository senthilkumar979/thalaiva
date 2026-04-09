"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import {
  ADMIN_MATCH_SELECT_CLASS,
  ADMIN_MATCH_SELECT_CLASS_IPL,
} from "@/components/admin/adminCreateMatchShared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PlayerCreateFormValues } from "@/lib/validators/playerCreate";
import { cn } from "@/lib/utils";

interface FranchiseOption {
  _id: string;
  name: string;
  shortCode: string;
}

const ROLE_LABELS: Record<PlayerCreateFormValues["role"], string> = {
  bat: "Batter",
  bowl: "Bowler",
  allrounder: "All-rounder",
  wk: "Wicket-keeper",
};

interface AddPlayerPoolFormFieldsProps {
  register: UseFormRegister<PlayerCreateFormValues>;
  errors: FieldErrors<PlayerCreateFormValues>;
  franchises: FranchiseOption[];
  isSubmitting: boolean;
  /** Dark glass fields (e.g. /players hub). */
  appearance?: "default" | "hub";
}

const errCls = "text-sm text-destructive";

const hubInput =
  "bg-white/[0.06] border-white/15 text-white placeholder:text-white/40 focus-visible:ring-amber-400/30";

export const AddPlayerPoolFormFields = ({
  register,
  errors,
  franchises,
  isSubmitting,
  appearance = "default",
}: AddPlayerPoolFormFieldsProps) => {
  const hub = appearance === "hub";
  const selectClass = cn(
    "max-w-full",
    hub ? ADMIN_MATCH_SELECT_CLASS_IPL : ADMIN_MATCH_SELECT_CLASS
  );
  const labelCls = hub ? "text-white/70" : undefined;
  return (
  <>
    <div className="space-y-2">
      <Label htmlFor="pool-player-name" className={labelCls}>
        Player name
      </Label>
      <Input
        id="pool-player-name"
        autoComplete="off"
        className={cn("max-w-md", hub && hubInput)}
        {...register("name")}
        aria-invalid={errors.name ? "true" : "false"}
      />
      {errors.name ? <p className={errCls}>{errors.name.message}</p> : null}
    </div>

    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-2">
        <Label htmlFor="pool-franchise" className={labelCls}>
          Franchise
        </Label>
        <select
          id="pool-franchise"
          className={selectClass}
          {...register("franchiseId")}
          aria-invalid={errors.franchiseId ? "true" : "false"}
        >
          <option value="">Select franchise</option>
          {franchises.map((f) => (
            <option key={f._id} value={f._id}>
              {f.shortCode} — {f.name}
            </option>
          ))}
        </select>
        {errors.franchiseId ? <p className={errCls}>{errors.franchiseId.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="pool-tier" className={labelCls}>
          Tier
        </Label>
        <select
          id="pool-tier"
          className={selectClass}
          {...register("tier")}
          aria-invalid={errors.tier ? "true" : "false"}
        >
          <option value="1">1</option>
          <option value="3">3</option>
          <option value="5">5</option>
        </select>
        {errors.tier ? <p className={errCls}>{errors.tier.message}</p> : null}
      </div>
      <div className="space-y-2 sm:col-span-2 lg:col-span-2">
        <Label htmlFor="pool-role" className={labelCls}>
          Role
        </Label>
        <select
          id="pool-role"
          className={selectClass}
          {...register("role")}
          aria-invalid={errors.role ? "true" : "false"}
        >
          {(Object.keys(ROLE_LABELS) as PlayerCreateFormValues["role"][]).map((key) => (
            <option key={key} value={key}>
              {ROLE_LABELS[key]}
            </option>
          ))}
        </select>
        {errors.role ? <p className={errCls}>{errors.role.message}</p> : null}
      </div>
    </div>

    <Button
      type="submit"
      disabled={isSubmitting}
      className={cn(
        "min-w-[140px]",
        hub && "bg-amber-500 text-white hover:bg-amber-400"
      )}
    >
      {isSubmitting ? "Saving…" : "Add player"}
    </Button>
  </>
  );
};
