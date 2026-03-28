import { cn } from "@/lib/utils";

interface LeaderboardRankBadgeProps {
  rank: number;
  competition: boolean;
}

export const LeaderboardRankBadge = ({ rank, competition }: LeaderboardRankBadgeProps) => {
  if (!competition) return <>{rank}</>;
  const top =
    rank === 1
      ? "bg-amber-400/20 text-amber-100 ring-amber-400/35"
      : rank === 2
        ? "bg-slate-300/15 text-slate-100 ring-slate-400/25"
        : rank === 3
          ? "bg-orange-400/15 text-orange-100 ring-orange-400/30"
          : "bg-white/[0.06] text-white/75 ring-white/10";
  return (
    <span
      className={cn(
        "inline-flex min-w-9 justify-center rounded-lg px-2 py-1 text-sm font-bold tabular-nums ring-1",
        top
      )}
    >
      {rank}
    </span>
  );
};
