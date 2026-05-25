import { BrainCircuit, CheckCircle2, FlaskConical, Trophy } from "lucide-react";

import { BarActivityChart } from "@/components/charts/bar-activity-chart";
import { SkillMap } from "@/components/dashboard/skill-map";
import { EmptyState } from "@/components/ui/empty-state";
import { DonutChart } from "@/components/ui/donut-chart";
import { GlassCard } from "@/components/ui/glass-card";
import { StatCard } from "@/components/ui/stat-card";
import { requireUser } from "@/lib/auth";
import { getDashboardDataLocalized } from "@/lib/data";
import { getLevelLabel } from "@/lib/labels";
import { getLocale } from "@/lib/locale-server";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await requireUser();
  const locale = await getLocale();
  const dashboard = await getDashboardDataLocalized(user.id, locale);

  const text =
    locale === "en"
      ? {
          eyebrow: "Analytics",
          hello: "Hello",
          currentLevel: "Current level",
          description:
            "This dashboard brings together the key learning analytics: completed lessons, labs, quality of submissions, and AI mentor recommendations.",
          activityBadge: "7 days of activity",
          lessonsTitle: "Completed lessons",
          lessonsCaption: "Lessons finished",
          labsTitle: "Labs",
          labsCaption: "Labs submitted",
          averageTitle: "Average score",
          averageCaption: "Average lab result",
          mentorTitle: "Mentor tips",
          mentorCaption: "Recommendations received",
          studyActivity: "Learning activity",
          dailyDynamics: "Daily activity trend",
          courseProgress: "Course progress",
          overallProgress: "Overall progress",
          skillMap: "Skill map",
          recentLabs: "Recent labs",
          practiceTasks: "Practice tasks",
          deadline: "Deadline",
          noLabsTitle: "No labs assigned yet",
          noLabsDescription: "As soon as practical tasks appear in the system, they will be shown in this section.",
          mentorTips: "AI mentor tips",
          mentorTipsDescription: "Latest system recommendations",
          noMentorTitle: "Mentor tips will appear here",
          noMentorDescription: "Ask the AI mentor a question or complete a lab to get the first recommendations.",
          timeSpent: "Learning time",
          nextStepEyebrow: "Next step",
          nextStepTitle: "What to do next",
        }
      : {
          eyebrow: "Аналитика",
          hello: "Привет",
          currentLevel: "Текущий уровень",
          description:
            "Здесь собрана ключевая аналитика обучения: завершённые уроки, лабораторные, качество решений и рекомендации ИИ-наставника.",
          activityBadge: "7 дней активности",
          lessonsTitle: "Завершённые уроки",
          lessonsCaption: "Уроков пройдено",
          labsTitle: "Лабораторные",
          labsCaption: "Лабораторных отправлено",
          averageTitle: "Средний балл",
          averageCaption: "Средний результат по лабораторным",
          mentorTitle: "Подсказки наставника",
          mentorCaption: "Получено рекомендаций",
          studyActivity: "Учебная активность",
          dailyDynamics: "Динамика работы по дням",
          courseProgress: "Прогресс по курсам",
          overallProgress: "Общий прогресс",
          skillMap: "Карта навыков",
          recentLabs: "Последние лабораторные",
          practiceTasks: "Практические задания",
          deadline: "Дедлайн",
          noLabsTitle: "Лабораторные пока не назначены",
          noLabsDescription: "Как только в системе появятся практические задания, они сразу отобразятся в этом блоке.",
          mentorTips: "Советы ИИ-наставника",
          mentorTipsDescription: "Последние рекомендации системы",
          noMentorTitle: "Советы наставника появятся здесь",
          noMentorDescription: "Задайте вопрос ИИ-наставнику или завершите лабораторную, чтобы получить первые рекомендации.",
          timeSpent: "Время обучения",
          nextStepEyebrow: "Следующий шаг",
          nextStepTitle: "Что делать дальше",
        };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-fuchsia-300/80">{text.eyebrow}</p>
          <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
            {text.hello}, {dashboard.userName}
          </h1>
          <p className="mt-2 text-sm text-white/40">
            {text.currentLevel}: {getLevelLabel(dashboard.userLevel, locale)}
          </p>
          <p className="mt-3 max-w-3xl text-base leading-7 text-white/55">{text.description}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <span className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
            {text.activityBadge}
          </span>
          <span className="rounded-2xl border border-fuchsia-400/18 bg-fuchsia-500/10 px-4 py-3 text-sm text-fuchsia-200">
            AI DataLab
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title={text.lessonsTitle} value={String(dashboard.stats.lessonsCompleted)} caption={text.lessonsCaption} icon={CheckCircle2} />
        <StatCard title={text.labsTitle} value={String(dashboard.stats.labsCompleted)} caption={text.labsCaption} icon={FlaskConical} />
        <StatCard title={text.averageTitle} value={`${dashboard.stats.averageScore}%`} caption={text.averageCaption} icon={Trophy} />
        <StatCard title={text.mentorTitle} value={String(dashboard.stats.mentorTips)} caption={text.mentorCaption} icon={BrainCircuit} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.65fr_0.85fr]">
        <GlassCard>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-white/45">{text.studyActivity}</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">{text.dailyDynamics}</h2>
            </div>
          </div>
          <BarActivityChart data={dashboard.activity} />
        </GlassCard>

        <div className="space-y-6">
          <GlassCard>
            <p className="text-sm text-white/45">{text.courseProgress}</p>
            <DonutChart value={dashboard.stats.overallProgress} label={text.overallProgress} />
          </GlassCard>
          <GlassCard>
            <p className="text-sm text-white/45">{text.skillMap}</p>
            <div className="mt-5">
              <SkillMap skills={dashboard.skillProgress} locale={locale} />
            </div>
          </GlassCard>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <GlassCard>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">{text.recentLabs}</h2>
            <span className="text-sm text-white/45">{text.practiceTasks}</span>
          </div>
          <div className="space-y-3">
            {dashboard.recentLabs.length ? (
              dashboard.recentLabs.map((lab) => (
                <div
                  key={lab.id}
                  className="flex flex-col gap-3 rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-medium text-white">{lab.title}</p>
                    <p className="mt-1 text-sm text-white/45">
                      {text.deadline}: {formatDate(lab.deadline, locale)}
                    </p>
                  </div>
                  <span className="w-fit rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-3 py-1 text-xs text-fuchsia-200">
                    {lab.status}
                  </span>
                </div>
              ))
            ) : (
              <EmptyState title={text.noLabsTitle} description={text.noLabsDescription} />
            )}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="mb-4">
            <h2 className="text-2xl font-semibold text-white">{text.mentorTips}</h2>
            <p className="mt-2 text-sm text-white/45">{text.mentorTipsDescription}</p>
          </div>
          <div className="space-y-3">
            {dashboard.mentorFeedback.length ? (
              dashboard.mentorFeedback.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm leading-6 text-white/70"
                >
                  {item.previewText}
                </div>
              ))
            ) : (
              <EmptyState title={text.noMentorTitle} description={text.noMentorDescription} />
            )}
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <GlassCard>
          <h2 className="text-2xl font-semibold text-white">{text.timeSpent}</h2>
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
          <p className="text-sm text-white/45">{text.nextStepEyebrow}</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{text.nextStepTitle}</h2>
          <p className="mt-4 text-base leading-7 text-white/60">{dashboard.recommendedStep}</p>
        </GlassCard>
      </div>
    </div>
  );
}
