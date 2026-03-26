"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { TeamBuilder } from "@/components/TeamBuilder";

interface Competition {
  entryDeadline: string;
}

export default function EnterCompetitionPage() {
  const params = useParams();
  const id = String(params.id);
  const { status } = useSession();
  const [comp, setComp] = useState<Competition | null>(null);

  useEffect(() => {
    fetch(`/api/competitions/${id}`)
      .then((r) => r.json())
      .then(setComp)
      .catch(() => undefined);
  }, [id]);

  if (status === "unauthenticated") {
    return <p className="text-sm text-muted-foreground">Please log in to enter this competition.</p>;
  }

  if (!comp) return <p className="text-sm text-muted-foreground">Loading…</p>;

  const deadlinePassed = new Date() > new Date(comp.entryDeadline);

  return <TeamBuilder competitionId={id} deadlinePassed={deadlinePassed} />;
}
