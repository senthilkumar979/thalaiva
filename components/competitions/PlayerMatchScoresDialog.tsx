'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

export interface PlayerMatchScoreRow {
  _id: string
  fantasyPoints: number
  participated: boolean
  match: {
    matchNumber: number
    date: string
    venue: string
    fixtureLabel: string
  }
}

const TH = 'text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45'

interface PlayerMatchScoresDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  playerId: string | null
  playerName: string
}

export const PlayerMatchScoresDialog = ({
  open,
  onOpenChange,
  playerId,
  playerName,
}: PlayerMatchScoresDialogProps) => {
  const [rows, setRows] = useState<PlayerMatchScoreRow[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    if (!open || !playerId) {
      setRows(null)
      setLoadError(false)
      return
    }
    let cancelled = false
    setRows(null)
    setLoading(true)
    setLoadError(false)
    fetch(`/api/players/${playerId}/match-scores`)
      .then(async (r) => {
        if (!r.ok) throw new Error('bad')
        const j = (await r.json()) as { rows?: PlayerMatchScoreRow[] }
        if (!cancelled) setRows(Array.isArray(j.rows) ? j.rows : [])
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(true)
          setRows([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, playerId])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className={cn(
          'flex max-h-[min(90vh,720px)] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl',
          'border-white/15 bg-blue-950/[10] text-white shadow-2xl ring-1 ring-white/10',
          '[&_[data-slot=dialog-close]]:text-white/70 [&_[data-slot=dialog-close]]:hover:bg-white/10 [&_[data-slot=dialog-close]]:hover:text-white',
        )}
      >
        <DialogHeader className="shrink-0 space-y-1 border-b border-white/10 px-6 py-5 text-left">
          <DialogTitle className="text-xl font-bold tracking-tight text-white">
            Match scores — {playerName}
          </DialogTitle>
          <DialogDescription className="text-white/55">
            Fantasy points and playing XI status for every scored match this
            player appears in.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          {loading ? (
            <div className="flex min-h-[160px] items-center justify-center">
              <Loader2
                className="size-9 animate-spin text-white/45"
                aria-hidden
              />
            </div>
          ) : loadError ? (
            <p className="py-8 text-center text-sm text-white/65">
              Could not load match scores.
            </p>
          ) : rows && rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-white/55">
              No scored matches yet for this player.
            </p>
          ) : rows && rows.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-white/10 bg-black/20">
              <Table className="text-white">
                <TableHeader>
                  <TableRow className="border-b border-white/10 hover:bg-transparent">
                    <TableHead className={TH}>#</TableHead>
                    <TableHead className={TH}>Date</TableHead>
                    <TableHead className={cn('min-w-[120px]', TH)}>
                      Fixture
                    </TableHead>
                    <TableHead className={cn('hidden sm:table-cell', TH)}>
                      Venue
                    </TableHead>
                    <TableHead className={TH}>XI</TableHead>
                    <TableHead className={cn('text-right', TH)}>Pts</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow
                      key={row._id}
                      className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.03]"
                    >
                      <TableCell className="tabular-nums text-white/80">
                        {row.match.matchNumber}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-white/70">
                        {new Date(row.match.date).toLocaleDateString(
                          undefined,
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          },
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-white/90">
                        {row.match.fixtureLabel}
                      </TableCell>
                      <TableCell className="hidden max-w-[10rem] truncate text-sm text-white/50 sm:table-cell">
                        {row.match.venue || '—'}
                      </TableCell>
                      <TableCell className="text-sm text-white/60">
                        {row.participated ? 'Yes' : 'No'}
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums text-amber-200/95">
                        {row.fantasyPoints.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
