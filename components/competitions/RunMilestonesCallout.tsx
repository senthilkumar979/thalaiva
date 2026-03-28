import { ScoringRulesPointBadge } from "@/components/competitions/ScoringRulesPointBadge";
import { FANTASY_SCORING_POINT_VALUES as P } from "@/lib/updatedScoring";

export const RunMilestonesCallout = () => (
  <div className="mt-4 rounded-lg border border-amber-200/80 bg-amber-50/90 p-4 text-sm text-slate-800">
    <div className="mb-2 flex flex-wrap items-center gap-2">
      <span className="font-semibold text-slate-900">Run milestones</span>
      <ScoringRulesPointBadge>+{P.MILESTONE_30}</ScoringRulesPointBadge>
      <span className="text-slate-500">·</span>
      <ScoringRulesPointBadge>+{P.MILESTONE_50}</ScoringRulesPointBadge>
      <span className="text-slate-500">·</span>
      <ScoringRulesPointBadge>+{P.MILESTONE_100}</ScoringRulesPointBadge>
    </div>
    <p className="mb-3 leading-relaxed text-slate-700">
      Three separate bonuses based on <strong>total runs</strong> in the innings. Each tier is checked independently, and{" "}
      <strong>all that apply are added together</strong> (they stack).
    </p>
    <ul className="mb-3 list-inside list-disc space-y-1.5 text-slate-700">
      <li>
        <strong>30+ runs:</strong> <ScoringRulesPointBadge className="inline-flex">+{P.MILESTONE_30}</ScoringRulesPointBadge>{" "}
        once your total reaches 30.
      </li>
      <li>
        <strong>50+ runs:</strong> <ScoringRulesPointBadge className="inline-flex">+{P.MILESTONE_50}</ScoringRulesPointBadge>{" "}
        once your total reaches 50 (you also keep the 30+ bonus).
      </li>
      <li>
        <strong>100+ runs:</strong> <ScoringRulesPointBadge className="inline-flex">+{P.MILESTONE_100}</ScoringRulesPointBadge>{" "}
        once your total reaches 100 (you also keep the 30+ and 50+ bonuses).
      </li>
    </ul>
    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Examples</p>
    <ul className="space-y-1.5 text-sm text-slate-700">
      <li>
        <span className="font-medium tabular-nums">42 runs</span> → only 30+ applies → milestone subtotal{" "}
        <ScoringRulesPointBadge className="inline-flex">+{P.MILESTONE_30}</ScoringRulesPointBadge>.
      </li>
      <li>
        <span className="font-medium tabular-nums">85 runs</span> → 30+ and 50+ apply →{" "}
        <ScoringRulesPointBadge className="inline-flex">+{P.MILESTONE_30 + P.MILESTONE_50}</ScoringRulesPointBadge> (
        {P.MILESTONE_30} + {P.MILESTONE_50}).
      </li>
      <li>
        <span className="font-medium tabular-nums">100+ runs (e.g. 102)</span> → all three apply →{" "}
        <ScoringRulesPointBadge className="inline-flex">+{P.MILESTONE_30 + P.MILESTONE_50 + P.MILESTONE_100}</ScoringRulesPointBadge>{" "}
        ({P.MILESTONE_30} + {P.MILESTONE_50} + {P.MILESTONE_100}).
      </li>
    </ul>
    <p className="mt-3 text-xs text-slate-600">
      Milestone points are on top of per-run, four, and six scoring for the same balls.
    </p>
  </div>
);
