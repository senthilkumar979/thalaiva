"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export const CompetitionDetailNotFound = () => (
  <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0a1f4a] via-[#19398a] to-[#071229] px-6 py-16 text-center text-white">
    <p className="text-lg font-medium">Competition not found</p>
    <p className="mt-2 text-sm text-white/55">It may have been removed or the link is invalid.</p>
    <Link href="/competitions" className="mt-6 inline-block">
      <Button variant="secondary">Back to competitions</Button>
    </Link>
  </div>
);
