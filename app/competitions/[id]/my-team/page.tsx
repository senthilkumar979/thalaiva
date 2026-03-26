"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { CompetitionBreadcrumb } from "@/components/competitions/CompetitionBreadcrumb";
import { TeamBuilder } from "@/components/TeamBuilder";
import { MatchRow } from "@/components/MatchRow";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCompetitionName } from "@/hooks/useCompetitionName";
import { cn } from "@/lib/utils";

interface MatchRowData {
  match: {
    _id: string;
    matchNumber: number;
    date: string;
    venue: string;
  };
  totalPointsThisMatch: number;
  rankThisMatch: number;
  cumulative: number;
}

interface CompetitionLite {
  entryDeadline: string;
  entriesFrozen?: boolean;
}

const THEME_BG = "#19398a";

export default function MyTeamMatchesPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = String(params.id);
  const editParam = searchParams.get("edit") === "1";
  const { status } = useSession();
  const compName = useCompetitionName(id);
  const [rows, setRows] = useState<MatchRowData[]>([]);
  const [comp, setComp] = useState<CompetitionLite | null>(null);
  const [myEntry, setMyEntry] = useState<{ customTeamName?: string } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      setReady(true);
      return;
    }
    if (status !== "authenticated") return;
    let cancelled = false;
    Promise.all([
      fetch(`/api/competitions/${id}`).then((r) => r.json()),
      fetch(`/api/competitions/${id}/entries/me`).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([c, e]) => {
        if (cancelled) return;
        setComp(c as CompetitionLite);
        setMyEntry(e);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [id, status]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch(`/api/competitions/${id}/entries/me/matches`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setRows(data);
      })
      .catch(() => undefined);
  }, [id, status]);

  if (status === "loading" || (status === "authenticated" && !ready)) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <p className="text-sm text-muted-foreground">Log in to view your team breakdown.</p>;
  }

  const entriesClosed =
    !comp ||
    comp.entriesFrozen === true ||
    new Date() > new Date(comp.entryDeadline);
  const entriesOpen = Boolean(comp && !entriesClosed);
  const hasTeam = Boolean(myEntry?.customTeamName);
  const showSquadEditor = editParam && entriesOpen && hasTeam;

  const squadShell = (children: React.ReactNode) => (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/10 px-2 py-8 text-white shadow-2xl sm:px-8 sm:py-10"
      style={{ backgroundColor: THEME_BG }}
    >
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-[#0c1f5c]/80 blur-3xl" />
      <div className="relative mx-auto max-w-10xl">{children}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <CompetitionBreadcrumb
        variant="light"
        items={[
          { label: "Home", href: "/" },
          { label: "Competitions", href: "/competitions" },
          { label: compName ?? "League", href: `/competitions/${id}` },
          { label: "My team" },
        ]}
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">My team — matches</h1>
          <p className="text-muted-foreground">Points and ranks update after each scored match.</p>
        </div>
        {entriesOpen && hasTeam && (
          <Link
            href={editParam ? `/competitions/${id}/my-team` : `/competitions/${id}/my-team?edit=1`}
            className={cn(buttonVariants({ variant: editParam ? "secondary" : "default" }))}
          >
            {editParam ? "Done editing" : "Edit squad"}
          </Link>
        )}
      </div>

      {!hasTeam && (
        <p className="text-muted-foreground">
          You have not submitted a team yet.{" "}
          <Link href={`/competitions/${id}/enter`} className="text-primary underline">
            Enter the competition
          </Link>
        </p>
      )}

      {editParam && hasTeam && entriesClosed && (
        <p className="text-sm text-muted-foreground">
          Entries are closed — your squad can no longer be edited.
        </p>
      )}

      {showSquadEditor &&
        squadShell(
          <TeamBuilder
            competitionId={id}
            entriesClosed={false}
            afterSaveRedirectTo={`/competitions/${id}/my-team`}
          />
        )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Match</TableHead>
            <TableHead className="text-right">Pts</TableHead>
            <TableHead className="text-right">Rank</TableHead>
            <TableHead className="text-right">Cumulative</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <MatchRow
              key={String(r.match._id)}
              competitionId={id}
              matchId={String(r.match._id)}
              label={`#${r.match.matchNumber} — ${new Date(r.match.date).toLocaleDateString()} @ ${r.match.venue}`}
              points={r.totalPointsThisMatch}
              rank={r.rankThisMatch}
              cumulative={r.cumulative}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
