"use client";

import { useParams } from "next/navigation";
import { SwapPageClient } from "@/components/swaps/SwapPageClient";

export default function CompetitionSwapsPage() {
  const params = useParams();
  return <SwapPageClient competitionId={String(params.id)} />;
}
