"use client";

import { Filter, Sparkles } from "lucide-react";
import { FranchiseMark } from "@/components/FranchiseMark";
import { RoleBadge } from "@/components/RoleBadge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FranchiseOption } from "@/lib/franchiseTypes";
import { ROLE_FILTER_OPTIONS, type RoleFilterValue } from "@/lib/squadComposition";

interface EnterPoolFiltersProps {
  teamFilter: string;
  onTeamFilterChange: (v: string) => void;
  roleFilter: RoleFilterValue;
  onRoleFilterChange: (v: RoleFilterValue) => void;
  franchiseOptions: FranchiseOption[];
}

export const EnterPoolFilters = ({
  teamFilter,
  onTeamFilterChange,
  roleFilter,
  onRoleFilterChange,
  franchiseOptions,
}: EnterPoolFiltersProps) => {
  const selectedFr = franchiseOptions.find((f) => f.code === teamFilter);
  const roleLabel = ROLE_FILTER_OPTIONS.find((o) => o.value === roleFilter)?.label ?? "All roles";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-transparent p-6 shadow-inner">
      <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-white/10 blur-3xl" />
      <div className="relative flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-white/90">
            <Sparkles className="size-5 text-amber-300/90" />
            <h3 className="text-lg font-semibold tracking-tight">Player pool</h3>
          </div>
          <p className="mt-1 max-w-xl text-sm text-white/55">
            Pick five per tier. Each tier column cannot repeat the same IPL franchise. Meet role
            minimums and at most three all-rounders.
          </p>
        </div>
      </div>

      <div className="relative mt-6 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-white/80">
            <Filter className="size-3.5 text-white/50" />
            Filter by team
          </Label>
          <Select value={teamFilter} onValueChange={(v) => onTeamFilterChange(v ?? "all")}>
            <SelectTrigger className="h-11 w-full border-white/20 bg-white/10 text-white data-placeholder:text-white/45 [&_svg]:text-white/60">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                {teamFilter !== "all" && selectedFr ? (
                  <FranchiseMark
                    name={selectedFr.name}
                    shortCode={selectedFr.code}
                    logoUrl={selectedFr.logoUrl}
                    size="xs"
                  />
                ) : null}
                <SelectValue placeholder="All teams">
                  {teamFilter === "all"
                    ? "All teams"
                    : selectedFr
                      ? `${selectedFr.name} (${selectedFr.code})`
                      : ""}
                </SelectValue>
              </div>
            </SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value="all">All teams</SelectItem>
              {franchiseOptions.map((fr) => (
                <SelectItem key={fr.code} value={fr.code}>
                  <span className="flex items-center gap-2">
                    <FranchiseMark name={fr.name} shortCode={fr.code} logoUrl={fr.logoUrl} size="xs" />
                    <span>
                      {fr.name} <span className="opacity-60">({fr.code})</span>
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-white/80">
            <Filter className="size-3.5 text-white/50" />
            Filter by role
          </Label>
          <Select
            value={roleFilter}
            onValueChange={(v) => onRoleFilterChange((v ?? "all") as RoleFilterValue)}
          >
            <SelectTrigger className="h-11 w-full border-white/20 bg-white/10 text-white data-placeholder:text-white/45 [&_svg]:text-white/60">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                {roleFilter !== "all" ? (
                  <RoleBadge role={roleFilter} tone="enter" variant="short" />
                ) : null}
                <SelectValue placeholder="All roles">{roleLabel}</SelectValue>
              </div>
            </SelectTrigger>
            <SelectContent>
              {ROLE_FILTER_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.value === "all" ? (
                    <span>All roles</span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <RoleBadge role={o.value} tone="enter" variant="short" />
                      <span>{o.label}</span>
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
