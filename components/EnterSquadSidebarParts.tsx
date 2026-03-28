"use client";

import { Crown, Shield, X } from "lucide-react";
import { FranchiseMark } from "@/components/FranchiseMark";
import { RoleBadge } from "@/components/RoleBadge";
import { RoleIcon } from "@/components/RoleIcon";
import { cn } from "@/lib/utils";
import { compositionLabelClass } from "@/lib/roleStyles";
import type { PlayerWithFranchise } from "@/hooks/usePlayersByTier";

export function CompositionRow({
  label,
  current,
  min,
  max,
  isMaxRule,
  labelTone,
}: {
  label: string;
  current: number;
  min?: number;
  max?: number;
  isMaxRule?: boolean;
  labelTone?: "bat" | "bowl" | "wk" | "allrounder";
}) {
  const ok = isMaxRule ? max !== undefined && current <= max : min !== undefined && current >= min;
  return (
    <div className="flex items-center justify-between gap-2 text-[11px]">
      <span className="flex min-w-0 items-center gap-1.5">
        {labelTone ? (
          <>
            <RoleIcon role={labelTone} size="sm" className="opacity-95" />
            <span className={compositionLabelClass(labelTone)}>{label}</span>
          </>
        ) : (
          <span className="text-white/55">{label}</span>
        )}
      </span>
      <span
        className={cn(
          "font-mono font-medium tabular-nums",
          ok ? "text-emerald-300/80" : "text-amber-300/90"
        )}
      >
        {current}
        {min !== undefined && !isMaxRule && ` / ≥${min}`}
        {max !== undefined && isMaxRule && ` / ≤${max}`}
      </span>
    </div>
  );
}

export function TierProgress({
  label,
  count,
  points,
}: {
  label: string;
  count: number;
  points: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[11px] font-medium uppercase tracking-wider text-white/70">
        <span>{label}</span>
        <span className="text-white/50">{points}</span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i < count ? "bg-white" : "bg-white/15"
            )}
          />
        ))}
      </div>
    </div>
  );
}

interface PickRowProps {
  player: PlayerWithFranchise;
  showCaptain: boolean;
  isCaptain: boolean;
  isViceCaptain: boolean;
  onCaptain: () => void;
  onViceCaptain: () => void;
  onRemove: () => void;
}

export function PickRow({
  player,
  showCaptain,
  isCaptain,
  isViceCaptain,
  onCaptain,
  onViceCaptain,
  onRemove,
}: PickRowProps) {
  const fr = player.franchise && typeof player.franchise === "object" ? player.franchise : null;
  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2 py-2 backdrop-blur-sm transition-colors",
        isCaptain && "border-amber-300/50 bg-amber-500/10 ring-1 ring-amber-400/30",
        !isCaptain && isViceCaptain && "border-sky-400/40 bg-sky-500/10 ring-1 ring-sky-400/25"
      )}
    >
      {fr && (
        <FranchiseMark
          name={fr.name}
          shortCode={fr.shortCode}
          logoUrl={fr.logoUrl}
          size="sm"
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="truncate text-sm font-medium tracking-tight">{player.name}</span>
          {isCaptain && (
            <span className="shrink-0 rounded-md bg-amber-400/25 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-amber-100 ring-1 ring-amber-400/40">
              Captain
            </span>
          )}
          {!isCaptain && isViceCaptain && (
            <span className="shrink-0 rounded-md bg-sky-400/25 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-sky-100 ring-1 ring-sky-400/40">
              Vice
            </span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <RoleBadge role={player.role} tone="enter" variant="short" />
          {fr && (
            <span className="truncate text-[11px] text-white/55">
              {fr.shortCode} · {fr.name}
            </span>
          )}
        </div>
      </div>
      {showCaptain && (
        <>
          <button
            type="button"
            onClick={onCaptain}
            title="Set captain (×2)"
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors",
              isCaptain
                ? "border-amber-400/60 bg-amber-500/20 text-amber-200"
                : "border-white/15 text-white/40 hover:border-white/30 hover:text-white/80"
            )}
          >
            <Crown className="size-4" />
          </button>
          <button
            type="button"
            onClick={onViceCaptain}
            title="Set vice-captain (×1.5) — different franchise than captain"
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors",
              isViceCaptain
                ? "border-sky-400/60 bg-sky-500/20 text-sky-100"
                : "border-white/15 text-white/40 hover:border-white/30 hover:text-white/80"
            )}
          >
            <Shield className="size-4" />
          </button>
        </>
      )}
      <button
        type="button"
        onClick={onRemove}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/35 transition-colors hover:bg-white/10 hover:text-white"
        title="Remove"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
