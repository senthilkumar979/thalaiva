import type { Session } from "next-auth";

/** When true, leaderboard and rosters show all teams. Admins always see all. */
export function shouldRevealAllTeams(
  entriesFrozen: boolean | undefined,
  session: Session | null
): boolean {
  if (session?.user?.role === "admin") return true;
  return entriesFrozen === true;
}
