"use client";

import Link from "next/link";
import { Bell, LogOut, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo } from "react";

import { UserAvatar } from "@/components/ui/user-avatar";
import { getRoleLabel } from "@/lib/labels";
import { ghostButtonClassName } from "@/components/ui/gradient-button";

export function Topbar({
  user,
}: {
  user: {
    name: string;
    email: string;
    role: "STUDENT" | "TEACHER";
  };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

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
        <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-white/35" />
        <input
          key={`${pathname}-${initialQuery}`}
          name="topbar-query"
          defaultValue={initialQuery}
          placeholder={
            isFilterablePage
              ? "Найти курс, лабораторную или датасет..."
              : "Найти урок, курс, лабораторную или набор данных..."
          }
          className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pr-28 pl-11 text-sm text-white outline-none placeholder:text-white/30 focus:border-fuchsia-400/35"
        />
        <button
          type="submit"
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/10 px-4 py-2 text-xs font-medium text-fuchsia-100 transition hover:bg-fuchsia-500/20"
        >
          Поиск
        </button>
      </form>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <Link
          href="/notifications"
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/75 transition hover:border-fuchsia-400/35 hover:text-white"
          aria-label="Открыть уведомления"
          title="Уведомления"
        >
          <Bell className="h-5 w-5" />
        </Link>
        <UserAvatar name={user.name} subtitle={getRoleLabel(user.role)} />
        <Link href="/logout" className={ghostButtonClassName}>
          <LogOut className="mr-2 h-4 w-4" />
          Выйти
        </Link>
      </div>
    </div>
  );
}
