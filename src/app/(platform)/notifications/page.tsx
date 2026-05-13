import Link from "next/link";

import { GlassCard } from "@/components/ui/glass-card";
import { requireUser } from "@/lib/auth";
import { getNotificationsForUser } from "@/lib/data";

export default async function NotificationsPage() {
  const user = await requireUser();
  const notifications = await getNotificationsForUser(user.id, user.role);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-fuchsia-300/80">Уведомления</p>
        <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">Что важно сделать сейчас</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-white/55">
          Здесь собраны рекомендации платформы, новые события и важные шаги по обучению.
        </p>
      </div>

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
                Открыть
              </Link>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
