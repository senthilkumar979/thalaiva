import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Franchise {
  _id: string;
  name: string;
  shortCode: string;
}

export interface AdminMatchRow {
  _id: string;
  matchNumber: number;
  date: string;
  venue: string;
  isScored: boolean;
  franchiseA: Franchise;
  franchiseB: Franchise;
}

interface AdminMatchScheduleListProps {
  matches: AdminMatchRow[];
}

export const AdminMatchScheduleList = ({ matches }: AdminMatchScheduleListProps) => (
  <div className="space-y-3">
    <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Scheduled</h2>
    <ul className="divide-y divide-border rounded-xl border border-border/80 bg-card">
      {matches.map((m) => (
        <li key={m._id}>
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
            <div className="min-w-0 text-sm">
              <span className="font-medium text-foreground">
                #{m.matchNumber} {m.franchiseA?.shortCode} vs {m.franchiseB?.shortCode}
              </span>
              <span className="text-muted-foreground">
                {" "}
                · {new Date(m.date).toLocaleString()} · {m.venue}
              </span>
              {m.isScored ? (
                <span className="ml-2 rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  Scored
                </span>
              ) : null}
            </div>
            <Link
              href={`/admin/matches/${m._id}/score`}
              className={cn(
                "inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors",
                "hover:bg-muted"
              )}
            >
              Score
              <ChevronRight className="size-4 opacity-70" aria-hidden />
            </Link>
          </div>
        </li>
      ))}
    </ul>
    {matches.length === 0 && (
      <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
        No matches yet. Create one above.
      </p>
    )}
  </div>
);
