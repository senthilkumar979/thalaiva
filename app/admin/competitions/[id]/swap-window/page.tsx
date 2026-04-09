"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, Shuffle } from "lucide-react";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSwapWindowPage() {
  const params = useParams();
  const id = String(params.id);
  const { data: session, status } = useSession();
  const [compName, setCompName] = useState("");
  const [swapWindowOpen, setSwapWindowOpen] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || session?.user?.role !== "admin") return;
    fetch(`/api/competitions/${id}`)
      .then((r) => r.json())
      .then((c) => {
        setCompName(c?.name ?? "Competition");
        setSwapWindowOpen(Boolean(c?.swapWindowOpen));
      })
      .finally(() => setLoading(false));
  }, [id, status, session?.user?.role]);

  const postAction = async (action: "open" | "close") => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/competitions/${id}/swap-window`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "Failed");
      setSwapWindowOpen(action === "open");
      setMessage(action === "open" ? "Swap window opened." : "Swap window closed.");
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-white/50" aria-hidden />
      </div>
    );
  }

  if (status === "unauthenticated" || session?.user?.role !== "admin") {
    return <p className="text-white/70">Admin access only.</p>;
  }

  return (
    <div className="space-y-8">
      <AdminBackLink href="/admin/competitions" className="text-white/70 hover:text-white">
        ← Competitions
      </AdminBackLink>
      <AdminPageHeader
        accent="amber"
        segment="Admin · Swap window"
        title={compName || "Competition"}
        description="Open a swap window after at least 15 matches have been scored (global match order). Close it when users should stop swapping."
        icon={Shuffle}
      />
      <Card className="border-white/10 bg-white/[0.04]">
        <CardHeader>
          <CardTitle className="text-white">Player swap window</CardTitle>
          <CardDescription className="text-white/65">
            {swapWindowOpen ? "Window is open — managers can swap in the app." : "Window is closed."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            type="button"
            disabled={busy || swapWindowOpen === true}
            onClick={() => postAction("open")}
            className="bg-amber-400 font-semibold text-[#0a2469] hover:bg-amber-300"
          >
            Open window
          </Button>
          <Button type="button" variant="outline" disabled={busy || !swapWindowOpen} onClick={() => postAction("close")}>
            Close window
          </Button>
        </CardContent>
      </Card>
      {message ? (
        <p className="text-sm text-white/80" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
