import { ScoringRulesPointBadge } from "@/components/competitions/ScoringRulesPointBadge";
import { FANTASY_SCORING_POINT_VALUES as P } from "@/lib/updatedScoring";

const haulSum3 = P.HAUL_3W;
const haulSum35 = P.HAUL_3W + P.HAUL_5W;
const haulSumAll = P.HAUL_3W + P.HAUL_5W + P.HAUL_6W;

export const WicketHaulsCallout = () => (
  <div className="mt-4 rounded-lg border border-amber-200/80 bg-amber-50/90 p-4 text-sm text-slate-800">
    <div className="mb-2 flex flex-wrap items-center gap-2">
      <span className="font-semibold text-slate-900">Wicket hauls</span>
      <ScoringRulesPointBadge>+{P.HAUL_3W}</ScoringRulesPointBadge>
      <span className="text-slate-500">·</span>
      <ScoringRulesPointBadge>+{P.HAUL_5W}</ScoringRulesPointBadge>
      <span className="text-slate-500">·</span>
      <ScoringRulesPointBadge>+{P.HAUL_6W}</ScoringRulesPointBadge>
    </div>
    <p className="mb-3 leading-relaxed text-slate-700">
      Three separate bonuses based on <strong>total wickets</strong> taken in the innings (by that bowler). Each tier is
      checked independently, and <strong>all that apply are added together</strong> (they stack).
    </p>
    <ul className="mb-3 list-inside list-disc space-y-1.5 text-slate-700">
      <li>
        <strong>3+ wickets:</strong> <ScoringRulesPointBadge className="inline-flex">+{P.HAUL_3W}</ScoringRulesPointBadge> once
        your wicket count reaches 3.
      </li>
      <li>
        <strong>5+ wickets:</strong> <ScoringRulesPointBadge className="inline-flex">+{P.HAUL_5W}</ScoringRulesPointBadge> once
        your wicket count reaches 5 (you also keep the 3+ bonus).
      </li>
      <li>
        <strong>6+ wickets:</strong> <ScoringRulesPointBadge className="inline-flex">+{P.HAUL_6W}</ScoringRulesPointBadge> once
        your wicket count reaches 6 (you also keep the 3+ and 5+ bonuses).
      </li>
    </ul>
    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Examples</p>
    <ul className="space-y-1.5 text-sm text-slate-700">
      <li>
        <span className="font-medium tabular-nums">2 wickets</span> → below every tier → haul bonus{" "}
        <span className="font-semibold tabular-nums text-slate-900">0</span>.
      </li>
      <li>
        <span className="font-medium tabular-nums">4 wickets</span> → only 3+ applies →{" "}
        <ScoringRulesPointBadge className="inline-flex">+{haulSum3}</ScoringRulesPointBadge>.
      </li>
      <li>
        <span className="font-medium tabular-nums">5 wickets</span> → 3+ and 5+ apply →{" "}
        <ScoringRulesPointBadge className="inline-flex">+{haulSum35}</ScoringRulesPointBadge> ({P.HAUL_3W} + {P.HAUL_5W}).
      </li>
      <li>
        <span className="font-medium tabular-nums">6+ wickets (e.g. 6 or 7)</span> → all three apply →{" "}
        <ScoringRulesPointBadge className="inline-flex">+{haulSumAll}</ScoringRulesPointBadge> ({P.HAUL_3W} + {P.HAUL_5W} +{" "}
        {P.HAUL_6W}).
      </li>
    </ul>
    <p className="mt-3 text-xs text-slate-600">
      Haul bonuses are on top of per-wicket, dot, maiden, economy, and hat-trick points for the same spell.
    </p>
  </div>
);
