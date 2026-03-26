"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import type { LucideIcon } from "lucide-react";
import { Home, Loader2, Shield, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface SiteHeaderMobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const rowClass = (active: boolean) =>
  cn(
    "flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-colors",
    active ? "bg-white/15 text-white" : "text-white/85 hover:bg-white/10 hover:text-white"
  );

export const SiteHeaderMobileNav = ({ open, onOpenChange }: SiteHeaderMobileNavProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const close = () => onOpenChange(false);

  const isHome = pathname === "/";
  const isPlayers = pathname.startsWith("/players");
  const isCompetitions = pathname.startsWith("/competitions");
  const isAdmin = pathname.startsWith("/admin");

  const items: { href: string; label: string; icon: LucideIcon; active: boolean }[] = [
    { href: "/", label: "Home", icon: Home, active: isHome },
    { href: "/players", label: "Players", icon: Users, active: isPlayers },
    { href: "/competitions", label: "Competitions", icon: Trophy, active: isCompetitions },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        id="site-header-mobile-nav"
        showCloseButton
        className="max-h-[min(90vh,560px)] max-w-[min(100vw-1.5rem,22rem)] overflow-y-auto border-white/15 bg-gradient-to-b from-[#122456] to-[#071229] p-0 text-white shadow-2xl ring-1 ring-white/10 [&_[data-slot=dialog-close]]:text-white [&_[data-slot=dialog-close]]:hover:bg-white/10"
      >
        <DialogHeader className="border-b border-white/10 px-5 pb-4 pt-2">
          <DialogTitle className="text-left text-lg font-semibold tracking-tight text-white">
            Menu
          </DialogTitle>
        </DialogHeader>
        <nav className="flex flex-col gap-1 px-3 pb-2" aria-label="Mobile">
          {status === "loading" ? (
            <div className="flex min-h-24 items-center justify-center text-white/50">
              <Loader2 className="size-8 animate-spin" aria-hidden />
            </div>
          ) : (
            <>
              {items.map(({ href, label, icon: Icon, active }) => (
                <Link key={href} href={href} onClick={close} className={rowClass(active)}>
                  <Icon className="size-5 shrink-0 opacity-90" aria-hidden />
                  {label}
                </Link>
              ))}
              {session?.user?.role === "admin" && (
                <Link href="/admin" onClick={close} className={rowClass(isAdmin)}>
                  <Shield className="size-5 shrink-0 opacity-90" aria-hidden />
                  Admin
                </Link>
              )}
              <div className="my-3 h-px bg-white/15" />
              {session ? (
                <div className="space-y-3 px-1 pb-4">
                  {session.user?.email && (
                    <p className="break-all px-3 text-xs leading-snug text-white/55">
                      {session.user.email}
                    </p>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 w-full border-white/25 bg-white/5 text-white hover:bg-white/12 hover:text-white"
                    onClick={() => {
                      close();
                      signOut({ callbackUrl: "/" });
                    }}
                  >
                    Sign out
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 px-1 pb-4">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-12 w-full text-white/90 hover:bg-white/10 hover:text-white"
                    onClick={() => {
                      close();
                      router.push("/login");
                    }}
                  >
                    Log in
                  </Button>
                  <Button
                    type="button"
                    className="h-12 w-full bg-white font-semibold text-[#19398a] hover:bg-white/90"
                    onClick={() => {
                      close();
                      router.push("/register");
                    }}
                  >
                    Register
                  </Button>
                </div>
              )}
            </>
          )}
        </nav>
      </DialogContent>
    </Dialog>
  );
};
