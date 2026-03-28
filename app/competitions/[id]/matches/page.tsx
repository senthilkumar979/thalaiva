"use client";

import { useParams } from "next/navigation";
import { CompetitionMatchesListView } from "@/components/competitions/CompetitionMatchesListView";

export default function CompetitionMatchesPage() {
  const params = useParams();
  return <CompetitionMatchesListView competitionId={String(params.id)} />;
}
