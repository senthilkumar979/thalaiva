import type { ReactNode } from 'react'
import { DialogContent } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import {
  COMPETITION_BRAND_BG,
  COMPETITION_ORB_DEEP,
} from '@/components/competitions/competitionTheme'

interface FantasyDetailDialogShellProps {
  children: ReactNode
}

export const FantasyDetailDialogShell = ({
  children,
}: FantasyDetailDialogShellProps) => (
  <DialogContent
    showCloseButton
    className={cn(
      'fixed top-10 right-0 right-lg-10 left-auto flex h-full max-h-[94dvh] max-w-md translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none rounded-2xl border-0 p-0 sm:max-w-md',
      '!border-0 !bg-transparent !p-0 !text-white shadow-2xl shadow-black/50 ring-1 ring-white/15',
      '[&_[data-slot=dialog-close]]:z-20 [&_[data-slot=dialog-close]]:text-white/70 [&_[data-slot=dialog-close]]:hover:bg-white/10 [&_[data-slot=dialog-close]]:hover:text-white',
    )}
  >
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-l-2xl"
      style={{ backgroundColor: COMPETITION_BRAND_BG }}
      aria-hidden
    >
      <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div
        className="absolute -right-20 bottom-0 h-64 w-64 rounded-full opacity-80 blur-3xl"
        style={{ backgroundColor: COMPETITION_ORB_DEEP }}
      />
      <div className="absolute left-1/2 top-0 h-px w-[min(100%,28rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1f4a]/35 via-transparent to-[#050a1a]/40" />
    </div>
    {children}
  </DialogContent>
)
