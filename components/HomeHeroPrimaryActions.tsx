"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const HomeHeroPrimaryActions = () => {
  const { status } = useSession();
  const showGuestCtas = status === "unauthenticated";

  return (
    <>
      <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
        <Link href="/competitions" className="inline-flex sm:shrink-0">
          <Button
            size="lg"
            className="h-12 w-full rounded-xl bg-white px-8 font-semibold text-[#19398a] shadow-lg hover:bg-white/90 sm:w-auto"
          >
            Browse competitions
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </Link>
        {showGuestCtas && (
          <Link href="/register" className="inline-flex sm:shrink-0">
            <Button
              size="lg"
              variant="outline"
              className="h-12 w-full rounded-xl border-white/30 bg-white/5 text-white hover:bg-white/10 sm:w-auto"
            >
              Create account
            </Button>
          </Link>
        )}
      </div>
      {showGuestCtas && (
        <p className="mt-6 text-sm text-white/45">
          Already playing?{" "}
          <Link
            href="/login"
            className="font-medium text-white/80 underline-offset-4 hover:text-white hover:underline"
          >
            Log in
          </Link>
        </p>
      )}
    </>
  );
};
