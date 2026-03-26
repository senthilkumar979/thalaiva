"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Franchise {
  _id: string;
  name: string;
  shortCode: string;
}

interface Match {
  _id: string;
  matchNumber: number;
  date: string;
  venue: string;
  isScored: boolean;
  franchiseA: Franchise;
  franchiseB: Franchise;
}

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [matchNumber, setMatchNumber] = useState(1);
  const [fa, setFa] = useState("");
  const [fb, setFb] = useState("");
  const [venue, setVenue] = useState("");
  const [when, setWhen] = useState("");

  useEffect(() => {
    fetch("/api/matches")
      .then((r) => r.json())
      .then(setMatches)
      .catch(() => undefined);
    fetch("/api/franchises")
      .then((r) => r.json())
      .then(setFranchises)
      .catch(() => undefined);
  }, []);

  const create = async () => {
    if (!fa || !fb || !when || !venue) return;
    const res = await fetch("/api/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matchNumber,
        franchiseA: fa,
        franchiseB: fb,
        venue,
        date: new Date(when).toISOString(),
      }),
    });
    if (res.ok) {
      const m = await res.json();
      setMatches((prev) => [...prev, m]);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Matches</h1>
        <p className="text-muted-foreground">Create fixtures, then open scoring from the list.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>New match</CardTitle>
          <CardDescription>Select two franchises and schedule.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Match #</Label>
            <Input
              type="number"
              value={matchNumber}
              onChange={(e) => setMatchNumber(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>When</Label>
            <Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Franchise A</Label>
            <select className="flex h-10 w-full rounded-md border px-3 text-sm" value={fa} onChange={(e) => setFa(e.target.value)}>
              <option value="">Select</option>
              {franchises.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.shortCode} — {f.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Franchise B</Label>
            <select className="flex h-10 w-full rounded-md border px-3 text-sm" value={fb} onChange={(e) => setFb(e.target.value)}>
              <option value="">Select</option>
              {franchises.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.shortCode} — {f.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Venue</Label>
            <Input value={venue} onChange={(e) => setVenue(e.target.value)} />
          </div>
          <Button type="button" onClick={create}>
            Create
          </Button>
        </CardContent>
      </Card>
      <div className="space-y-2">
        {matches.map((m) => (
          <div key={m._id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm">
            <div>
              #{m.matchNumber} {m.franchiseA?.shortCode} vs {m.franchiseB?.shortCode} —{" "}
              {new Date(m.date).toLocaleString()} — {m.venue}{" "}
              {m.isScored ? <span className="text-green-600">(scored)</span> : null}
            </div>
            <Link href={`/admin/matches/${m._id}/score`}>
              <Button size="sm" variant="secondary">
                Score
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
