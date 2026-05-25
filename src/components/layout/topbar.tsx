"use client";

import Link from "next/link";
import { Bell, LogOut, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo } from "react";

import { UserAvatar } from "@/components/ui/user-avatar";
import { getRoleLabel } from "@/lib/labels";
import { AppLocale, getLocaleMessages } from "@/lib/locale";

export function Topbar({
  locale,
  user,
}: {
  locale: AppLocale;
  user: {
    name: string;
    email: string;
    role: "STUDENT" | "TEACHER" | "ADMIN";
    avatarKey?: string | null;
  };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const messages = getLocaleMessages(locale);

  const isFilterablePage = useMemo(
    () => pathname.startsWith("/courses") || pathname.startsWith("/labs") || pathname.startsWith("/datasets"),
    [pathname],
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const trimmed = String(formData.get("topbar-query") ?? "").trim();
    const params = new URLSearchParams(searchParams.toString());

    if (isFilterablePage) {
      if (trimmed) params.set("q", trimmed);
      else params.delete("q");

      const queryString = params.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname);
      return;
    }

    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      return;
    }

    router.push("/search");
  }

  return (
    <div className="sticky top-0 z-20 mb-8 flex flex-col gap-4 rounded-[28px] border border-white/8 bg-[#0d0a16]/85 px-4 py-4 backdrop-blur md:flex-row md:items-center md:justify-between md:px-6">
      <form onSubmit={handleSubmit} className="relative w-full max-w-2xl">
        <input
          key={`${pathname}-${initialQuery}`}
          name="topbar-query"
          defaultValue={initialQuery}
          placeholder={
            isFilterablePage
              ? messages.topbar.filterSearchPlaceholder
              : messages.topbar.globalSearchPlaceholder
          }
          className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-4 pr-14 text-sm text-white outline-none placeholder:text-white/30 focus:border-fuchsia-400/35"
        />
        <button
          type="submit"
          aria-label={messages.topbar.searchLabel}
          title={messages.topbar.searchLabel}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/55 transition hover:text-white"
        >
          <Search className="h-5 w-5" />
        </button>
      </form>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <Link
          href="/notifications"
          className="inline-flex items-center justify-center text-white/75 transition hover:text-white"
          aria-label={messages.topbar.notificationsLabel}
          title={messages.topbar.notificationsTitle}
        >
          <Bell className="h-5 w-5" />
        </Link>
        <UserAvatar
          name={user.name}
          subtitle={getRoleLabel(user.role, locale)}
          avatarKey={user.avatarKey}
        />
        <form action="/logout" method="post">
          <button
            type="submit"
            aria-label={messages.topbar.logoutLabel}
            title={messages.topbar.logoutLabel}
            className="text-white/70 transition hover:text-white"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
