"use client";

import { PlusCircle, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateCompetitionPanelProps {
  name: string;
  deadline: string;
  description: string;
  onNameChange: (v: string) => void;
  onDeadlineChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onSubmit: () => void;
}

export const CreateCompetitionPanel = ({
  name,
  deadline,
  description,
  onNameChange,
  onDeadlineChange,
  onDescriptionChange,
  onSubmit,
}: CreateCompetitionPanelProps) => (
  <section className="relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.12] via-white/[0.05] to-transparent p-[1px] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
    <div className="rounded-[15px] bg-[#0a2469]/50 px-5 py-6 backdrop-blur-md sm:px-7 sm:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400/25 to-amber-600/10 ring-1 ring-amber-400/25">
            <Trophy className="size-6 text-amber-200" />
          </span>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-white">Host a new league</h2>
            <p className="mt-0.5 max-w-md text-sm text-white/55">
              Name your competition, set the squad entry deadline, and invite friends to join.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="cc-name" className="text-white/75">
            League name
          </Label>
          <Input
            id="cc-name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g. Office IPL 2026"
            className="h-11 border-white/20 bg-white/10 text-white placeholder:text-white/35 focus-visible:border-amber-400/50 focus-visible:ring-amber-400/20"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cc-deadline" className="text-white/75">
            Entry deadline
          </Label>
          <Input
            id="cc-deadline"
            type="datetime-local"
            value={deadline}
            onChange={(e) => onDeadlineChange(e.target.value)}
            className="h-11 border-white/20 bg-white/10 text-white [color-scheme:dark] focus-visible:border-amber-400/50 focus-visible:ring-amber-400/20"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="cc-desc" className="text-white/75">
            Description <span className="text-white/40">(optional)</span>
          </Label>
          <Input
            id="cc-desc"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Rules, prizes, or trash-talk…"
            className="h-11 border-white/20 bg-white/10 text-white placeholder:text-white/35 focus-visible:border-amber-400/50 focus-visible:ring-amber-400/20"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button
          type="button"
          onClick={onSubmit}
          className="h-11 rounded-xl bg-white px-6 font-semibold text-[#19398a] shadow-lg hover:bg-white/90"
        >
          <PlusCircle className="mr-2 size-4" />
          Create league
        </Button>
        <p className="text-xs text-white/45">You’ll be added as the first participant automatically.</p>
      </div>
    </div>
  </section>
);
