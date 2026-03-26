import type { LucideIcon } from "lucide-react";
import { CircleDot, CircleUser, Layers2, Zap } from "lucide-react";
import type { PlayerRole } from "@/models/Player";

export const PLAYER_ROLE_UI: Record<PlayerRole, { label: string; Icon: LucideIcon }> = {
  bat: { label: "Batter", Icon: Zap },
  bowl: { label: "Bowler", Icon: CircleDot },
  allrounder: { label: "All-rounder", Icon: Layers2 },
  wk: { label: "Wicket-keeper", Icon: CircleUser },
};
