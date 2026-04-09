"use client";

import { useState } from "react";

export function FranchiseRosterTeamLogo({
  shortCode,
  logoUrl,
}: {
  shortCode: string;
  logoUrl: string;
}) {
  const [failed, setFailed] = useState(false);
  const showFallback = !logoUrl || failed;
  if (showFallback) {
    return (
      <div
        className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-primary/5 text-sm font-bold text-primary ring-1 ring-primary/15"
        aria-hidden
      >
        {shortCode.slice(0, 2)}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- external franchise URLs vary
    <img
      src={logoUrl}
      alt=""
      className="size-14 shrink-0 object-contain"
      onError={() => setFailed(true)}
    />
  );
}
