import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { getDifficultyLabel } from "@/lib/labels";

export function CourseCard({
  course,
}: {
  course: {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    lessonsCount: number;
    progress: number;
    imageGradient: string;
  };
}) {
  return (
    <GlassCard className="hover-lift overflow-hidden p-0">
      <div className={`h-28 bg-gradient-to-br ${course.imageGradient}`} />
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">{course.title}</h3>
            <p className="mt-2 text-sm leading-6 text-white/55">{course.description}</p>
          </div>
          <span className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/65">
            {getDifficultyLabel(course.difficulty)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/50">
          <BookOpen className="h-4 w-4 text-fuchsia-300" />
          {course.lessonsCount} уроков
        </div>
        <ProgressBar value={course.progress} label="Прогресс" />
        <Link
          href={`/courses/${course.id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-fuchsia-300 transition hover:text-white"
        >
          Открыть курс
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </GlassCard>
  );
}
