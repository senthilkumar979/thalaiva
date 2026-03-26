"use client";

import { Trophy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EnterTeamNameFieldProps {
  teamName: string;
  onTeamNameChange: (v: string) => void;
}

export const EnterTeamNameField = ({ teamName, onTeamNameChange }: EnterTeamNameFieldProps) => (
  <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.12] via-white/[0.05] to-transparent p-[1px] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]">
    <div className="rounded-[15px] bg-[#0a2469]/55 px-4 py-4 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
          <Trophy className="size-4 text-amber-300/90" />
        </span>
        <div>
          <Label
            htmlFor="enter-team-name"
            className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45"
          >
            Squad name
          </Label>
          <p className="text-[11px] text-white/40">Shown on leaderboards & matchups</p>
        </div>
      </div>
      <Input
        id="enter-team-name"
        value={teamName}
        onChange={(e) => onTeamNameChange(e.target.value)}
        placeholder="Name your dream XI"
        className="mt-3 h-12 border-0 border-b border-white/20 bg-transparent px-0 text-lg font-semibold tracking-tight text-white shadow-none placeholder:text-white/30 focus-visible:border-amber-300/50 focus-visible:ring-0"
      />
    </div>
  </div>
);
