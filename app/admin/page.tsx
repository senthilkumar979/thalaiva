import Link from "next/link";
import { ArrowRight, CalendarDays, LayoutDashboard, Trophy, Users } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const sections = [
  {
    href: "/admin/players",
    title: "Player pool",
    description: "Upload Excel or CSV, preview rows, and refresh the fantasy player pool.",
    icon: Users,
    card: "from-violet-500/12 to-violet-500/[0.03] ring-violet-500/15",
    iconBox: "border-violet-500/25 bg-violet-500/10",
  },
  {
    href: "/admin/matches",
    title: "Matches",
    description: "Create fixtures between franchises and open scoring for each match.",
    icon: CalendarDays,
    card: "from-emerald-500/12 to-emerald-500/[0.03] ring-emerald-500/15",
    iconBox: "border-emerald-500/25 bg-emerald-500/10",
  },
  {
    href: "/admin/competitions",
    title: "Competitions",
    description: "Freeze entries, adjust deadlines, and jump to any league dashboard.",
    icon: Trophy,
    card: "from-amber-500/12 to-amber-500/[0.03] ring-amber-500/15",
    iconBox: "border-amber-500/25 bg-amber-500/10",
  },
] as const;

export default function AdminHomePage() {
  return (
    <div className="space-y-8 sm:space-y-10">
      <AdminPageHeader
        accent="slate"
        segment="Admin · Overview"
        title="Operations"
        description="Manage data and scoring for Thalaiva — player imports, fixtures, and competition settings. Same layout as other admin sections."
        icon={LayoutDashboard}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map(({ href, title, description, icon: Icon, card, iconBox }) => (
          <Link
            key={href}
            href={href}
            className="group block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1f4a]"
          >
            <Card
              className={cn(
                "h-full border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] ring-1 ring-white/10 transition-all duration-200",
                "hover:-translate-y-0.5 hover:border-white/15 hover:shadow-lg hover:shadow-black/20",
                card
              )}
            >
              <CardContent className="flex h-full flex-col gap-4 p-5 sm:p-6">
                <span
                  className={cn(
                    "flex size-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 ring-1 ring-white/10",
                    iconBox
                  )}
                >
                  <Icon className="size-5 text-white" aria-hidden />
                </span>
                <div className="space-y-1.5">
                  <h2 className="text-lg font-semibold tracking-tight text-white group-hover:text-white">
                    {title}
                  </h2>
                  <p className="text-sm leading-relaxed text-white/65">{description}</p>
                </div>
                <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-sky-200">
                  Open
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
