"use client";

import { useParams } from "next/navigation";
import { CompetitionScoringRulesView } from "@/components/competitions/CompetitionScoringRulesView";

export default function CompetitionScoringRulesPage() {
  const params = useParams();
  return <CompetitionScoringRulesView competitionId={String(params.id)} />;
}
