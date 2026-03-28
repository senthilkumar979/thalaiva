import Link from "next/link";
import { FANTASY_SCORING_POINT_VALUES as P } from "@/lib/updatedScoring";

export const AdminScoreSheetGuide = () => (
  <section className="rounded-2xl border border-border/60 bg-muted/25 px-5 py-5 sm:px-6">
    <h2 className="text-sm font-semibold tracking-tight text-foreground">How this sheet works</h2>
    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
      Same logic as{" "}
      <Link
        href="/competitions"
        className="font-medium text-primary underline-offset-4 hover:underline"
      >
        each competition&apos;s Scoring rules
      </Link>
      : fantasy points are per player, per match. Only players in the{" "}
      <strong className="font-medium text-foreground">playing XI</strong> (including{" "}
      <strong className="font-medium text-foreground">Impact Player</strong>) earn points — check{" "}
      <strong className="font-medium text-foreground">Played in XI</strong> first (+{P.XI_PARTICIPATION}{" "}
      pts), then fill batting, bowling, and fielding.
    </p>
    <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground marker:font-medium marker:text-foreground">
      <li>Open <strong className="text-foreground">Home</strong> or <strong className="text-foreground">Away</strong> and expand a player.</li>
      <li>Enable <strong className="text-foreground">Played in XI</strong> to unlock the stat grid.</li>
      <li>Save when done — you can edit later; entry totals update automatically.</li>
    </ol>
  </section>
);
