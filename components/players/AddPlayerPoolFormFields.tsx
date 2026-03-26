"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { ADMIN_MATCH_SELECT_CLASS } from "@/components/admin/adminCreateMatchShared";
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
}

const errCls = "text-sm text-destructive";

export const AddPlayerPoolFormFields = ({
  register,
  errors,
  franchises,
  isSubmitting,
}: AddPlayerPoolFormFieldsProps) => (
  <>
    <div className="space-y-2">
      <Label htmlFor="pool-player-name">Player name</Label>
      <Input
        id="pool-player-name"
        autoComplete="off"
        className="max-w-md"
        {...register("name")}
        aria-invalid={errors.name ? "true" : "false"}
      />
      {errors.name ? <p className={errCls}>{errors.name.message}</p> : null}
    </div>

    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-2">
        <Label htmlFor="pool-franchise">Franchise</Label>
        <select
          id="pool-franchise"
          className={cn(ADMIN_MATCH_SELECT_CLASS, "max-w-full")}
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
        <Label htmlFor="pool-tier">Tier</Label>
        <select
          id="pool-tier"
          className={cn(ADMIN_MATCH_SELECT_CLASS, "max-w-full")}
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
        <Label htmlFor="pool-role">Role</Label>
        <select
          id="pool-role"
          className={cn(ADMIN_MATCH_SELECT_CLASS, "max-w-full")}
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

    <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
      {isSubmitting ? "Saving…" : "Add player"}
    </Button>
  </>
);
