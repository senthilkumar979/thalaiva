import Link from 'next/link'
import {
  ArrowRight,
  Crown,
  Layers,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react'
import { HomeHeroPrimaryActions } from '@/components/HomeHeroPrimaryActions'

export const dynamic = 'force-dynamic'

const features = [
  {
    icon: Layers,
    title: 'Tier squads',
    line: 'Balance across three price bands',
    body:
      'Five picks per tier, five franchises each — strict spread rules keep every squad competitive.',
  },
  {
    icon: Crown,
    title: 'Captain ×2',
    line: 'One star, double the points',
    body:
      'Name a captain from your fifteen; their fantasy score is doubled every match.',
  },
  {
    icon: Users,
    title: 'Your leagues',
    line: 'Create or join rooms',
    body:
      'Separate teams and leaderboards per competition, with clear entry deadlines.',
  },
] as const

export default function HomePage() {
  return (
    <div className="space-y-12 pb-4">
      <section
        className="relative overflow-hidden rounded-2xl border border-white/10 text-white shadow-2xl"
        aria-labelledby="hero-heading"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0a1f4a] via-[#19398a] to-[#071229]"
          aria-hidden
        />
        <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-sky-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-amber-500/12 blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(100%,32rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative px-5 py-14 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
          <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:max-w-2xl lg:text-left">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
              <Sparkles className="size-3.5 text-amber-300/90" aria-hidden />
              IPL fantasy
            </div>
            <h1
              id="hero-heading"
              className="text-balance text-4xl font-bold tracking-tight sm:text-5xl sm:leading-[1.08] lg:text-6xl"
            >
              Thalaiva IPL Fantasy
            </h1>
            <p className="mt-5 text-pretty text-base leading-relaxed text-white/70 sm:text-lg">
              Build fifteen-player squads across cost tiers, run or join leagues
              with friends, and chase the leaderboard as live scores land after
              every ball.
            </p>
            <HomeHeroPrimaryActions />
          </div>

          <div
            className="pointer-events-none absolute bottom-8 right-8 hidden opacity-[0.12] lg:block"
            aria-hidden
          >
            <Trophy className="size-40 text-white" strokeWidth={1} />
          </div>
        </div>
      </section>

      <section aria-labelledby="features-heading" className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="features-heading"
              className="text-2xl font-semibold tracking-tight"
            >
              Built for season-long drama
            </h2>
            <p className="mt-1 max-w-xl text-muted-foreground">
              Rules that reward planning — not just picking the same stars every
              week.
            </p>
          </div>
          <Link
            href="/competitions"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View open leagues
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <ul className="grid gap-5 md:grid-cols-3">
          {features.map(({ icon: Icon, title, line, body }) => (
            <li
              key={title}
              className="group rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 inline-flex rounded-xl bg-primary/8 p-3 text-primary ring-1 ring-primary/10 transition-colors group-hover:bg-primary/12">
                <Icon className="size-6" aria-hidden />
              </div>
              <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
              <p className="text-sm font-medium text-muted-foreground">
                {line}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {body}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
