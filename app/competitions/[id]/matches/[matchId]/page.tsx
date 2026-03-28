"use client";

import { useParams } from "next/navigation";
import { CompetitionMatchDetailView } from "@/components/competitions/CompetitionMatchDetailView";

export default function CompetitionMatchPage() {
  const params = useParams();
  return (
    <CompetitionMatchDetailView
      competitionId={String(params.id)}
      matchId={String(params.matchId)}
    />
  );
}
