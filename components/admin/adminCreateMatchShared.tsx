import type { ReactNode } from "react";

export interface AdminFranchiseOption {
  _id: string;
  name: string;
  shortCode: string;
}

export const ADMIN_MATCH_SELECT_CLASS =
  "flex h-11 w-full cursor-pointer appearance-none rounded-xl border border-border/80 bg-background/80 px-4 text-sm font-medium shadow-sm outline-none transition-[border,box-shadow] hover:border-border focus-visible:border-emerald-500/50 focus-visible:ring-2 focus-visible:ring-emerald-500/20 dark:bg-background/50";

export function adminFranchiseOptions(franchises: AdminFranchiseOption[]): ReactNode {
  return franchises.map((f) => (
    <option key={f._id} value={f._id}>
      {f.shortCode} — {f.name}
    </option>
  ));
}

export function adminVenueOptions(): ReactNode {
  return (
    <>
      <option value="">Select venue</option>
      <option value="home">Home</option>
      <option value="away">Away</option>
    </>
  );
}
