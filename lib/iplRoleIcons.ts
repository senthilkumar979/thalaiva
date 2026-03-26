/** IPL T20 role artwork (official site). */
export const IPL_ROLE_ICON_SVG = {
  bat: "https://www.iplt20.com/assets/images/teams-batsman-icon.svg",
  bowl: "https://www.iplt20.com/assets/images/teams-bowler-icon.svg",
  allrounder: "https://www.iplt20.com/assets/images/teams-all-rounder-icon.svg",
  wk: "https://www.iplt20.com/assets/images/teams-wicket-keeper-icon.svg",
} as const;

export type KnownPlayerRole = keyof typeof IPL_ROLE_ICON_SVG;

export function getIplRoleIconUrl(role: string): string | null {
  const r = role.toLowerCase().trim();
  if (r in IPL_ROLE_ICON_SVG) return IPL_ROLE_ICON_SVG[r as KnownPlayerRole];
  return null;
}
