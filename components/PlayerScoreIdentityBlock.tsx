"use client";

import { AdminScoreTeamLogo } from "@/components/admin/AdminScoreTeamLogo";
import { getIplRoleIconUrl, IPL_ROLE_ICON_SVG } from "@/lib/iplRoleIcons";
import { playerRoleLabel } from "@/lib/playerRoleLabel";
import { cn } from "@/lib/utils";

export interface PlayerScoreIdentityBlockProps {
  franchiseShortCode: string;
  franchiseLogoUrl?: string;
  /** Extra line under short code (e.g. full franchise name) */
  franchiseLine?: string;
  role: string;
  className?: string;
}

export const PlayerScoreIdentityBlock = ({
  franchiseShortCode,
  franchiseLogoUrl,
  franchiseLine,
  role,
  className,
}: PlayerScoreIdentityBlockProps) => {
  const roleIconSrc = getIplRoleIconUrl(role) ?? IPL_ROLE_ICON_SVG.bat;
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 ring-1 ring-white/5 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <AdminScoreTeamLogo
          logoUrl={franchiseLogoUrl}
          shortCode={franchiseShortCode}
          size="md"
          className="ring-white/25 bg-white/10 !text-white"
        />
        <div className="min-w-0">
          <p className="font-semibold tracking-tight text-white">{franchiseShortCode}</p>
          {franchiseLine ? (
            <p className="truncate text-xs text-white/55">{franchiseLine}</p>
          ) : null}
        </div>
      </div>
      <span
        className={cn(
          "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-md border border-sky-400/25 bg-sky-500/15 px-2.5 py-1 text-[11px] font-medium text-sky-100"
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- IPL SVG from iplt20.com */}
        <img src={roleIconSrc} alt="" className="size-4 shrink-0 object-contain" />
        {playerRoleLabel(role)}
      </span>
    </div>
  );
};
