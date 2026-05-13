import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { LabCard } from "@/components/cards/lab-card";
import { LessonList } from "@/components/lessons/lesson-list";
import { GlassCard } from "@/components/ui/glass-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { requireUser } from "@/lib/auth";
import { getCourseDetails } from "@/lib/data";

export default async function CourseDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const course = await getCourseDetails(id, user.id);

  if (!course) notFound();

  const firstLesson = course.lessons[0];

  return (
    <div className="space-y-6">
      <GlassCard className="overflow-hidden p-0">
        <div className={`h-36 bg-gradient-to-br ${course.imageGradient} p-6`}>
          <p className="text-sm uppercase tracking-[0.28em] text-fuchsia-200/90">Курс</p>
          <h1 className="mt-3 text-4xl font-semibold text-white">{course.title}</h1>
        </div>
        <div className="grid gap-6 p-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-base leading-7 text-white/60">{course.description}</p>
            {firstLesson ? (
              <Link
                href={`/lessons/${firstLesson.id}`}
                className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/10 px-4 py-3 text-sm font-medium text-fuchsia-200"
              >
                Продолжить обучение
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : null}
          </div>
          <GlassCard className="bg-white/[0.03]">
            <p className="text-sm text-white/45">Мини-статистика курса</p>
            <div className="mt-4 space-y-4">
              <ProgressBar value={course.progress} label="Прогресс курса" />
              <div className="flex items-center justify-between rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm">
                <span className="text-white/65">Уроков</span>
                <span className="text-white">{course.lessonsCount}</span>
              </div>
              <div className="flex items-center justify-between rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm">
                <span className="text-white/65">Сложность</span>
                <span className="text-white">{course.difficulty}</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </GlassCard>

      <GlassCard>
        <h2 className="text-2xl font-semibold text-white">Список уроков</h2>
        <div className="mt-5">
          <LessonList lessons={course.lessons} completedLessonIds={course.completedLessonIds} />
        </div>
      </GlassCard>

      <div>
        <h2 className="text-2xl font-semibold text-white">Связанные лабораторные</h2>
        <div className="mt-5 grid gap-5 xl:grid-cols-3">
          {course.relatedLabs.map((lab) => (
            <LabCard
              key={lab.id}
              lab={{
                id: lab.id,
                title: lab.title,
                description: lab.description,
                goal: lab.goal,
                difficulty: lab.difficulty,
                deadline: lab.deadline,
                datasetTitle: lab.dataset?.title,
                status: "Открыто",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
