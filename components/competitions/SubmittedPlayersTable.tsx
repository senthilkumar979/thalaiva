"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RoleIcon } from "@/components/RoleIcon";

export interface SubmittedPlayerRow {
  entryId: string;
  teamName: string;
  playerId: string;
  playerName: string;
  role: string;
  franchiseName: string;
  franchiseShortCode: string;
  franchiseLogoUrl: string;
  pointsScored: number;
}

interface SubmittedPlayersTableProps {
  rows: SubmittedPlayerRow[];
  /** Hide fantasy team name in Team column (e.g. single-team dialog). */
  variant?: "full" | "entryOnly";
}

export const SubmittedPlayersTable = ({
  rows,
  variant = "full",
}: SubmittedPlayersTableProps) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Player</TableHead>
        <TableHead>Role</TableHead>
        <TableHead>Team</TableHead>
        <TableHead className="text-right">Pts</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {rows.map((r) => (
        <TableRow key={`${r.entryId}-${r.playerId}`}>
          <TableCell className="font-medium">{r.playerName}</TableCell>
          <TableCell>
            <span className="inline-flex items-center gap-2">
              <RoleIcon role={r.role} size="sm" />
              <span className="capitalize text-muted-foreground">{r.role}</span>
            </span>
          </TableCell>
          <TableCell>
            <span className="inline-flex items-center gap-2">
              {r.franchiseLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- franchise URLs from DB; avoids remotePatterns
                <img
                  src={r.franchiseLogoUrl}
                  alt=""
                  width={24}
                  height={24}
                  className="size-6 rounded object-contain"
                />
              ) : (
                <span className="flex size-6 items-center justify-center rounded bg-muted text-[10px] font-bold text-muted-foreground">
                  {r.franchiseShortCode.slice(0, 2)}
                </span>
              )}
              <span>{r.franchiseName || r.franchiseShortCode}</span>
              {variant === "full" ? (
                <span className="text-muted-foreground">· {r.teamName}</span>
              ) : null}
            </span>
          </TableCell>
          <TableCell className="text-right tabular-nums">{r.pointsScored}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);
