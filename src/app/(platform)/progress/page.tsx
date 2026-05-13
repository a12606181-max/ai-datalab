import { BarActivityChart } from "@/components/charts/bar-activity-chart";
import { SkillMap } from "@/components/dashboard/skill-map";
import { GlassCard } from "@/components/ui/glass-card";
import { requireUser } from "@/lib/auth";
import { getProgressPageData } from "@/lib/data";

export default async function ProgressPage() {
  const user = await requireUser();
  const data = await getProgressPageData(user.id);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-fuchsia-300/80">Прогресс</p>
        <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">Прогресс обучения</h1>
        <p className="mt-3 text-base leading-7 text-white/55">
          Аналитика активности, последние результаты, сильные и слабые темы, а также рекомендации по следующему шагу в обучении.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <GlassCard>
          <p className="text-sm text-white/45">Общий процент обучения</p>
          <p className="mt-3 text-5xl font-semibold text-white">{data.overallProgress}%</p>
          <div className="mt-5">
            <BarActivityChart data={data.activity.map((item) => ({ name: item.week, value: item.value }))} />
          </div>
        </GlassCard>
        <GlassCard>
          <p className="text-sm text-white/45">Прогресс по навыкам</p>
          <div className="mt-5">
            <SkillMap skills={data.skills} />
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard>
          <h2 className="text-2xl font-semibold text-white">Последние уроки</h2>
          <div className="mt-5 space-y-3">
            {data.lessons.map((item) => (
              <div key={item.id} className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
                <p className="font-medium text-white">{item.lesson?.title}</p>
                <p className="mt-2 text-sm text-white/45">{item.lesson?.course.title}</p>
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard>
          <h2 className="text-2xl font-semibold text-white">Последние лабораторные</h2>
          <div className="mt-5 space-y-3">
            {data.labs.map((item) => (
              <div key={item.id} className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
                <p className="font-medium text-white">{item.lab.title}</p>
                <p className="mt-2 text-sm text-white/45">Оценка: {item.score}%</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard>
          <h2 className="text-2xl font-semibold text-white">Слабые темы</h2>
          <div className="mt-5 space-y-3">
            {data.weakTopics.length ? (
              data.weakTopics.map((item) => (
                <div key={item.id} className="rounded-[22px] border border-rose-400/16 bg-rose-500/8 px-4 py-4">
                  <p className="font-medium text-white">{item.skill}</p>
                  <p className="mt-2 text-sm text-white/55">Текущее значение: {item.value}%</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-white/55">Слабых тем не обнаружено. Навыки развиваются сбалансированно.</p>
            )}
          </div>
        </GlassCard>
        <GlassCard>
          <h2 className="text-2xl font-semibold text-white">Рекомендованные следующие шаги</h2>
          <div className="mt-5 space-y-3">
            {data.nextSteps.map((step) => (
              <div key={step} className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm leading-6 text-white/70">
                {step}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
