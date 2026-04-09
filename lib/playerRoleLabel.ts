type KnownRole = "bat" | "bowl" | "wk" | "allrounder";

const LABELS: Record<KnownRole, string> = {
  bat: "Batter",
  bowl: "Bowler",
  wk: "Wicket-keeper",
  allrounder: "All-rounder",
};

export function playerRoleLabel(role: string): string {
  if (role in LABELS) return LABELS[role as KnownRole];
  return role;
}

export function playerRoleShort(role: string): string {
  if (!role) return "";

  const m: Record<string, string> = {
    bat: "BAT",
    bowl: "BOWL",
    wk: "WK",
    allrounder: "AR",
  };
  return m[role] ?? role.toUpperCase().slice(0, 4);
}
