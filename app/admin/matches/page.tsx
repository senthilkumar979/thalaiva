"use client";

import { useEffect, useState } from "react";
import { CalendarPlus } from "lucide-react";
import {
  AdminMatchScheduleList,
  type AdminMatchRow,
} from "@/components/admin/AdminMatchScheduleList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Franchise {
  _id: string;
  name: string;
  shortCode: string;
}

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<AdminMatchRow[]>([]);
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
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Matches</h1>
        <p className="max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          Schedule fixtures, then open scoring to enter fantasy points per player.
        </p>
      </div>

      <Card className="overflow-hidden border-border/80 shadow-sm">
        <CardHeader className="border-b border-border/60 bg-muted/25">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg border border-border bg-background">
              <CalendarPlus className="size-4 text-foreground/80" aria-hidden />
            </span>
            <div>
              <CardTitle className="text-lg">New match</CardTitle>
              <CardDescription>Select two franchises, venue, and kickoff time.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="admin-match-num">Match #</Label>
            <Input
              id="admin-match-num"
              type="number"
              value={matchNumber}
              onChange={(e) => setMatchNumber(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-match-when">When</Label>
            <Input id="admin-match-when" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-fa">Franchise A</Label>
            <select
              id="admin-fa"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={fa}
              onChange={(e) => setFa(e.target.value)}
            >
              <option value="">Select</option>
              {franchises.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.shortCode} — {f.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-fb">Franchise B</Label>
            <select
              id="admin-fb"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={fb}
              onChange={(e) => setFb(e.target.value)}
            >
              <option value="">Select</option>
              {franchises.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.shortCode} — {f.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="admin-venue">Venue</Label>
            <Input id="admin-venue" value={venue} onChange={(e) => setVenue(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Button type="button" onClick={create}>
              Create match
            </Button>
          </div>
        </CardContent>
      </Card>

      <AdminMatchScheduleList matches={matches} />
    </div>
  );
}
