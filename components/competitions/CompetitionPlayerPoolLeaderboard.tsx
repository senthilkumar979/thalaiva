"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { PlayerMatchScoresDialog } from "@/components/competitions/PlayerMatchScoresDialog";
import { PlayerPoolLeaderboardFilters } from "@/components/competitions/PlayerPoolLeaderboardFilters";
import { PlayerPoolLeaderboardTable } from "@/components/competitions/PlayerPoolLeaderboardTable";
import {
  filterAndSortPlayerLeaderboard,
  normalizePlayerLeaderboardResponse,
  type PlayerLeaderboardRow,
  type RoleFilter,
  type SortMode,
  type TierFilter,
} from "@/lib/playerPoolLeaderboard";

interface CompetitionPlayerPoolLeaderboardProps {
  competitionId: string;
}

export const CompetitionPlayerPoolLeaderboard = ({
  competitionId,
}: CompetitionPlayerPoolLeaderboardProps) => {
  const [rows, setRows] = useState<PlayerLeaderboardRow[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [franchiseId, setFranchiseId] = useState<string | "all">("all");
  const [role, setRole] = useState<RoleFilter>("all");
  const [tier, setTier] = useState<TierFilter>("all");
  const [sort, setSort] = useState<SortMode>("points-desc");
  const [scoreDialog, setScoreDialog] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setRows(null);
    setLoadError(false);
    fetch(`/api/competitions/${competitionId}/players/leaderboard`)
      .then(async (r) => {
        if (!r.ok) throw new Error("bad");
        const j = await r.json();
        const list = Array.isArray(j.players) ? normalizePlayerLeaderboardResponse(j.players) : [];
        if (!cancelled) setRows(list);
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(true);
          setRows([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [competitionId]);

  const franchiseOptions = useMemo(() => {
    if (!rows) return [];
    const m = new Map<string, string>();
    for (const r of rows) {
      if (r.franchise?._id) m.set(r.franchise._id, r.franchise.name);
    }
    return Array.from(m.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [rows]);

  const filtered = useMemo(
    () =>
      rows ? filterAndSortPlayerLeaderboard(rows, franchiseId, role, tier, sort) : [],
    [rows, franchiseId, role, tier, sort]
  );

  if (loadError) {
    return (
      <p className="rounded-xl border border-white/15 bg-white/[0.03] px-4 py-8 text-center text-sm text-white/70">
        Could not load player leaderboard.
      </p>
    );
  }

  if (rows === null) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
        <Loader2 className="size-9 animate-spin text-white/45" aria-hidden />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-white/15 bg-white/[0.03] px-4 py-10 text-center text-sm text-white/65">
        No active players in the pool yet.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <PlayerPoolLeaderboardFilters
        franchiseOptions={franchiseOptions}
        franchiseId={franchiseId}
        onFranchiseChange={setFranchiseId}
        role={role}
        onRoleChange={setRole}
        tier={tier}
        onTierChange={setTier}
        sort={sort}
        onSortChange={setSort}
        filteredCount={filtered.length}
        totalCount={rows.length}
      />

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-12 text-center text-sm text-white/55">
          No players match these filters.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/10 bg-black/25 p-1 backdrop-blur-sm">
          <div className="rounded-lg px-2 py-3 sm:px-4 sm:py-4">
            <PlayerPoolLeaderboardTable
              rows={filtered}
              onRowClick={(r) => setScoreDialog({ id: r._id, name: r.name })}
            />
          </div>
        </div>
      )}

      <PlayerMatchScoresDialog
        open={scoreDialog !== null}
        onOpenChange={(o) => {
          if (!o) setScoreDialog(null);
        }}
        playerId={scoreDialog?.id ?? null}
        playerName={scoreDialog?.name ?? ""}
      />
    </div>
  );
};
