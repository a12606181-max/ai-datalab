import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";

import { LabCard } from "@/components/cards/lab-card";
import { LessonList } from "@/components/lessons/lesson-list";
import { EmptyState } from "@/components/ui/empty-state";
import { GlassCard } from "@/components/ui/glass-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { requireUser } from "@/lib/auth";
import { getCourseDetails } from "@/lib/data";
import { getLocaleMessages } from "@/lib/locale";
import { getLocale } from "@/lib/locale-server";

export default async function CourseDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const locale = await getLocale();
  const messages = getLocaleMessages(locale);
  const { id } = await params;
  const course = await getCourseDetails(id, user.id);

  if (!course) notFound();

  const firstLesson = course.lessons[0];

  return (
    <div className="space-y-6">
      <GlassCard className="overflow-hidden p-0">
        <div className={`min-h-36 bg-gradient-to-br ${course.imageGradient} px-6 py-6 md:px-8`}>
          <p className="text-sm uppercase tracking-[0.28em] text-fuchsia-200/90">{messages.course.eyebrow}</p>
          <h1 className="mt-3 max-w-full whitespace-normal break-words text-4xl leading-[1.12] font-semibold text-white [overflow-wrap:anywhere]">
            {course.title}
          </h1>
        </div>
        <div className="grid gap-6 p-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="min-w-0">
            <p className="max-w-full whitespace-normal break-words text-base leading-7 text-white/60 [overflow-wrap:anywhere]">
              {course.description}
            </p>
            {firstLesson ? (
              <Link
                href={`/lessons/${firstLesson.id}`}
                className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/10 px-4 py-3 text-sm font-medium text-fuchsia-200"
              >
                {messages.course.continue}
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <EmptyState
                title={messages.course.emptyTitle}
                description={messages.course.emptyDescription}
                className="mt-6 text-left"
              />
            )}
          </div>
          <GlassCard className="bg-white/[0.03]">
            <p className="text-sm text-white/45">{messages.course.statsTitle}</p>
            <div className="mt-4 space-y-4">
              <ProgressBar value={course.progress} label={messages.course.progressLabel} />
              <div className="flex items-center justify-between rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm">
                <span className="text-white/65">{messages.course.lessonsLabel}</span>
                <span className="text-white">{course.lessonsCount}</span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm">
                <span className="text-white/65">{messages.course.difficultyLabel}</span>
                <span className="max-w-[12rem] text-right text-white [overflow-wrap:anywhere]">{course.difficulty}</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </GlassCard>

      <GlassCard>
        <h2 className="text-2xl font-semibold text-white">{messages.course.lessonListTitle}</h2>
        <div className="mt-5">
          <LessonList lessons={course.lessons} completedLessonIds={course.completedLessonIds} locale={locale} />
        </div>
      </GlassCard>

      <div>
        <h2 className="text-2xl font-semibold text-white">{messages.course.relatedLabsTitle}</h2>
        {course.relatedLabs.length ? (
          <div className="mt-5 grid gap-5 xl:grid-cols-3">
            {course.relatedLabs.map((lab) => (
              <LabCard
                key={lab.id}
                locale={locale}
                lab={{
                  id: lab.id,
                  title: lab.title,
                  description: lab.description,
                  goal: lab.goal,
                  difficulty: lab.difficulty,
                  deadline: lab.deadline,
                  datasetTitle: lab.dataset?.title,
                  status: messages.common.open,
                }}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title={messages.course.relatedLabsEmptyTitle}
            description={messages.course.relatedLabsEmptyDescription}
            className="mt-5"
          />
        )}
      </div>
    </div>
  );
}
