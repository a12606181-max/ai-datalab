import Image from "next/image";
import { UserRound } from "lucide-react";

import { getAvatarOption } from "@/lib/avatar-options";

export function UserAvatar({
  name,
  subtitle,
  avatarKey,
}: {
  name: string;
  subtitle?: string;
  avatarKey?: string | null;
}) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const avatar = getAvatarOption(avatarKey);

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-500 text-sm font-bold text-white shadow-[0_0_24px_rgba(242,56,255,0.3)]">
        {avatar ? (
          <Image
            src={avatar.src}
            alt={avatar.label}
            width={40}
            height={40}
            className="h-10 w-10 object-cover"
          />
        ) : initials ? (
          initials
        ) : (
          <UserRound className="h-4 w-4" />
        )}
      </div>
      <div className="hidden sm:block">
        <p className="text-sm font-semibold text-white">{name}</p>
        {subtitle ? <p className="text-xs text-white/45">{subtitle}</p> : null}
      </div>
    </div>
  );
}
