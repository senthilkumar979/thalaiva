"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function RedirectMyTeamPlayerMatchPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);
  const matchId = String(params.matchId);
  const playerId = String(params.playerId);

  useEffect(() => {
    router.replace(`/competitions/${id}/my-team/matches/${matchId}?player=${encodeURIComponent(playerId)}`);
  }, [id, matchId, playerId, router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Loader2 className="size-10 animate-spin text-muted-foreground" aria-hidden />
    </div>
  );
}
