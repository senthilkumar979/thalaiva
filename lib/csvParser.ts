import Papa from "papaparse";
import { z } from "zod";
import type { PlayerRole } from "@/models/Player";

const RowSchema = z.object({
  name: z.string().min(1),
  franchise: z.string().min(1),
  tier: z.coerce.number().refine((n) => n === 1 || n === 3 || n === 5),
  role: z.enum(["bat", "bowl", "allrounder", "wk"]),
});

export interface ParsedPlayerRow {
  name: string;
  franchise: string;
  tier: 1 | 3 | 5;
  role: PlayerRole;
}

export function parsePlayerCsv(csvText: string): ParsedPlayerRow[] {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });
  if (parsed.errors.length) throw new Error(parsed.errors[0]?.message ?? "CSV parse error");
  const rows: ParsedPlayerRow[] = [];
  for (const row of parsed.data) {
    const normalized = {
      name: row.name?.trim() ?? row.Name?.trim(),
      franchise: row.franchise?.trim() ?? row.Franchise?.trim(),
      tier: row.tier ?? row.Tier,
      role: (row.role ?? row.Role)?.trim().toLowerCase(),
    };
    const r = RowSchema.safeParse(normalized);
    if (!r.success) continue;
    rows.push(r.data);
  }
  if (!rows.length) throw new Error("No valid rows in CSV");
  return rows;
}
