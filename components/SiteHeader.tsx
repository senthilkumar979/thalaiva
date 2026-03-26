"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export const SiteHeader = () => {
  const { data: session, status } = useSession();
  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Thalaiva
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/competitions" className="text-muted-foreground hover:text-foreground">
            Competitions
          </Link>
          {session?.user?.role === "admin" && (
            <Link href="/admin" className="text-muted-foreground hover:text-foreground">
              Admin
            </Link>
          )}
          {status === "loading" ? (
            <span className="text-muted-foreground">…</span>
          ) : session ? (
            <>
              <span className="hidden text-muted-foreground sm:inline">{session.user?.email}</span>
              <Button type="button" variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Register</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
