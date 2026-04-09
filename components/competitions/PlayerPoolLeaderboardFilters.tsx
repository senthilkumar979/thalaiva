"use client";

import { Label } from "@/components/ui/label";
import type { RoleFilter, SortMode, TierFilter } from "@/lib/playerPoolLeaderboard";
import { cn } from "@/lib/utils";

const SELECT_HUB =
  "h-10 w-full max-w-[220px] rounded-lg border border-white/15 bg-white/[0.06] px-3 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-amber-400/30";

const PILL =
  "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors";

const TIER_PILLS: { id: TierFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: 1, label: "T1" },
  { id: 3, label: "T3" },
  { id: 5, label: "T5" },
];

const ROLE_PILLS: { id: RoleFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "bat", label: "BAT" },
  { id: "bowl", label: "BOWL" },
  { id: "allrounder", label: "AR" },
  { id: "wk", label: "WK" },
];

interface PlayerPoolLeaderboardFiltersProps {
  franchiseOptions: [string, string][];
  franchiseId: string | "all";
  onFranchiseChange: (v: string | "all") => void;
  role: RoleFilter;
  onRoleChange: (v: RoleFilter) => void;
  tier: TierFilter;
  onTierChange: (v: TierFilter) => void;
  sort: SortMode;
  onSortChange: (v: SortMode) => void;
  filteredCount: number;
  totalCount: number;
}

export const PlayerPoolLeaderboardFilters = ({
  franchiseOptions,
  franchiseId,
  onFranchiseChange,
  role,
  onRoleChange,
  tier,
  onTierChange,
  sort,
  onSortChange,
  filteredCount,
  totalCount,
}: PlayerPoolLeaderboardFiltersProps) => (
  <>
    <p className="text-sm leading-relaxed text-white/55">
      Total fantasy points from every scored IPL match in the pool. Filters apply to this list; sort changes
      ordering only.
    </p>

    <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
      <div className="space-y-2">
        <Label htmlFor="pl-franchise" className="text-white/60">
          Team
        </Label>
        <select
          id="pl-franchise"
          className={SELECT_HUB}
          value={franchiseId}
          onChange={(e) => onFranchiseChange(e.target.value === "all" ? "all" : e.target.value)}
        >
          <option value="all">All franchises</option>
          {franchiseOptions.map(([fid, name]) => (
            <option key={fid} value={fid} className="bg-slate-900">
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <span className="block text-sm font-medium text-white/60">Role</span>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by role">
          {ROLE_PILLS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onRoleChange(p.id)}
              className={cn(
                PILL,
                role === p.id
                  ? "border-amber-400/40 bg-amber-500/15 text-amber-100 ring-1 ring-amber-400/25"
                  : "border-white/12 bg-white/[0.04] text-white/55 hover:bg-white/[0.08]"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <span className="block text-sm font-medium text-white/60">Tier</span>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by tier">
          {TIER_PILLS.map((p) => (
            <button
              key={String(p.id)}
              type="button"
              onClick={() => onTierChange(p.id)}
              className={cn(
                PILL,
                tier === p.id
                  ? "border-amber-400/40 bg-amber-500/15 text-amber-100 ring-1 ring-amber-400/25"
                  : "border-white/12 bg-white/[0.04] text-white/55 hover:bg-white/[0.08]"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 lg:ml-auto">
        <Label htmlFor="pl-sort" className="text-white/60">
          Sort
        </Label>
        <select
          id="pl-sort"
          className={SELECT_HUB}
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortMode)}
        >
          <option value="points-desc" className="bg-slate-900">
            Points (high → low)
          </option>
          <option value="points-asc" className="bg-slate-900">
            Points (low → high)
          </option>
          <option value="name-asc" className="bg-slate-900">
            Name (A → Z)
          </option>
          <option value="name-desc" className="bg-slate-900">
            Name (Z → A)
          </option>
        </select>
      </div>
    </div>

    <p className="text-xs text-white/45">
      Showing{" "}
      <span className="font-semibold tabular-nums text-white/80">{filteredCount}</span> of{" "}
      <span className="font-semibold tabular-nums text-white/80">{totalCount}</span> players
    </p>
  </>
);
