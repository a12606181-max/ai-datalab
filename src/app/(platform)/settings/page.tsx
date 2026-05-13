import Link from "next/link";

import { GlassCard } from "@/components/ui/glass-card";
import { ghostButtonClassName } from "@/components/ui/gradient-button";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-fuchsia-300/80">Настройки</p>
        <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">Настройки</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-white/55">
          Управляйте уведомлениями, уровнем сложности обучения и параметрами кабинета.
        </p>
      </div>

      <GlassCard>
        <div className="space-y-4">
          {[
            "Уведомления о новых лабораторных",
            "Напоминания о дедлайнах",
            "Рекомендации ИИ-наставника после отправки решения",
          ].map((setting) => (
            <label
              key={setting}
              className="flex items-center justify-between rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm text-white/75"
            >
              <span>{setting}</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-fuchsia-500" />
            </label>
          ))}
        </div>
      </GlassCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard>
          <h2 className="text-2xl font-semibold text-white">Сложность обучения</h2>
          <select className="mt-5 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none">
            <option className="bg-[#0f0c18]">Адаптивная</option>
            <option className="bg-[#0f0c18]">Базовая</option>
            <option className="bg-[#0f0c18]">Средняя</option>
            <option className="bg-[#0f0c18]">Продвинутая</option>
          </select>
        </GlassCard>
        <GlassCard>
          <h2 className="text-2xl font-semibold text-white">Язык интерфейса</h2>
          <select className="mt-5 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none">
            <option className="bg-[#0f0c18]">Русский</option>
            <option className="bg-[#0f0c18]">Английский</option>
          </select>
        </GlassCard>
      </div>

      <GlassCard>
        <div className="flex flex-wrap gap-4">
          <Link href="/logout" className={ghostButtonClassName}>
            Выйти из аккаунта
          </Link>
          <button
            disabled
            className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200 opacity-60"
          >
            Удалить аккаунт
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
