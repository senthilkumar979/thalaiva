export interface SquadRoleCounts {
  bat: number;
  bowl: number;
  wk: number;
  allrounder: number;
}

export const SQUAD_RULES = {
  minBat: 3,
  minBowl: 3,
  minWk: 2,
  maxAllrounder: 3,
} as const;

export function countRolesFromIds(
  ids: string[],
  playerById: Map<string, { role: string }>
): SquadRoleCounts {
  const c: SquadRoleCounts = { bat: 0, bowl: 0, wk: 0, allrounder: 0 };
  for (const id of ids) {
    const p = playerById.get(id);
    if (!p) continue;
    const r = p.role;
    if (r === "bat" || r === "bowl" || r === "wk" || r === "allrounder") c[r]++;
  }
  return c;
}

export function countRolesFromPlayerDocs(
  players: { role: string }[]
): SquadRoleCounts {
  const c: SquadRoleCounts = { bat: 0, bowl: 0, wk: 0, allrounder: 0 };
  for (const p of players) {
    const r = p.role;
    if (r === "bat" || r === "bowl" || r === "wk" || r === "allrounder") c[r]++;
  }
  return c;
}

export function squadCompositionSatisfied(c: SquadRoleCounts): boolean {
  return (
    c.bat >= SQUAD_RULES.minBat &&
    c.bowl >= SQUAD_RULES.minBowl &&
    c.wk >= SQUAD_RULES.minWk &&
    c.allrounder <= SQUAD_RULES.maxAllrounder
  );
}

export function squadCompositionMessages(c: SquadRoleCounts): string[] {
  const msgs: string[] = [];
  if (c.bat < SQUAD_RULES.minBat)
    msgs.push(`Need ${SQUAD_RULES.minBat - c.bat} more batter(s) (min ${SQUAD_RULES.minBat})`);
  if (c.bowl < SQUAD_RULES.minBowl)
    msgs.push(`Need ${SQUAD_RULES.minBowl - c.bowl} more bowler(s) (min ${SQUAD_RULES.minBowl})`);
  if (c.wk < SQUAD_RULES.minWk)
    msgs.push(`Need ${SQUAD_RULES.minWk - c.wk} more wicket-keeper(s) (min ${SQUAD_RULES.minWk})`);
  if (c.allrounder > SQUAD_RULES.maxAllrounder)
    msgs.push(`At most ${SQUAD_RULES.maxAllrounder} all-rounders (you have ${c.allrounder})`);
  return msgs;
}

export type RoleFilterValue = "all" | "bat" | "bowl" | "wk" | "allrounder";

export const ROLE_FILTER_OPTIONS: { value: RoleFilterValue; label: string }[] = [
  { value: "all", label: "All roles" },
  { value: "bat", label: "Batters" },
  { value: "bowl", label: "Bowlers" },
  { value: "wk", label: "Wicket-keepers" },
  { value: "allrounder", label: "All-rounders" },
];
