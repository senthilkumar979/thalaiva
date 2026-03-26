'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Home, Loader2, Shield, Trophy, Users } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export const SiteHeader = () => {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const isHome = pathname === '/'
  const isCompetitions = pathname.startsWith('/competitions')
  const isAdmin = pathname.startsWith('/admin')
  const isPlayers = pathname.startsWith('/players')

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-gradient-to-r from-[#071229] via-[#122456] to-[#071229] text-white shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.06)]">
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sky-400/25 to-transparent"
        aria-hidden
      />
      <div className="relative mx-auto flex max-w-10xl items-center justify-between gap-3 px-4 py-3 sm:gap-4">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2.5 rounded-lg outline-none ring-offset-[#071229] transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-amber-400/80"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15 transition group-hover:bg-white/[0.14]">
            <Trophy className="size-4 text-amber-300" aria-hidden />
          </span>
          <span className="text-[17px] font-semibold tracking-tight">
            Thalaiva
          </span>
        </Link>

        <nav
          className="flex min-w-0 flex-1 items-center justify-end gap-1 sm:gap-2"
          aria-label="Main"
        >
          <Link
            href="/"
            className={cn(
              'shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1.5',
              isHome
                ? 'bg-white/15 text-white'
                : 'text-white/70 hover:bg-white/10 hover:text-white',
            )}
          >
            <Home className="size-3.5 opacity-80" aria-hidden />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <Link
            href="/players"
            className={cn(
              'shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1.5',
              isPlayers
                ? 'bg-white/15 text-white'
                : 'text-white/70 hover:bg-white/10 hover:text-white',
            )}
          >
            <Users className="size-3.5 opacity-80" aria-hidden />
            <span className="hidden sm:inline">Players</span>
          </Link>
          <Link
            href="/competitions"
            className={cn(
              'shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1.5',
              isCompetitions
                ? 'bg-white/15 text-white'
                : 'text-white/70 hover:bg-white/10 hover:text-white',
            )}
          >
            <Trophy className="size-3.5 opacity-80" aria-hidden />
            <span className="hidden sm:inline"> Competitions</span>
          </Link>
          {session?.user?.role === 'admin' && (
            <Link
              href="/admin"
              className={cn(
                'shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1.5',
                isAdmin
                  ? 'bg-white/15 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white',
              )}
            >
              <Shield className="size-3.5 opacity-80" aria-hidden />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}

          <span
            className="mx-1 hidden h-5 w-px bg-white/15 sm:block"
            aria-hidden
          />

          {status === 'loading' ? (
            <span
              className="flex items-center justify-center px-2 py-2 text-white/50"
              aria-busy
            >
              <Loader2 className="size-4 animate-spin" />
            </span>
          ) : session ? (
            <div className="flex min-w-0 items-center gap-2 pl-1 sm:gap-3">
              <span
                className="hidden max-w-[10rem] truncate text-xs text-white/55 md:inline md:max-w-[14rem] md:text-sm"
                title={session.user?.email ?? undefined}
              >
                {session.user?.email}
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="shrink-0 border-white/25 bg-white/5 text-white hover:bg-white/12 hover:text-white"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                Sign out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link href="/login">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white/85 hover:bg-white/10 hover:text-white"
                >
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="bg-white font-semibold text-[#19398a] shadow-sm hover:bg-white/90"
                >
                  Register
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
