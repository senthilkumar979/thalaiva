"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { LeaderboardTable, type LeaderboardRow } from "@/components/LeaderboardTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Competition {
  _id: string;
  name: string;
  description?: string;
  entryDeadline: string;
}

interface MyEntry {
  totalScore: number;
  customTeamName: string;
}

export default function CompetitionDetailPage() {
  const params = useParams();
  const id = String(params.id);
  const { data: session } = useSession();
  const [comp, setComp] = useState<Competition | null>(null);
  const [board, setBoard] = useState<LeaderboardRow[]>([]);
  const [mine, setMine] = useState<MyEntry | null>(null);
  const [myRank, setMyRank] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/competitions/${id}`)
      .then((r) => r.json())
      .then(setComp)
      .catch(() => undefined);
    fetch(`/api/competitions/${id}/leaderboard`)
      .then((r) => r.json())
      .then((rows: LeaderboardRow[]) => {
        setBoard(rows);
        if (session?.user?.email) {
          const me = rows.find((x) => x.user?.email === session.user?.email);
          setMyRank(me?.rank ?? null);
        }
      })
      .catch(() => undefined);
  }, [id, session?.user?.email]);

  useEffect(() => {
    if (!session?.user) return;
    fetch(`/api/competitions/${id}/entries/me`)
      .then((r) => r.json())
      .then((e) => setMine(e))
      .catch(() => undefined);
  }, [id, session?.user]);

  if (!comp) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{comp.name}</h1>
        {comp.description && <p className="text-muted-foreground">{comp.description}</p>}
        <p className="text-sm text-muted-foreground">
          Entry deadline: {new Date(comp.entryDeadline).toLocaleString()}
        </p>
      </div>
      {mine && (
        <Card>
          <CardHeader>
            <CardTitle>Your team</CardTitle>
            <CardDescription>{mine.customTeamName}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Total score</div>
              <div className="text-2xl font-semibold tabular-nums">{mine.totalScore}</div>
            </div>
            {myRank != null && (
              <div>
                <div className="text-muted-foreground">Rank</div>
                <div className="text-2xl font-semibold tabular-nums">#{myRank}</div>
              </div>
            )}
            <Link href={`/competitions/${id}/my-team`}>
              <Button variant="outline" size="sm">
                Match breakdown
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
      <div className="flex flex-wrap gap-2">
        <Link href={`/competitions/${id}/enter`}>
          <Button size="sm">Enter / edit team</Button>
        </Link>
        <Link href={`/competitions/${id}/my-team`}>
          <Button size="sm" variant="secondary">
            My team matches
          </Button>
        </Link>
      </div>
      <div>
        <h2 className="mb-2 text-lg font-medium">Leaderboard</h2>
        <LeaderboardTable rows={board} highlightEmail={session?.user?.email ?? null} />
      </div>
    </div>
  );
}
