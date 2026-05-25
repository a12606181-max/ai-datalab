import { notFound } from "next/navigation";

import { LessonQuizForm } from "@/components/forms/lesson-quiz-form";
import { GlassCard } from "@/components/ui/glass-card";
import { requireUser } from "@/lib/auth";
import { getLessonDetails } from "@/lib/data";
import { getLocale } from "@/lib/locale-server";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const locale = await getLocale();
  const { id } = await params;
  const lesson = await getLessonDetails(id, user.id);

  if (!lesson) notFound();

  const text =
    locale === "en"
      ? {
          eyebrow: "Lesson",
          course: "Course",
          minutes: "minutes",
          theoryTitle: "Theory and topic breakdown",
          tipTitle: "Practical tip",
          tipText:
            "After reading the theory, try answering three questions in your own words: what exactly are you analyzing, which features seem important, and what conclusion can be drawn from the data. This short self-review helps reinforce the material before the quiz and lab.",
        }
      : {
          eyebrow: "Урок",
          course: "Курс",
          minutes: "минут",
          theoryTitle: "Теория и разбор темы",
          tipTitle: "Практическая подсказка",
          tipText:
            "После изучения теории попробуйте своими словами ответить на три вопроса: что именно вы анализируете, какие признаки считаете важными и какой вывод можете сделать на основе данных. Такой короткий саморазбор помогает лучше закрепить материал перед тестом и лабораторной.",
        };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-fuchsia-300/80">{text.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">{lesson.title}</h1>
        <p className="mt-3 text-base leading-7 text-white/55">
          {text.course}: {lesson.course.title} • {lesson.estimatedMinutes} {text.minutes}
        </p>
      </div>

      <GlassCard>
        <h2 className="text-2xl font-semibold text-white">{text.theoryTitle}</h2>
        <div className="mt-5 space-y-5 text-base leading-8 text-white/70">
          {lesson.theorySections.map((section, index) => (
            <p key={`${lesson.id}-${index}`}>{section}</p>
          ))}
          <div className="rounded-[22px] border border-fuchsia-400/15 bg-fuchsia-500/8 px-4 py-4">
            <p className="font-medium text-white">{text.tipTitle}</p>
            <p className="mt-2 text-sm leading-6 text-white/70">{text.tipText}</p>
          </div>
        </div>
      </GlassCard>

      <LessonQuizForm
        lessonId={lesson.id}
        courseTitle={lesson.course.title}
        courseHref={lesson.courseHref}
        nextLesson={lesson.nextLesson}
        quizzes={lesson.quizzes}
        completed={lesson.completed}
        locale={locale}
      />
    </div>
  );
}
