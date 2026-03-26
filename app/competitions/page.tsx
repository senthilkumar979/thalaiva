"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2, Trophy } from "lucide-react";
import { toast } from "sonner";
import { CompetitionLobbyCard, type LobbyCompetition } from "@/components/competitions/CompetitionLobbyCard";
import { CompetitionsEmptyState } from "@/components/competitions/CompetitionsEmptyState";
import { CreateCompetitionPanel } from "@/components/competitions/CreateCompetitionPanel";

export default function CompetitionsPage() {
  const { status } = useSession();
  const [list, setList] = useState<LobbyCompetition[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [desc, setDesc] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/competitions");
        const data = await res.json();
        if (!cancelled && Array.isArray(data)) setList(data);
      } catch {
        if (!cancelled) toast.error("Could not load competitions");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const create = async () => {
    if (!name.trim() || !deadline) {
      toast.error("Name and entry deadline are required");
      return;
    }
    const res = await fetch("/api/competitions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        description: desc,
        entryDeadline: new Date(deadline).toISOString(),
      }),
    });
    if (res.ok) {
      const c = (await res.json()) as LobbyCompetition;
      setList((prev) => [c, ...prev]);
      setName("");
      setDesc("");
      setDeadline("");
      toast.success("League created");
      return;
    }
    const j = await res.json().catch(() => ({}));
    toast.error(j.error ?? "Could not create competition");
  };

  const join = async (id: string) => {
    await fetch(`/api/competitions/${id}/join`, { method: "POST" });
    window.location.href = `/competitions/${id}`;
  };

  const isAuth = status === "authenticated";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 text-white shadow-2xl">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0a1f4a] via-[#19398a] to-[#071229]"
        aria-hidden
      />
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-sky-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(100%,32rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="relative space-y-12 px-4 py-12 sm:px-8 sm:py-14">
        <header className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">
            <Trophy className="size-3.5 text-amber-300/90" />
            Fantasy hub
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl sm:leading-[1.1]">
            Competitions
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
            Browse public leagues, join the fray, or launch your own bracket-style IPL fantasy room with
            tier squads and captain multipliers.
          </p>
        </header>

        {isAuth && (
          <CreateCompetitionPanel
            name={name}
            deadline={deadline}
            description={desc}
            onNameChange={setName}
            onDeadlineChange={setDeadline}
            onDescriptionChange={setDesc}
            onSubmit={create}
          />
        )}

        <section className="space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-white">Open leagues</h2>
              <p className="text-sm text-white/50">Tap a card to view details, standings, and matches.</p>
            </div>
            {!loading && (
              <p className="text-sm tabular-nums text-white/45">
                {list.length} league{list.length === 1 ? "" : "s"}
              </p>
            )}
          </div>

          {loading ? (
            <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
              <Loader2 className="size-10 animate-spin text-white/50" />
            </div>
          ) : list.length === 0 ? (
            <CompetitionsEmptyState isAuthenticated={isAuth} />
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {list.map((c) => (
                <CompetitionLobbyCard
                  key={c._id}
                  competition={c}
                  isAuthenticated={isAuth}
                  onJoin={join}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
