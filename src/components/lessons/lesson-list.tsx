import Link from "next/link";
import { Clock3, PlayCircle } from "lucide-react";

import { cn } from "@/lib/utils";

export function LessonList({
  lessons,
  completedLessonIds,
}: {
  lessons: Array<{
    id: string;
    title: string;
    order: number;
    estimatedMinutes: number;
  }>;
  completedLessonIds: string[];
}) {
  return (
    <div className="space-y-3">
      {lessons.map((lesson) => {
        const completed = completedLessonIds.includes(lesson.id);

        return (
          <Link
            key={lesson.id}
            href={`/lessons/${lesson.id}`}
            className={cn(
              "flex items-center justify-between rounded-[22px] border px-4 py-4 transition",
              completed
                ? "border-emerald-400/20 bg-emerald-500/8"
                : "border-white/8 bg-white/[0.03] hover:border-fuchsia-400/30 hover:bg-white/[0.05]",
            )}
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/6 text-sm text-white/70">
                {lesson.order}
              </span>
              <div>
                <p className="font-medium text-white">{lesson.title}</p>
                <p className="mt-1 flex items-center gap-2 text-sm text-white/45">
                  <Clock3 className="h-4 w-4" />
                  {lesson.estimatedMinutes} минут
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              {completed ? (
                <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-emerald-200">
                  Завершён
                </span>
              ) : (
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/60">
                  В процессе
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
