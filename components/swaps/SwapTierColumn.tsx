"use client";

import type { PendingSwapRow } from "@/components/swaps/swapPendingTypes";
import {
  labelForPlayerId,
  normalizePlayerId,
  TIER_SLOT_COPY,
  type PlayerOptionNorm,
} from "@/components/swaps/swapSelectLabels";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { playerSwapPenaltyForTierSlot } from "@/lib/swapPenaltyRules";
import { Trash } from "lucide-react";
import Image from "next/image";
import { IPL_ROLE_ICON_SVG } from "../../lib/iplRoleIcons";

interface SwapTierColumnProps {
  tierSlot: 1 | 2 | 3;
  squadNorm: PlayerOptionNorm[];
  poolFiltered: PlayerOptionNorm[];
  loadingPools: boolean;
  playerOutId: string;
  playerInId: string;
  onPlayerOutChange: (id: string) => void;
  onPlayerInChange: (id: string) => void;
  onAddToQueue: () => void;
  swapsLeftInTier: number;
  queuedInTier: number;
  rows: { row: PendingSwapRow; globalIndex: number }[];
  onRemovePending: (globalIndex: number) => void;
}

export const SwapTierColumn = ({
  tierSlot,
  squadNorm,
  poolFiltered,
  loadingPools,
  playerOutId,
  playerInId,
  onPlayerOutChange,
  onPlayerInChange,
  onAddToQueue,
  swapsLeftInTier,
  queuedInTier,
  rows,
  onRemovePending,
}: SwapTierColumnProps) => {
  const copy = TIER_SLOT_COPY[tierSlot];
  const perSwap = playerSwapPenaltyForTierSlot(tierSlot);
  const outLabel = playerOutId ? labelForPlayerId(playerOutId, squadNorm) ?? "Player" : undefined;
  const inLabel =
    playerInId && !loadingPools ? labelForPlayerId(playerInId, poolFiltered) ?? "Player" : undefined;

  return (
    <div className="flex flex-col rounded-xl border border-white/10 bg-[#0a2469]/60 p-4">
      <div className="mb-3 border-b border-white/10 pb-3">
        <p className="text-sm font-semibold text-white">{copy.title}</p>
        <p className="text-xs text-white/50">{copy.hint}</p>
        <div className="mt-2 rounded-lg bg-black/25 px-2.5 py-2 text-center">
          <p className="text-xs uppercase tracking-wide text-white/45">Penalty per swap</p>
          <p className="text-2xl font-bold tabular-nums text-amber-200">{perSwap}</p>
          <p className="text-[11px] text-white/45">points from your total score</p>
        </div>
        <p className="mt-2 text-center text-xs text-white/55">
          Swaps left here:{" "}
          <span className="font-semibold tabular-nums text-white">{swapsLeftInTier}</span> / 2 · in
          queue: {queuedInTier}
        </p>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-white/80">Remove</Label>
          <Select
            value={playerOutId || undefined}
            onValueChange={(v) => onPlayerOutChange(v ? normalizePlayerId(v) : "")}
          >
            <SelectTrigger className="w-full min-w-0 border-white/20 bg-white/10 text-white">
              <SelectValue placeholder="Player out">{outLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {squadNorm.map((p) => (
                <SelectItem key={p._id} value={p._id}>
                  <div className="flex justify-between gap-2 w-full">
                    <div className="flex items-center gap-2">
                      <Image src={IPL_ROLE_ICON_SVG[p.role as keyof typeof IPL_ROLE_ICON_SVG]} alt={p.role} width={20} height={20} />
                      {p.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <Image src={p.franchise?.logoUrl} alt={p.franchise?.name} width={20} height={20} />
                      <span className="">{p.franchise?.shortCode ?? "Unknown"}</span></div>
                    </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-white/80">Add from pool</Label>
          <Select
            value={playerInId || undefined}
            onValueChange={(v) => onPlayerInChange(v ? normalizePlayerId(v) : "")}
            disabled={loadingPools}
          >
            <SelectTrigger className="w-full min-w-0 border-white/20 bg-white/10 text-white">
              <SelectValue placeholder={loadingPools ? "Loading…" : "Player in"}>
                {loadingPools ? undefined : inLabel}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {poolFiltered.map((p) => (
                <SelectItem key={p._id} value={p._id}>
                  <div className="flex justify-between gap-2 w-full">
                    <div className="flex items-center gap-2">
                      <Image src={IPL_ROLE_ICON_SVG[p.role as keyof typeof IPL_ROLE_ICON_SVG]} alt={p.role} width={20} height={20} />
                      {p.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <Image src={p.franchise?.logoUrl} alt={p.franchise?.name} width={20} height={20} />
                      <span className="">{p.franchise?.shortCode ?? "Unknown"}</span></div>
                    </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="button"
          variant="secondary"
          className="w-full bg-white/15 text-white hover:bg-white/25"
          onClick={onAddToQueue}
        >
          Add swap
        </Button>
      </div>

      {rows.length > 0 ? (
        <ul className="mt-4 space-y-2 border-t border-white/10 pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-white/40">Queued</p>
          {rows.map(({ row, globalIndex }) => (
            <li
              key={`${row.playerOutId}-${row.playerInId}-${globalIndex}`}
              className="rounded-md bg-black/20 px-2 py-2 text-xs"
            >
              <p className="text-white/90 flex justify-between gap-2 w-full">
                <span className="text-rose-200/90">{row.playerOutName}</span>
                <span className="text-white/35"> → </span>
                <span className="text-emerald-200/90">{row.playerInName}</span>
              </p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="text-white font-bold">{playerSwapPenaltyForTierSlot(tierSlot)} pts</span>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => onRemovePending(globalIndex)}
                >
                  <Trash className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};
