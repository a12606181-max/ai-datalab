import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";
import { GlassCard } from "@/components/ui/glass-card";
import { requireUser } from "@/lib/auth";
import { getNotificationsForUserLocalized } from "@/lib/data";
import { getLocale } from "@/lib/locale-server";

export default async function NotificationsPage() {
  const user = await requireUser();
  const locale = await getLocale();
  const notifications = await getNotificationsForUserLocalized(user.id, user.role, locale);

  const text =
    locale === "en"
      ? {
          eyebrow: "Notifications",
          title: "What is important to do right now",
          description: "Here you can find platform recommendations, new events, and important learning steps.",
          open: "Open",
          emptyTitle: "No new notifications yet",
          emptyDescription: "When deadlines, recommendations, or important course events appear, they will be shown here.",
        }
      : {
          eyebrow: "Уведомления",
          title: "Что важно сделать сейчас",
          description: "Здесь собраны рекомендации платформы, новые события и важные шаги по обучению.",
          open: "Открыть",
          emptyTitle: "Новых уведомлений пока нет",
          emptyDescription: "Когда появятся дедлайны, рекомендации или важные события по курсам, они отобразятся здесь.",
        };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-fuchsia-300/80">{text.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">{text.title}</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-white/55">{text.description}</p>
      </div>

      {notifications.length ? (
        <div className="grid gap-4">
          {notifications.map((item) => (
            <GlassCard key={item.id} className="hover-lift">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">{item.title}</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-white/60">{item.description}</p>
                </div>
                <Link
                  href={item.href}
                  className="inline-flex w-fit rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/10 px-4 py-2 text-sm text-fuchsia-200 transition hover:bg-fuchsia-500/15"
                >
                  {text.open}
                </Link>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <EmptyState title={text.emptyTitle} description={text.emptyDescription} />
      )}
    </div>
  );
}
