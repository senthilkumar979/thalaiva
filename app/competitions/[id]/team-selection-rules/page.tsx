"use client";

import { useParams } from "next/navigation";
import { CompetitionTeamSelectionRulesView } from "@/components/competitions/CompetitionTeamSelectionRulesView";

export default function CompetitionTeamSelectionRulesPage() {
  const params = useParams();
  return <CompetitionTeamSelectionRulesView competitionId={String(params.id)} />;
}
