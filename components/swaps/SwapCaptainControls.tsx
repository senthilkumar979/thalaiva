"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { labelForPlayerId, normalizePlayerId, type PlayerOption } from "@/components/swaps/swapSelectLabels";
import Image from "next/image";

interface SwapCaptainControlsProps {
  squad: PlayerOption[];
  leadershipChangeAvailable: boolean;
  newCaptainId: string;
  newViceCaptainId: string;
  onCaptainChange: (v: string) => void;
  onViceChange: (v: string) => void;
}

export const SwapCaptainControls = ({
  squad,
  leadershipChangeAvailable,
  newCaptainId,
  newViceCaptainId,
  onCaptainChange,
  onViceChange,
}: SwapCaptainControlsProps) => {
  if (!leadershipChangeAvailable) return null;

  const captainDisplay = newCaptainId
    ? labelForPlayerId(newCaptainId, squad) ?? "Selected player"
    : "Keep current captain";
  const viceDisplay = newViceCaptainId
    ? labelForPlayerId(newViceCaptainId, squad) ?? "Selected player"
    : "Keep current vice-captain";

  return (
    <div className="grid gap-4 rounded-xl border border-white/10 bg-white/5 p-4 sm:grid-cols-2">
      <p className="text-xs font-medium uppercase tracking-wider text-white/50 sm:col-span-2">
        Optional — change captain or vice-captain once for the entire competition (−200 points). Pick
        only one; choosing one clears the other.
      </p>
      <div className="space-y-1">
        <Label className="text-white/80 mb-3">New captain</Label>
        <Select
          value={newCaptainId ? normalizePlayerId(newCaptainId) : "__keep__"}
          onValueChange={(v) => onCaptainChange(v === "__keep__" ? "" : normalizePlayerId(v))}
        >
          <SelectTrigger className="w-full min-w-0 border-white/20 bg-white/10 text-white">
            <SelectValue placeholder="Keep current captain">{captainDisplay}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__keep__">Keep current captain</SelectItem>
            {squad.map((p) => (
              <SelectItem key={normalizePlayerId(p._id)} value={normalizePlayerId(p._id)}>
                <div className="flex justify-between gap-2 w-full">
                  {p.name}
                  <div className="flex items-center gap-2">
                    <Image src={p.franchise?.logoUrl} alt={p.franchise?.name} width={20} height={20} />
                    <span className="">{p.franchise?.shortCode ?? "Unknown"}</span>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-white/80 mb-3">New vice-captain</Label>
        <Select
          value={newViceCaptainId ? normalizePlayerId(newViceCaptainId) : "__keep__"}
          onValueChange={(v) => onViceChange(v === "__keep__" ? "" : normalizePlayerId(v))}
        >
          <SelectTrigger className="w-full min-w-0 border-white/20 bg-white/10 text-white">
            <SelectValue placeholder="Keep current vice-captain">{viceDisplay}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__keep__">Keep current vice-captain</SelectItem>
            {squad.map((p) => (
              <SelectItem key={`vc-${normalizePlayerId(p._id)}`} value={normalizePlayerId(p._id)}>
                <div className="flex justify-between gap-2 w-full">
                  {p.name}
                  <div className="flex items-center gap-2">
                    <Image src={p.franchise?.logoUrl} alt={p.franchise?.name} width={20} height={20} />
                    <span className="">{p.franchise?.shortCode ?? "Unknown"}</span>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
