"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { TierColumn } from "@/components/TierColumn";
import { usePlayersByTier } from "@/hooks/usePlayersByTier";
import { useTeamBuilder } from "@/hooks/useTeamBuilder";

interface TeamBuilderProps {
  competitionId: string;
  deadlinePassed: boolean;
}

export const TeamBuilder = ({ competitionId, deadlinePassed }: TeamBuilderProps) => {
  const router = useRouter();
  const p1 = usePlayersByTier(1);
  const p2 = usePlayersByTier(3);
  const p3 = usePlayersByTier(5);
  const tb = useTeamBuilder();
  const [teamName, setTeamName] = useState("");

  useEffect(() => {
    const full = tb.tier1.length === 5 && tb.tier2.length === 5 && tb.tier3.length === 5;
    if (full) tb.setStep("captain");
    else {
      tb.setStep("pick");
      tb.setCaptain(null);
    }
    // Intentionally depend on tier lengths only to avoid resetting captain while picking.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tb.setStep/tb.setCaptain are stable
  }, [tb.tier1.length, tb.tier2.length, tb.tier3.length]);

  const submit = async () => {
    if (!teamName.trim() || !tb.captain) {
      toast.error("Team name and captain required");
      return;
    }
    const res = await fetch(`/api/competitions/${competitionId}/entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customTeamName: teamName.trim(),
        tier1Players: tb.tier1,
        tier2Players: tb.tier2,
        tier3Players: tb.tier3,
        captain: tb.captain,
      }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast.error(j.error ?? "Could not save team");
      return;
    }
    toast.success("Team saved");
    router.push(`/competitions/${competitionId}`);
  };

  if (deadlinePassed) {
    return <p className="text-sm text-muted-foreground">The entry deadline has passed.</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Build your squad</CardTitle>
        <CardDescription>Pick five per tier with unique franchises in each column.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="team">Team name</Label>
          <Input
            id="team"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="e.g. Super Kings XI"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <TierColumn
            title="Tier 1 (1 pt)"
            tier={1}
            players={p1.players}
            selectedIds={tb.tier1}
            onToggle={(tier, pl) => tb.toggle(tier, pl, p1.players)}
          />
          <TierColumn
            title="Tier 2 (3 pt)"
            tier={3}
            players={p2.players}
            selectedIds={tb.tier2}
            onToggle={(tier, pl) => tb.toggle(tier, pl, p2.players)}
          />
          <TierColumn
            title="Tier 3 (5 pt)"
            tier={5}
            players={p3.players}
            selectedIds={tb.tier3}
            onToggle={(tier, pl) => tb.toggle(tier, pl, p3.players)}
          />
        </div>
        <Separator />
        {tb.step === "captain" && (
          <div className="space-y-3">
            <div className="text-sm font-medium">Choose captain (2× points)</div>
            <div className="flex flex-wrap gap-2">
              {tb.allSelected.map((id) => {
                const label =
                  p1.players.find((x) => x._id === id)?.name ??
                  p2.players.find((x) => x._id === id)?.name ??
                  p3.players.find((x) => x._id === id)?.name ??
                  id;
                return (
                  <Button
                    key={id}
                    type="button"
                    size="sm"
                    variant={tb.captain === id ? "default" : "outline"}
                    onClick={() => tb.setCaptain(id)}
                  >
                    {label}
                  </Button>
                );
              })}
            </div>
            <Button type="button" onClick={submit} disabled={!tb.captain}>
              Submit team
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
