/** True when no new or updated entries are allowed (admin freeze or deadline passed). */
export function areCompetitionEntriesClosed(
  entriesFrozen: boolean | undefined,
  entryDeadline: string | Date
): boolean {
  return entriesFrozen === true || new Date() > new Date(entryDeadline);
}
