import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Thalaiva IPL Fantasy</h1>
        <p className="max-w-2xl text-muted-foreground">
          Build 15-player squads across three cost tiers, compete in user-created leagues, and track
          live fantasy points after every match.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <Link href="/competitions">
            <Button>Browse competitions</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline">Create account</Button>
          </Link>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Tier squads</CardTitle>
            <CardDescription>5 players per tier, five different franchises each.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Pick balanced rosters from 1-pt, 3-pt, and 5-pt pools with strict franchise spread rules.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Captain boost</CardTitle>
            <CardDescription>Double the match points for one pick.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Choose a captain from your fifteen — their fantasy score is multiplied by two each game.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Leagues</CardTitle>
            <CardDescription>Create or join multiple competitions.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Separate teams and leaderboards per competition with clear deadlines.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
