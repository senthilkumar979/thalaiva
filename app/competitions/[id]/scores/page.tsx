"use client";

import { useParams } from "next/navigation";
import { CompetitionScoresView } from "@/components/competitions/CompetitionScoresView";

export default function CompetitionScoresPage() {
  const params = useParams();
  const id = String(params.id);
  return <CompetitionScoresView competitionId={id} />;
}
