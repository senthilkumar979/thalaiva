import type { IBattingStats, IBowlingStats, IFieldingStats } from "@/models/PlayerMatchScore";
import { formatVenueLabel } from "@/lib/matchVenue";

export interface MatchScorePlayerRow {
  playerId: string;
  name: string;
  role: string;
  franchiseShortCode: string;
  side: "a" | "b";
  Batting: IBattingStats;
  Bowling: IBowlingStats;
  Fielding: IFieldingStats;
  participated: boolean;
  fantasyPoints: number;
  sectionPoints: {
    batting: number;
    bowling: number;
    fielding: number;
    participation: number;
  };
}

interface FranchiseLite {
  _id: string;
  name: string;
  shortCode: string;
  logoUrl?: string;
}

interface MatchMeta {
  _id: string;
  matchNumber: number;
  date: string;
  venue: string;
  isScored: boolean;
}

export interface MatchScoreBlock {
  match: MatchMeta;
  franchiseA: FranchiseLite;
  franchiseB: FranchiseLite;
  players: MatchScorePlayerRow[];
}

function sortByPoints(players: MatchScorePlayerRow[]) {
  return [...players].sort((a, b) => b.fantasyPoints - a.fantasyPoints);
}

function PlayerScoreButton({
  row,
  onSelect,
}: {
  row: MatchScorePlayerRow;
  onSelect: () => void;
}) {
  const { sectionPoints: s } = row;
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full rounded-lg border border-slate-200/90 bg-white px-3 py-2.5 text-left text-slate-900 shadow-sm transition-colors hover:bg-slate-50"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium leading-tight">{row.name}</p>
          <p className="text-[11px] text-slate-600">
            {row.franchiseShortCode} · {row.role}
          </p>
        </div>
        <span className="shrink-0 text-lg font-bold tabular-nums text-[#19398a]">{row.fantasyPoints}</span>
      </div>
      <div className="mt-2 grid grid-cols-4 gap-1 border-t border-slate-200 pt-2 text-[10px] uppercase tracking-wide text-slate-500">
        <div>
          <span className="block text-[9px]">Bat</span>
          <span className="font-semibold tabular-nums text-slate-900">{s.batting}</span>
        </div>
        <div>
          <span className="block text-[9px]">Bowl</span>
          <span className="font-semibold tabular-nums text-slate-900">{s.bowling}</span>
        </div>
        <div>
          <span className="block text-[9px]">Fld</span>
          <span className="font-semibold tabular-nums text-slate-900">{s.fielding}</span>
        </div>
        <div>
          <span className="block text-[9px]">XI</span>
          <span className="font-semibold tabular-nums text-slate-900">{s.participation}</span>
        </div>
      </div>
    </button>
  );
}

function MatchAccordionBlock({
  block,
  onPlayer,
}: {
  block: MatchScoreBlock;
  onPlayer: (row: MatchScorePlayerRow, matchTitle: string) => void;
}) {
  const { match, franchiseA, franchiseB, players } = block;
  const teamA = sortByPoints(players.filter((p) => p.side === "a"));
  const teamB = sortByPoints(players.filter((p) => p.side === "b"));
  const title = `Match ${match.matchNumber} · ${new Date(match.date).toLocaleDateString()} · ${formatVenueLabel(match.venue)}`;

  return (
    <details className="group rounded-xl border border-white/15 bg-white/5 text-white open:bg-white/[0.07]">
      <summary className="cursor-pointer list-none px-4 py-3 pr-10 [&::-webkit-details-marker]:hidden">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-semibold">
            #{match.matchNumber}{" "}
            <span className="font-normal text-white/70">
              {franchiseA.shortCode} vs {franchiseB.shortCode}
            </span>
          </span>
          <span className="text-xs text-white/55">{new Date(match.date).toLocaleDateString()}</span>
        </div>
        <p className="mt-1 text-xs text-white/50">
          {formatVenueLabel(match.venue)} · {players.length} players scored
        </p>
      </summary>
      <div className="border-t border-white/10 px-3 pb-4 pt-2">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-wider text-amber-200/80">
              {franchiseA.shortCode}
            </p>
            <div className="space-y-2">
              {teamA.length === 0 ? (
                <p className="text-center text-sm text-white/50">No scores</p>
              ) : (
                teamA.map((row) => (
                  <PlayerScoreButton key={row.playerId} row={row} onSelect={() => onPlayer(row, title)} />
                ))
              )}
            </div>
          </div>
          <div>
            <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-wider text-sky-200/80">
              {franchiseB.shortCode}
            </p>
            <div className="space-y-2">
              {teamB.length === 0 ? (
                <p className="text-center text-sm text-white/50">No scores</p>
              ) : (
                teamB.map((row) => (
                  <PlayerScoreButton key={row.playerId} row={row} onSelect={() => onPlayer(row, title)} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </details>
  );
}

interface CompetitionMatchScoresAccordionProps {
  blocks: MatchScoreBlock[];
  onPlayer: (row: MatchScorePlayerRow, matchTitle: string) => void;
}

export const CompetitionMatchScoresAccordion = ({ blocks, onPlayer }: CompetitionMatchScoresAccordionProps) => (
  <div className="space-y-3">
    {blocks.map((block) => (
      <MatchAccordionBlock key={block.match._id} block={block} onPlayer={onPlayer} />
    ))}
  </div>
);
