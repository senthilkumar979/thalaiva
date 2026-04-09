"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SwapEligibility } from "@/hooks/useSwapEligibility";

interface PlayerLite {
  _id: string;
  name: string;
}

interface EntryPopulated {
  tier1Players: PlayerLite[];
  tier2Players: PlayerLite[];
  tier3Players: PlayerLite[];
}

interface PendingSwap {
  tierSlot: 1 | 2 | 3;
  playerOutId: string;
  playerInId: string;
  playerOutName: string;
  playerInName: string;
}

interface SwapQueueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  competitionId: string;
  entry: EntryPopulated;
  eligibility: SwapEligibility;
  newCaptainId: string;
  newViceCaptainId: string;
  onSuccess: () => void;
}

const TIER_PLAYER_TIER: Record<1 | 2 | 3, number> = { 1: 1, 2: 3, 3: 5 };

function squadForTier(entry: EntryPopulated, tierSlot: 1 | 2 | 3): PlayerLite[] {
  if (tierSlot === 1) return entry.tier1Players;
  if (tierSlot === 2) return entry.tier2Players;
  return entry.tier3Players;
}

export const SwapQueueDialog = ({
  open,
  onOpenChange,
  competitionId,
  entry,
  eligibility,
  newCaptainId,
  newViceCaptainId,
  onSuccess,
}: SwapQueueDialogProps) => {
  const [tierSlot, setTierSlot] = useState<1 | 2 | 3>(1);
  const [playerOutId, setPlayerOutId] = useState("");
  const [playerInId, setPlayerInId] = useState("");
  const [pool, setPool] = useState<PlayerLite[]>([]);
  const [loadingPool, setLoadingPool] = useState(false);
  const [pending, setPending] = useState<PendingSwap[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const squad = useMemo(() => squadForTier(entry, tierSlot), [entry, tierSlot]);

  useEffect(() => {
    if (!open) return;
    const t = TIER_PLAYER_TIER[tierSlot];
    setLoadingPool(true);
    fetch(`/api/players?tier=${t}`)
      .then((r) => r.json())
      .then((rows: PlayerLite[]) => setPool(Array.isArray(rows) ? rows : []))
      .finally(() => setLoadingPool(false));
  }, [open, tierSlot]);

  const onTierChange = (v: string | null) => {
    if (!v) return;
    setTierSlot(Number(v) as 1 | 2 | 3);
    setPlayerOutId("");
    setPlayerInId("");
  };

  const addToQueue = () => {
    if (!playerOutId || !playerInId) return;
    if (pending.length >= eligibility.swapsRemaining) {
      setError("No swaps left in this batch");
      return;
    }
    if (playerOutId === playerInId) {
      setError("Pick two different players");
      return;
    }
    const outP = squad.find((p) => p._id === playerOutId);
    const inP = pool.find((p) => p._id === playerInId);
    setError(null);
    setPending((p) => [
      ...p,
      {
        tierSlot,
        playerOutId,
        playerInId,
        playerOutName: outP?.name ?? "?",
        playerInName: inP?.name ?? "?",
      },
    ]);
    setPlayerOutId("");
    setPlayerInId("");
  };

  const removePending = (i: number) => {
    setPending((p) => p.filter((_, idx) => idx !== i));
  };

  const submitAll = async () => {
    if (pending.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        swaps: pending.map(({ tierSlot: ts, playerOutId: o, playerInId: n }) => ({
          tierSlot: ts,
          playerOutId: o,
          playerInId: n,
        })),
      };
      if (newCaptainId) body.newCaptainId = newCaptainId;
      if (newViceCaptainId) body.newViceCaptainId = newViceCaptainId;
      const res = await fetch(`/api/competitions/${competitionId}/entries/me/swap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "Swap failed");
      setPending([]);
      onSuccess();
      onOpenChange(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const nextLabel =
    eligibility.nextMatchNumber != null
      ? `Match order #${eligibility.nextMatchNumber}`
      : "Next scheduled match";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-white/15 bg-[#0a2469]/95 text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Queue player swaps</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <p className="text-white/70">
            Up to {eligibility.swapsRemaining} swap(s) left. Points apply from {nextLabel}.
          </p>
          <div className="grid gap-2">
            <Label>Tier</Label>
            <Select value={String(tierSlot)} onValueChange={onTierChange}>
              <SelectTrigger className="border-white/20 bg-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Tier 1 squad slot</SelectItem>
                <SelectItem value="2">Tier 2 squad slot (player tier 3)</SelectItem>
                <SelectItem value="3">Tier 3 squad slot (player tier 5)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Out</Label>
              <Select value={playerOutId} onValueChange={(v) => setPlayerOutId(v ?? "")}>
                <SelectTrigger className="border-white/20 bg-white/10 text-white">
                  <SelectValue placeholder="Player out" />
                </SelectTrigger>
                <SelectContent>
                  {squad.map((p) => (
                    <SelectItem key={p._id} value={p._id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>In</Label>
              <Select value={playerInId} onValueChange={(v) => setPlayerInId(v ?? "")} disabled={loadingPool}>
                <SelectTrigger className="border-white/20 bg-white/10 text-white">
                  <SelectValue placeholder={loadingPool ? "Loading…" : "Player in"} />
                </SelectTrigger>
                <SelectContent>
                  {pool
                    .filter((p) => !squad.some((s) => s._id === p._id))
                    .map((p) => (
                      <SelectItem key={p._id} value={p._id}>
                        {p.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="button" variant="secondary" className="w-full" onClick={addToQueue}>
            Add to queue
          </Button>
          {pending.length > 0 ? (
            <ul className="space-y-2 rounded-lg border border-amber-400/20 bg-amber-500/10 p-3 text-xs">
              {pending.map((s, i) => (
                <li
                  key={`${s.playerOutId}-${s.playerInId}-${i}`}
                  className="flex items-center justify-between gap-2"
                >
                  <span>
                    Tier {s.tierSlot}: {s.playerOutName} → {s.playerInName}
                  </span>
                  <Button type="button" size="sm" variant="ghost" onClick={() => removePending(i)}>
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          ) : null}
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={submitting || pending.length === 0} onClick={submitAll}>
            {submitting ? <Loader2 className="size-4 animate-spin" /> : "Submit swaps"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
