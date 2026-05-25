"use client";

import { ChangeEvent, useTransition } from "react";

import { AppLocale, LOCALE_COOKIE } from "@/lib/locale";

export function LanguageSelect({
  locale,
  options,
}: {
  locale: AppLocale;
  options: Record<AppLocale, string>;
}) {
  const [isPending, startTransition] = useTransition();

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value as AppLocale;

    startTransition(() => {
      document.cookie = `${LOCALE_COOKIE}=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
      window.location.reload();
    });
  }

  return (
    <select
      value={locale}
      onChange={handleChange}
      disabled={isPending}
      className="mt-5 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none disabled:opacity-60"
    >
      <option value="ru" className="bg-[#0f0c18]">
        {options.ru}
      </option>
      <option value="en" className="bg-[#0f0c18]">
        {options.en}
      </option>
    </select>
  );
}
