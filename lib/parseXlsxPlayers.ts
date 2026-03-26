import * as XLSX from "xlsx";
import type { PlayerRole } from "@/models/Player";
import { mapCategoryToRole, mapValueToTier } from "@/lib/playerExcelMap";

export interface PlayerPreviewRow {
  name: string;
  franchise: string;
  tier: 1 | 3 | 5 | null;
  role: PlayerRole | null;
  errors: string[];
}

function normalizeHeader(h: string): string {
  return h.replace(/\s+/g, " ").trim().toLowerCase();
}

/** Match Excel column headers to field keys (prefers exact labels from the product spec). */
function resolveColumnKeys(headers: string[]): {
  franchise: string;
  name: string;
  category: string;
  value: string;
} | null {
  const norm = (x: string) => normalizeHeader(x);
  const exact = (label: string) => headers.find((h) => norm(h) === norm(label));
  const loose = (must: string[]) =>
    headers.find((h) => {
      const n = norm(h);
      return must.some((m) => n === norm(m) || n.includes(norm(m)));
    });

  const franchise = exact("Team Name") ?? loose(["team name", "team"]);
  const name = exact("Player Name") ?? loose(["player name", "name"]);
  const category = exact("Player Category") ?? loose(["player category", "category"]);
  const value = exact("Value") ?? loose(["value", "tier"]);

  if (!franchise || !name || !category || !value) return null;
  return { franchise, name, category, value };
}

export function parseXlsxToPlayerPreviewRows(buffer: ArrayBuffer): PlayerPreviewRow[] {
  const wb = XLSX.read(buffer, { type: "array" });
  const first = wb.SheetNames[0];
  if (!first) return [];
  const sheet = wb.Sheets[first];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: false,
  });
  if (!rows.length) return [];

  const headers = Object.keys(rows[0] ?? {});
  const keys = resolveColumnKeys(headers);
  if (!keys) {
    throw new Error(
      "Could not find columns. Expected headers like: Team Name, Player Name, Player Category, Value."
    );
  }

  const out: PlayerPreviewRow[] = [];
  for (const row of rows) {
    const name = String(row[keys.name] ?? "").trim();
    const franchise = String(row[keys.franchise] ?? "").trim();
    const catRaw = String(row[keys.category] ?? "").trim();
    const valRaw = String(row[keys.value] ?? "").trim();

    if (!name && !franchise && !catRaw && !valRaw) continue;

    const errors: string[] = [];
    const tier = mapValueToTier(valRaw);
    if (tier === null && valRaw) errors.push(`Value "${valRaw}" must be Good, Super, or Excellent`);
    if (!valRaw) errors.push("Value is required (Good / Super / Excellent)");

    const role = mapCategoryToRole(catRaw);
    if (role === null && catRaw) errors.push(`Player Category "${catRaw}" could not be mapped (bat, bowl, wk, allrounder)`);
    if (!catRaw) errors.push("Player Category is required");

    if (!name) errors.push("Player Name is required");
    if (!franchise) errors.push("Team Name is required");

    out.push({
      name,
      franchise,
      tier,
      role,
      errors,
    });
  }

  if (!out.length) throw new Error("No data rows found in the sheet");
  return out;
}

export function previewRowsToBulkPayload(
  rows: PlayerPreviewRow[]
): { name: string; franchise: string; tier: 1 | 3 | 5; role: PlayerRole }[] {
  const out: { name: string; franchise: string; tier: 1 | 3 | 5; role: PlayerRole }[] = [];
  for (const r of rows) {
    if (r.errors.length > 0 || r.tier === null || r.role === null) continue;
    out.push({
      name: r.name,
      franchise: r.franchise,
      tier: r.tier,
      role: r.role,
    });
  }
  return out;
}

export function canConfirmPreview(rows: PlayerPreviewRow[]): boolean {
  return (
    rows.length > 0 &&
    rows.every((r) => r.errors.length === 0 && r.tier !== null && r.role !== null)
  );
}
