"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Competition {
  _id: string;
  name: string;
  description?: string;
  entryDeadline: string;
}

export default function CompetitionsPage() {
  const { status } = useSession();
  const [list, setList] = useState<Competition[]>([]);
  const [name, setName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [desc, setDesc] = useState("");

  useEffect(() => {
    fetch("/api/competitions")
      .then((r) => r.json())
      .then(setList)
      .catch(() => undefined);
  }, []);

  const create = async () => {
    if (!name.trim() || !deadline) return;
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
      const c = await res.json();
      setList((prev) => [c, ...prev]);
      setName("");
      setDesc("");
    }
  };

  const join = async (id: string) => {
    await fetch(`/api/competitions/${id}/join`, { method: "POST" });
    window.location.href = `/competitions/${id}`;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Competitions</h1>
        <p className="text-muted-foreground">Browse leagues or create your own.</p>
      </div>
      {status === "authenticated" && (
        <Card>
          <CardHeader>
            <CardTitle>Create competition</CardTitle>
            <CardDescription>Set a name and entry deadline (ISO local time).</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Entry deadline</Label>
              <Input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Description</Label>
              <Input value={desc} onChange={(e) => setDesc(e.target.value)} />
            </div>
            <Button type="button" onClick={create}>
              Create
            </Button>
          </CardContent>
        </Card>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {list.map((c) => (
          <Card key={c._id}>
            <CardHeader>
              <CardTitle className="text-lg">{c.name}</CardTitle>
              <CardDescription>
                Deadline: {new Date(c.entryDeadline).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Link href={`/competitions/${c._id}`}>
                <Button variant="secondary" size="sm">
                  Open
                </Button>
              </Link>
              {status === "authenticated" && (
                <Button size="sm" variant="outline" type="button" onClick={() => join(c._id)}>
                  Join
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
