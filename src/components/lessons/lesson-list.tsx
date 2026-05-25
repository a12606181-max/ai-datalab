import Link from "next/link";
import { Clock3, PlayCircle } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { AppLocale } from "@/lib/locale";
import { cn } from "@/lib/utils";

export function LessonList({
  lessons,
  completedLessonIds,
  locale = "ru",
}: {
  lessons: Array<{
    id: string;
    title: string;
    order: number;
    estimatedMinutes: number;
  }>;
  completedLessonIds: string[];
  locale?: AppLocale;
}) {
  const text =
    locale === "en"
      ? {
          emptyTitle: "Lessons have not been added yet",
          emptyDescription:
            "The instructor has not filled this course with content yet. Lesson topics, quizzes, and navigation will appear here.",
          minutes: "min",
          completed: "Completed",
          inProgress: "In progress",
        }
      : {
          emptyTitle: "Уроки пока не добавлены",
          emptyDescription:
            "Преподаватель еще не наполнил этот курс содержанием. Здесь появятся темы, тесты и навигация по урокам.",
          minutes: "минут",
          completed: "Завершён",
          inProgress: "В процессе",
        };

  if (!lessons.length) {
    return <EmptyState title={text.emptyTitle} description={text.emptyDescription} />;
  }

  return (
    <div className="space-y-3">
      {lessons.map((lesson) => {
        const completed = completedLessonIds.includes(lesson.id);

        return (
          <Link
            key={lesson.id}
            href={`/lessons/${lesson.id}`}
            className={cn(
              "flex items-center justify-between gap-4 rounded-[22px] border px-4 py-4 transition",
              completed
                ? "border-emerald-400/20 bg-emerald-500/8"
                : "border-white/8 bg-white/[0.03] hover:border-fuchsia-400/30 hover:bg-white/[0.05]",
            )}
          >
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/6 text-sm text-white/70">
                {lesson.order}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-white [overflow-wrap:anywhere]">{lesson.title}</p>
                <p className="mt-1 flex items-center gap-2 text-sm text-white/45">
                  <Clock3 className="h-4 w-4 shrink-0" />
                  {lesson.estimatedMinutes} {text.minutes}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3 text-sm">
              {completed ? (
                <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-emerald-200">
                  {text.completed}
                </span>
              ) : (
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/60">
                  {text.inProgress}
                </span>
              )}
              <PlayCircle className="h-5 w-5 text-fuchsia-300" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
