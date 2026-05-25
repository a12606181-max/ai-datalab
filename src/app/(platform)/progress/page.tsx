import { BarActivityChart } from "@/components/charts/bar-activity-chart";
import { SkillMap } from "@/components/dashboard/skill-map";
import { EmptyState } from "@/components/ui/empty-state";
import { GlassCard } from "@/components/ui/glass-card";
import { requireUser } from "@/lib/auth";
import { getProgressPageDataLocalized } from "@/lib/data";
import { getSkillLabel } from "@/lib/labels";
import { getLocale } from "@/lib/locale-server";

export default async function ProgressPage() {
  const user = await requireUser();
  const locale = await getLocale();
  const data = await getProgressPageDataLocalized(user.id, locale);

  const text =
    locale === "en"
      ? {
          eyebrow: "Progress",
          title: "Learning progress",
          description:
            "Activity analytics, recent results, strong and weak topics, and recommendations for the next learning step.",
          overall: "Overall learning progress",
          skills: "Skill progress",
          recentLessons: "Recent lessons",
          recentLessonsEmptyTitle: "Lesson progress has not started yet",
          recentLessonsEmptyDescription: "Complete the first lesson and the history of studied topics will appear here.",
          recentLabs: "Recent labs",
          score: "Score",
          recentLabsEmptyTitle: "No lab submissions yet",
          recentLabsEmptyDescription: "After your first practical submission, results and scores will appear here.",
          weakTopics: "Weak topics",
          currentValue: "Current value",
          noWeakTopics: "No weak topics detected. Skills are developing in a balanced way.",
          nextSteps: "Recommended next steps",
          nextStepsEmptyTitle: "Recommendations will appear after the first results",
          nextStepsEmptyDescription: "The system will collect personalized next steps when enough learning data has been accumulated.",
        }
      : {
          eyebrow: "Прогресс",
          title: "Прогресс обучения",
          description:
            "Аналитика активности, последние результаты, сильные и слабые темы, а также рекомендации по следующему шагу в обучении.",
          overall: "Общий процент обучения",
          skills: "Прогресс по навыкам",
          recentLessons: "Последние уроки",
          recentLessonsEmptyTitle: "Прогресс по урокам ещё не начат",
          recentLessonsEmptyDescription: "Пройдите первый урок, и здесь появится история изученных тем.",
          recentLabs: "Последние лабораторные",
          score: "Оценка",
          recentLabsEmptyTitle: "Отправок по лабораторным пока нет",
          recentLabsEmptyDescription: "После сдачи первой практической работы здесь появятся результаты и оценки.",
          weakTopics: "Слабые темы",
          currentValue: "Текущее значение",
          noWeakTopics: "Слабых тем не обнаружено. Навыки развиваются сбалансированно.",
          nextSteps: "Рекомендованные следующие шаги",
          nextStepsEmptyTitle: "Рекомендации появятся после первых результатов",
          nextStepsEmptyDescription: "Система соберёт персональные следующие шаги, когда накопится достаточно данных по обучению.",
        };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-fuchsia-300/80">{text.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">{text.title}</h1>
        <p className="mt-3 text-base leading-7 text-white/55">{text.description}</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <GlassCard>
          <p className="text-sm text-white/45">{text.overall}</p>
          <p className="mt-3 text-5xl font-semibold text-white">{data.overallProgress}%</p>
          <div className="mt-5">
            <BarActivityChart data={data.activity.map((item) => ({ name: item.week, value: item.value }))} />
          </div>
        </GlassCard>
        <GlassCard>
          <p className="text-sm text-white/45">{text.skills}</p>
          <div className="mt-5">
            <SkillMap skills={data.skills} locale={locale} />
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard>
          <h2 className="text-2xl font-semibold text-white">{text.recentLessons}</h2>
          <div className="mt-5 space-y-3">
            {data.lessons.length ? (
              data.lessons.map((item) => (
                <div key={item.id} className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
                  <p className="font-medium text-white">{item.lesson?.title}</p>
                  <p className="mt-2 text-sm text-white/45">{item.lesson?.course.title}</p>
                </div>
              ))
            ) : (
              <EmptyState title={text.recentLessonsEmptyTitle} description={text.recentLessonsEmptyDescription} />
            )}
          </div>
        </GlassCard>
        <GlassCard>
          <h2 className="text-2xl font-semibold text-white">{text.recentLabs}</h2>
          <div className="mt-5 space-y-3">
            {data.labs.length ? (
              data.labs.map((item) => (
                <div key={item.id} className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
                  <p className="font-medium text-white">{item.lab.title}</p>
                  <p className="mt-2 text-sm text-white/45">
                    {text.score}: {item.score}%
                  </p>
                </div>
              ))
            ) : (
              <EmptyState title={text.recentLabsEmptyTitle} description={text.recentLabsEmptyDescription} />
            )}
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard>
          <h2 className="text-2xl font-semibold text-white">{text.weakTopics}</h2>
          <div className="mt-5 space-y-3">
            {data.weakTopics.length ? (
              data.weakTopics.map((item) => (
                <div
                  key={item.skill}
                  className="rounded-[22px] border border-rose-400/16 bg-rose-500/8 px-4 py-4"
                >
                  <p className="font-medium text-white">{getSkillLabel(item.skill, locale)}</p>
                  <p className="mt-2 text-sm text-white/55">
                    {text.currentValue}: {item.value}%
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-white/55">{text.noWeakTopics}</p>
            )}
          </div>
        </GlassCard>
        <GlassCard>
          <h2 className="text-2xl font-semibold text-white">{text.nextSteps}</h2>
          <div className="mt-5 space-y-3">
            {data.nextSteps.length ? (
              data.nextSteps.map((step) => (
                <div
                  key={step}
                  className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm leading-6 text-white/70"
                >
                  {step}
                </div>
              ))
            ) : (
              <EmptyState title={text.nextStepsEmptyTitle} description={text.nextStepsEmptyDescription} />
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
