import { cookies } from "next/headers";

import { AppLocale, LOCALE_COOKIE, isSupportedLocale } from "@/lib/locale";

export async function getLocale(): Promise<AppLocale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;

  return value && isSupportedLocale(value) ? value : "ru";
}
