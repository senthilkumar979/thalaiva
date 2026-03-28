import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type { LeaderboardRow } from "@/components/LeaderboardTable";
import type { MyTeamMatchRow } from "@/lib/myTeamMatchRows";

export type { MyTeamMatchRow } from "@/lib/myTeamMatchRows";

interface CompetitionLite {
  name?: string;
  entryDeadline: string;
  entriesFrozen?: boolean;
}

interface MyEntry {
  customTeamName?: string;
  totalScore?: number;
}

export function useMyTeamPageData(competitionId: string) {
  const { data: session, status } = useSession();
  const [rows, setRows] = useState<MyTeamMatchRow[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [comp, setComp] = useState<CompetitionLite | null>(null);
  const [myEntry, setMyEntry] = useState<MyEntry | null>(null);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      setReady(true);
      return;
    }
    if (status !== "authenticated") return;
    let cancelled = false;
    (async () => {
      try {
        const cRes = await fetch(`/api/competitions/${competitionId}`);
        const cData = await cRes.json();
        if (!cRes.ok) {
          if (!cancelled) {
            setLoadError(true);
            setComp(null);
          }
          return;
        }
        const eRes = await fetch(`/api/competitions/${competitionId}/entries/me`);
        const eData = eRes.ok ? await eRes.json() : null;
        if (cancelled) return;
        setComp(cData as CompetitionLite);
        setMyEntry(eData);
        setLoadError(false);
      } catch {
        if (!cancelled) {
          setLoadError(true);
          setComp(null);
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [competitionId, status]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.email || !comp) return;
    let cancelled = false;
    fetch(`/api/competitions/${competitionId}/leaderboard`)
      .then((r) => r.json())
      .then((board: LeaderboardRow[]) => {
        if (cancelled || !Array.isArray(board)) return;
        const me = board.find((x) => x.user?.email === session.user?.email);
        setMyRank(me?.rank ?? null);
      })
      .catch(() => setMyRank(null));
    return () => {
      cancelled = true;
    };
  }, [competitionId, status, comp, session?.user?.email]);

  useEffect(() => {
    if (status !== "authenticated") {
      setMatchesLoading(false);
      setRows([]);
      return;
    }
    let cancelled = false;
    setMatchesLoading(true);
    fetch(`/api/competitions/${competitionId}/entries/me/matches`)
      .then(async (r) => {
        const data = await r.json();
        if (cancelled) return;
        if (Array.isArray(data)) setRows(data);
        else setRows([]);
      })
      .catch(() => {
        if (!cancelled) setRows([]);
      })
      .finally(() => {
        if (!cancelled) setMatchesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [competitionId, status]);

  return {
    rows,
    matchesLoading,
    comp,
    myEntry,
    myRank,
    ready,
    loadError,
    session,
    status,
  };
}
