import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { getDifficultyLabel } from "@/lib/labels";
import { AppLocale, getLocaleMessages } from "@/lib/locale";

export function CourseCard({
  course,
  locale = "ru",
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
  locale?: AppLocale;
}) {
  const messages = getLocaleMessages(locale);

  return (
    <GlassCard className="hover-lift overflow-hidden p-0">
      <div className={`h-28 bg-gradient-to-br ${course.imageGradient}`} />
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-white [overflow-wrap:anywhere]">{course.title}</h3>
            <p className="mt-2 text-sm leading-6 text-white/55 [overflow-wrap:anywhere]">
              {course.description}
            </p>
          </div>
          <span className="shrink-0 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/65">
            {getDifficultyLabel(course.difficulty, locale)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/50">
          <BookOpen className="h-4 w-4 text-fuchsia-300" />
          {course.lessonsCount} {messages.courseCard.lessons}
        </div>
        <ProgressBar value={course.progress} label={messages.courseCard.progress} />
        <Link
          href={`/courses/${course.id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-fuchsia-300 transition hover:text-white"
        >
          {messages.courseCard.openCourse}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </GlassCard>
  );
}
