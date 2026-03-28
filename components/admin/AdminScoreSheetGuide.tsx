import Link from "next/link";
import { FANTASY_SCORING_POINT_VALUES as P } from "@/lib/updatedScoring";

export const AdminScoreSheetGuide = () => (
  <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-transparent px-5 py-5 shadow-inner sm:px-6">
    <h2 className="text-sm font-semibold tracking-tight text-white">How this sheet works</h2>
    <p className="mt-2 text-sm leading-relaxed text-white/70">
      Same logic as{" "}
      <Link href="/competitions" className="font-medium text-amber-200/95 underline-offset-4 hover:underline">
        each competition&apos;s Scoring rules
      </Link>
      : fantasy points are per player, per match. Only players in the{" "}
      <strong className="font-medium text-white">playing XI</strong> (including{" "}
      <strong className="font-medium text-white">Impact Player</strong>) earn points — check{" "}
      <strong className="font-medium text-white">Played in XI</strong> first (+{P.XI_PARTICIPATION} pts), then fill
      batting, bowling, and fielding.
    </p>
    <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-white/65 marker:font-medium marker:text-white/90">
      <li>
        Open <strong className="text-white">Home</strong> or <strong className="text-white">Away</strong> and expand a
        player.
      </li>
      <li>
        Enable <strong className="text-white">Played in XI</strong> to unlock the stat grid.
      </li>
      <li>Save when done — you can edit later; entry totals update automatically.</li>
    </ol>
  </section>
);
