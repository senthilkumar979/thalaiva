import { Loader2 } from "lucide-react";
import { MyTeamMatchAccordionItem } from "@/components/competitions/MyTeamMatchAccordionItem";
import type { MyTeamMatchRow } from "@/lib/myTeamMatchRows";

interface MyTeamMatchLogSectionProps {
  competitionId: string;
  rows: MyTeamMatchRow[];
  hasTeam: boolean;
  matchesLoading?: boolean;
}

export const MyTeamMatchLogSection = ({
  competitionId,
  rows,
  hasTeam,
  matchesLoading = false,
}: MyTeamMatchLogSectionProps) => {
  if (!hasTeam) {
    return (
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">Match log</h2>
        <p className="rounded-xl border border-white/15 bg-white/5 px-4 py-8 text-center text-sm text-white/70">
          Submit a team to see every fixture and your fantasy points by match.
        </p>
      </section>
    );
  }

  if (matchesLoading) {
    return (
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">Match log</h2>
        <div className="flex min-h-[140px] items-center justify-center rounded-xl border border-white/15 bg-white/5">
          <Loader2 className="size-8 animate-spin text-white/50" aria-hidden />
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">Match log</h2>
      {rows.length === 0 ? (
        <p className="rounded-xl border border-white/15 bg-white/5 px-4 py-8 text-center text-sm text-white/70">
          No fixtures scheduled yet.
        </p>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <MyTeamMatchAccordionItem key={r.match._id} competitionId={competitionId} row={r} />
          ))}
        </div>
      )}
    </section>
  );
};
