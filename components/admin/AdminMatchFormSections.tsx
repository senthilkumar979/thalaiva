import { Calendar, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ADMIN_MATCH_SELECT_CLASS,
  ADMIN_MATCH_SELECT_CLASS_IPL,
  adminFranchiseOptions,
  adminVenueOptions,
  type AdminFranchiseOption,
} from "@/components/admin/adminCreateMatchShared";
import { cn } from "@/lib/utils";

const lblDefault = "text-xs font-semibold uppercase tracking-wider text-muted-foreground";
const lblIpl = "text-xs font-semibold uppercase tracking-wider text-white/55";

const inputShell =
  "h-11 rounded-xl border-white/15 bg-white/5 text-white shadow-sm placeholder:text-white/40";
const inputDefault = "h-11 rounded-xl border-border/80 bg-background/80 shadow-sm";

interface FranchisePairProps {
  franchises: AdminFranchiseOption[];
  franchiseA: string;
  onFranchiseAChange: (id: string) => void;
  franchiseB: string;
  onFranchiseBChange: (id: string) => void;
  forIplShell?: boolean;
}

export const AdminMatchFranchisePair = ({
  franchises,
  franchiseA,
  onFranchiseAChange,
  franchiseB,
  onFranchiseBChange,
  forIplShell = false,
}: FranchisePairProps) => {
  const lbl = forIplShell ? lblIpl : lblDefault;
  const sel = forIplShell ? ADMIN_MATCH_SELECT_CLASS_IPL : ADMIN_MATCH_SELECT_CLASS;
  return (
    <div className="grid gap-6 md:grid-cols-[1fr_auto_1fr] md:items-end md:gap-4">
      <div className="space-y-2">
        <Label htmlFor="admin-fa" className={lbl}>
          Home side
        </Label>
        <select
          id="admin-fa"
          className={sel}
          value={franchiseA}
          onChange={(e) => onFranchiseAChange(e.target.value)}
        >
          <option value="">Choose franchise</option>
          {adminFranchiseOptions(franchises)}
        </select>
      </div>
      <div className="flex justify-center pb-2 md:pb-8">
        <span
          className={cn(
            "inline-flex items-center justify-center rounded-2xl border px-4 py-2 text-sm font-bold tabular-nums tracking-[0.35em]",
            forIplShell
              ? "border-white/20 bg-white/10 text-white/75"
              : "border-border/60 bg-muted/40 text-muted-foreground"
          )}
        >
          VS
        </span>
      </div>
      <div className="space-y-2">
        <Label htmlFor="admin-fb" className={lbl}>
          Away side
        </Label>
        <select
          id="admin-fb"
          className={sel}
          value={franchiseB}
          onChange={(e) => onFranchiseBChange(e.target.value)}
        >
          <option value="">Choose franchise</option>
          {adminFranchiseOptions(franchises)}
        </select>
      </div>
    </div>
  );
};

interface MetaFieldsProps {
  matchNumber: number;
  onMatchNumberChange: (n: number) => void;
  when: string;
  onWhenChange: (v: string) => void;
  venue: string;
  onVenueChange: (v: string) => void;
  forIplShell?: boolean;
}

export const AdminMatchMetaFields = ({
  matchNumber,
  onMatchNumberChange,
  when,
  onWhenChange,
  venue,
  onVenueChange,
  forIplShell = false,
}: MetaFieldsProps) => {
  const lbl = forIplShell ? lblIpl : lblDefault;
  const sel = forIplShell ? ADMIN_MATCH_SELECT_CLASS_IPL : ADMIN_MATCH_SELECT_CLASS;
  const inp = forIplShell ? inputShell : inputDefault;
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div className="space-y-2">
        <Label htmlFor="admin-match-num" className={lbl}>
          Match number
        </Label>
        <Input
          id="admin-match-num"
          type="number"
          min={1}
          className={inp}
          value={matchNumber}
          onChange={(e) => onMatchNumberChange(Number(e.target.value))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="admin-match-when" className={cn(lbl, "flex items-center gap-2")}>
          <Calendar className="size-3.5 opacity-70" aria-hidden />
          Kickoff date
        </Label>
        <Input
          id="admin-match-when"
          type="date"
          className={inp}
          value={when}
          onChange={(e) => onWhenChange(e.target.value)}
        />
      </div>
      <div className="space-y-2 sm:col-span-2 lg:col-span-1">
        <Label htmlFor="admin-venue" className={cn(lbl, "flex items-center gap-2")}>
          <MapPin className="size-3.5 opacity-70" aria-hidden />
          Venue
        </Label>
        <select
          id="admin-venue"
          className={sel}
          value={venue}
          onChange={(e) => onVenueChange(e.target.value)}
        >
          {adminVenueOptions()}
        </select>
      </div>
    </div>
  );
};
