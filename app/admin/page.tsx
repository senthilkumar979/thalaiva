import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminHomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="text-muted-foreground">Manage the player pool, fixtures, and scoring.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Players</CardTitle>
            <CardDescription>CSV upload and pool review</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/players" className="text-primary underline">
              Open
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Matches</CardTitle>
            <CardDescription>Create fixtures and enter scores</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/matches" className="text-primary underline">
              Open
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
