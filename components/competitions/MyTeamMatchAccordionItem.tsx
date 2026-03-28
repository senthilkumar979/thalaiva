import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { MyTeamMatchRow } from "@/lib/myTeamMatchRows";
import { formatVenueLabel } from "@/lib/matchVenue";

interface MyTeamMatchAccordionItemProps {
  competitionId: string;
  row: MyTeamMatchRow;
}

export const MyTeamMatchAccordionItem = ({ competitionId, row }: MyTeamMatchAccordionItemProps) => {
  const { match } = row;
  const fa = match.franchiseA?.shortCode ?? "—";
  const fb = match.franchiseB?.shortCode ?? "—";
  const label = `#${match.matchNumber} · ${fa} vs ${fb}`;
  const sub = `${new Date(match.date).toLocaleDateString()} · ${formatVenueLabel(match.venue)}`;
  const sorted = [...row.playersWithPoints].sort((a, b) => b.captainMultiplied - a.captainMultiplied);
  const rankLabel = row.rankThisMatch != null ? `#${row.rankThisMatch}` : "—";

  return (
    <details className="group rounded-xl border border-white/15 bg-white/5 text-white open:bg-white/[0.07]">
      <summary className="cursor-pointer list-none px-4 py-3 pr-10 [&::-webkit-details-marker]:hidden">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-white">{label}</span>
              {!match.isScored ? (
                <Badge variant="secondary" className="border-white/20 bg-white/10 text-[10px] text-white/80">
                  Not scored
                </Badge>
              ) : null}
            </div>
            <p className="text-xs text-white/55">{sub}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-0.5 text-right text-xs sm:flex-row sm:items-center sm:gap-4 sm:text-sm">
            <div>
              <span className="text-white/45">Pts</span>{" "}
              <span className="font-semibold tabular-nums text-amber-200/95">{row.totalPointsThisMatch}</span>
            </div>
            <div>
              <span className="text-white/45">Rank</span>{" "}
              <span className="font-semibold tabular-nums text-white">{rankLabel}</span>
            </div>
            <div>
              <span className="text-white/45">Total</span>{" "}
              <span className="font-semibold tabular-nums text-white">{row.cumulative}</span>
            </div>
          </div>
        </div>
      </summary>
      <div className="border-t border-white/10 px-4 pb-4 pt-3">
        {sorted.length === 0 ? (
          <p className="text-center text-sm text-white/60">
            {match.isScored
              ? "No fantasy points from your squad this match (players may have scored 0 or did not play)."
              : "Points appear after this match is scored by admin."}
          </p>
        ) : (
          <ul className="space-y-2">
            {sorted.map((r) => {
              const inner = (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-white">{r.player.name || "Player"}</span>
                      {r.isCaptain ? (
                        <Badge className="border-amber-400/30 bg-amber-500/20 text-[10px] text-amber-100">
                          Captain ×2
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-[11px] text-white/50">
                      {r.player.franchise?.shortCode ?? "—"}
                      {r.player.role ? ` · ${r.player.role}` : ""}
                    </p>
                  </div>
                  <div className="shrink-0 text-right text-sm">
                    <span className="tabular-nums text-white/70">{r.rawPoints}</span>
                    <span className="mx-1 text-white/35">→</span>
                    <span className="font-semibold tabular-nums text-amber-200/95">{r.captainMultiplied}</span>
                  </div>
                </div>
              );
              return (
                <li key={r.player._id}>
                  {match.isScored ? (
                    <Link
                      href={`/competitions/${competitionId}/my-team?player=${encodeURIComponent(r.player._id)}&match=${encodeURIComponent(match._id)}`}
                      className="block transition-colors hover:opacity-90"
                      scroll={false}
                    >
                      {inner}
                    </Link>
                  ) : (
                    inner
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </details>
  );
};
