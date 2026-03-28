"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PlayerLite {
  _id: string;
  name: string;
}

interface SwapCaptainControlsProps {
  squad: PlayerLite[];
  captainChangeAvailable: boolean;
  viceCaptainChangeAvailable: boolean;
  newCaptainId: string;
  newViceCaptainId: string;
  onCaptainChange: (v: string) => void;
  onViceChange: (v: string) => void;
}

export const SwapCaptainControls = ({
  squad,
  captainChangeAvailable,
  viceCaptainChangeAvailable,
  newCaptainId,
  newViceCaptainId,
  onCaptainChange,
  onViceChange,
}: SwapCaptainControlsProps) => {
  if (!captainChangeAvailable && !viceCaptainChangeAvailable) return null;

  return (
    <div className="grid gap-4 rounded-xl border border-white/10 bg-white/5 p-4 sm:grid-cols-2">
      <p className="text-xs font-medium uppercase tracking-wider text-white/50 sm:col-span-2">
        Optional — change captain / vice-captain (once each per competition)
      </p>
      {captainChangeAvailable ? (
        <div className="space-y-1">
          <Label className="text-white/80">New captain</Label>
          <Select
            value={newCaptainId || "__keep__"}
            onValueChange={(v) => onCaptainChange(v === "__keep__" ? "" : (v ?? ""))}
          >
            <SelectTrigger className="border-white/20 bg-white/10 text-white">
              <SelectValue placeholder="Keep current" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__keep__">Keep current</SelectItem>
              {squad.map((p) => (
                <SelectItem key={p._id} value={p._id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}
      {viceCaptainChangeAvailable ? (
        <div className="space-y-1">
          <Label className="text-white/80">New vice-captain</Label>
          <Select
            value={newViceCaptainId || "__keep__"}
            onValueChange={(v) => onViceChange(v === "__keep__" ? "" : (v ?? ""))}
          >
            <SelectTrigger className="border-white/20 bg-white/10 text-white">
              <SelectValue placeholder="Keep current" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__keep__">Keep current</SelectItem>
              {squad.map((p) => (
                <SelectItem key={p._id} value={p._id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}
    </div>
  );
};
