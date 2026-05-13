import { BrainCircuit, CheckCircle2, FlaskConical, Trophy } from "lucide-react";

import { BarActivityChart } from "@/components/charts/bar-activity-chart";
import { SkillMap } from "@/components/dashboard/skill-map";
import { DonutChart } from "@/components/ui/donut-chart";
import { GlassCard } from "@/components/ui/glass-card";
import { StatCard } from "@/components/ui/stat-card";
import { requireUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/data";
import { getLevelLabel } from "@/lib/labels";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await requireUser();
  const dashboard = await getDashboardData(user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-fuchsia-300/80">Аналитика</p>
          <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
            Привет, {dashboard.userName}
          </h1>
          <p className="mt-2 text-sm text-white/40">
            Текущий уровень: {getLevelLabel(dashboard.userLevel)}
          </p>
          <p className="mt-3 max-w-3xl text-base leading-7 text-white/55">
            Здесь собрана ключевая аналитика обучения: завершённые уроки, лабораторные, качество решений и рекомендации ИИ-наставника.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
            Фильтры
          </button>
          <button className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
            Этот месяц
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Завершённые уроки" value={String(dashboard.stats.lessonsCompleted)} caption="Уроков пройдено" icon={CheckCircle2} />
        <StatCard title="Лабораторные" value={String(dashboard.stats.labsCompleted)} caption="Лабораторных отправлено" icon={FlaskConical} />
        <StatCard title="Средний балл" value={`${dashboard.stats.averageScore}%`} caption="Средний результат по лабораторным" icon={Trophy} />
        <StatCard title="Подсказки наставника" value={String(dashboard.stats.mentorTips)} caption="Получено рекомендаций" icon={BrainCircuit} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.65fr_0.85fr]">
        <GlassCard>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-white/45">Учебная активность</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Динамика работы по дням</h2>
            </div>
          </div>
          <BarActivityChart data={dashboard.activity} />
        </GlassCard>

        <div className="space-y-6">
          <GlassCard>
            <p className="text-sm text-white/45">Прогресс по курсам</p>
            <DonutChart value={dashboard.stats.overallProgress} label="Общий прогресс" />
          </GlassCard>
          <GlassCard>
            <p className="text-sm text-white/45">Карта навыков</p>
            <div className="mt-5">
              <SkillMap skills={dashboard.skillProgress} />
            </div>
          </GlassCard>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <GlassCard>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Последние лабораторные</h2>
            <span className="text-sm text-white/45">Практические задания</span>
          </div>
          <div className="space-y-3">
            {dashboard.recentLabs.map((lab) => (
              <div
                key={lab.id}
                className="flex flex-col gap-3 rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium text-white">{lab.title}</p>
                  <p className="mt-1 text-sm text-white/45">Дедлайн: {formatDate(lab.deadline)}</p>
                </div>
                <span className="w-fit rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-3 py-1 text-xs text-fuchsia-200">
                  {lab.status}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="mb-4">
            <h2 className="text-2xl font-semibold text-white">Советы ИИ-наставника</h2>
            <p className="mt-2 text-sm text-white/45">Последние рекомендации системы</p>
          </div>
          <div className="space-y-3">
            {dashboard.mentorFeedback.map((item) => (
              <div key={item.id} className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm leading-6 text-white/70">
                {item.content}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <GlassCard>
          <h2 className="text-2xl font-semibold text-white">Время обучения</h2>
          <div className="mt-5 space-y-4">
            {dashboard.timeSpent.map((item) => (
              <div key={item.label} className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="text-white">{item.label}</span>
                  <span className="text-white/45">{item.hours}</span>
                </div>
                <div className="h-2 rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <p className="text-sm text-white/45">Следующий шаг</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Что делать дальше</h2>
          <p className="mt-4 text-base leading-7 text-white/60">{dashboard.recommendedStep}</p>
        </GlassCard>
      </div>
    </div>
  );
}
