"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, RotateCcw, X } from "lucide-react";

import { completeLessonAction } from "@/app/actions/learning";
import { useToast } from "@/components/providers/toast-provider";
import { ErrorMessage } from "@/components/ui/error-message";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { GlassCard } from "@/components/ui/glass-card";
import { initialActionState } from "@/lib/action-state";
import { AppLocale } from "@/lib/locale";
import { cn } from "@/lib/utils";

type QuizResult = {
  quizId: string;
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  explanation: string;
  correct: boolean;
};

type LessonCompletionResult = {
  scorePercent?: number;
  correctCount?: number;
  totalQuestions?: number;
  results?: QuizResult[];
  courseHref?: string;
  courseTitle?: string;
  nextLessonHref?: string | null;
  nextLessonTitle?: string | null;
};

export function LessonQuizForm({
  lessonId,
  courseTitle,
  courseHref,
  nextLesson,
  quizzes,
  completed,
  locale = "ru",
}: {
  lessonId: string;
  courseTitle: string;
  courseHref: string;
  nextLesson: {
    id: string;
    title: string;
    href: string;
  } | null;
  quizzes: Array<{
    id: string;
    order: number;
    question: string;
    options: string[];
  }>;
  completed: boolean;
  locale?: AppLocale;
}) {
  const [state, action] = useActionState(completeLessonAction, initialActionState);
  const [dismissedResultKey, setDismissedResultKey] = useState<string | null>(null);
  const { pushToast } = useToast();
  const result = (state.data as LessonCompletionResult | undefined) ?? undefined;
  const resultKey =
    result?.scorePercent !== undefined
      ? `${lessonId}-${result.scorePercent}-${result.correctCount}-${result.totalQuestions}`
      : null;
  const showResultModal = Boolean(state.success && resultKey && dismissedResultKey !== resultKey);

  useEffect(() => {
    if (!state.message) return;
    pushToast(state.message, state.success ? "success" : "error");
  }, [state, pushToast]);

  const resultMap = useMemo(
    () => new Map((result?.results ?? []).map((item) => [item.quizId, item])),
    [result?.results],
  );

  const resolvedCourseHref = result?.courseHref || courseHref;
  const resolvedCourseTitle = result?.courseTitle || courseTitle;
  const resolvedNextLessonHref = result?.nextLessonHref ?? nextLesson?.href ?? null;
  const resolvedNextLessonTitle = result?.nextLessonTitle ?? nextLesson?.title ?? null;

  const text =
    locale === "en"
      ? {
          eyebrow: "Lesson quiz",
          title: "Check your understanding",
          description:
            "After submission, you will immediately see the quiz result and will be able to move to the next lesson or return to the course.",
          correct: "Correct answer",
          wrong: "There is a mistake in this question",
          explanation: "Explanation",
          retake: "Retake quiz",
          finish: "Finish quiz",
          checking: "Checking...",
          close: "Close result window",
          resultEyebrow: "Lesson result",
          resultTitle: "Quiz completed",
          resultText: "Correct answers",
          course: "Course",
          nextReady: "The next lesson is already ready",
          lastLesson: "This is the last lesson in the course. You can return to the course lesson list.",
          nextLesson: "Start next lesson",
          backToCourse: "Return to course",
          stay: "Stay on page",
        }
      : {
          eyebrow: "Тест по уроку",
          title: "Проверьте понимание темы",
          description:
            "После отправки вы сразу увидите итог по тесту и сможете перейти к следующему уроку или вернуться в курс.",
          correct: "Ответ верный",
          wrong: "В этом вопросе есть ошибка",
          explanation: "Пояснение",
          retake: "Пройти тест ещё раз",
          finish: "Завершить тест",
          checking: "Проверка...",
          close: "Закрыть окно результата",
          resultEyebrow: "Результат урока",
          resultTitle: "Тест завершен",
          resultText: "Правильных ответов",
          course: "Курс",
          nextReady: "Следующий урок уже готов",
          lastLesson: "Это последний урок в курсе. Можно вернуться к списку уроков курса.",
          nextLesson: "Пройти следующий урок",
          backToCourse: "Вернуться в курс",
          stay: "Остаться на странице",
        };

  return (
    <>
      <GlassCard className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-fuchsia-300/80">{text.eyebrow}</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{text.title}</h3>
          <p className="mt-2 text-sm leading-6 text-white/55">{text.description}</p>
        </div>
        <form action={action} className="space-y-5">
          <input type="hidden" name="lessonId" value={lessonId} />
          {quizzes.map((quiz) => {
            const quizResult = resultMap.get(quiz.id);
            const statusClass = quizResult
              ? quizResult.correct
                ? "border-emerald-400/20 bg-emerald-500/8"
                : "border-rose-400/20 bg-rose-500/8"
              : "border-white/8 bg-white/[0.03]";

            const bubbleClass = quizResult
              ? quizResult.correct
                ? "bg-emerald-500/20 text-emerald-200"
                : "bg-rose-500/20 text-rose-200"
              : "bg-white/6 text-white/75";

            return (
              <div key={quiz.id} className={cn("rounded-[24px] border px-4 py-4 md:px-5", statusClass)}>
                <div className="mb-4 flex items-start gap-4">
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                      bubbleClass,
                    )}
                  >
                    {quiz.order}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-medium text-white [overflow-wrap:anywhere]">{quiz.question}</p>
                    {quizResult ? (
                      <p className={cn("mt-2 text-sm", quizResult.correct ? "text-emerald-200" : "text-rose-200")}>
                        {quizResult.correct ? text.correct : text.wrong}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="space-y-3">
                  {quiz.options.map((option) => {
                    const selected = quizResult?.selectedAnswer === option;
                    const isCorrect = quizResult?.correctAnswer === option;

                    return (
                      <label
                        key={option}
                        className={cn(
                          "flex items-center gap-3 rounded-[20px] border px-4 py-3 text-sm text-white/85 transition",
                          selected && quizResult && !quizResult.correct
                            ? "border-rose-400/30 bg-rose-500/10"
                            : isCorrect && quizResult && !quizResult.correct
                              ? "border-emerald-400/25 bg-emerald-500/10"
                              : "border-white/8 bg-white/[0.03] hover:border-fuchsia-400/28",
                        )}
                      >
                        <input type="radio" name={`answer.${quiz.id}`} value={option} className="accent-fuchsia-500 shrink-0" />
                        <span className="[overflow-wrap:anywhere]">{option}</span>
                      </label>
                    );
                  })}
                </div>
                {quizResult ? (
                  <div className="mt-4 rounded-[18px] border border-white/8 bg-black/15 px-4 py-3 text-sm leading-6 text-white/65">
                    <p className="font-medium text-white">{text.explanation}</p>
                    <p className="mt-2 [overflow-wrap:anywhere]">{quizResult.explanation}</p>
                  </div>
                ) : null}
              </div>
            );
          })}
          <ErrorMessage error={state.fieldErrors?.answers} />
          <FormSubmitButton label={completed ? text.retake : text.finish} loadingLabel={text.checking} />
        </form>
      </GlassCard>

      {showResultModal && result?.scorePercent !== undefined ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#09070f]/78 px-4 py-6 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-[32px] border border-white/10 bg-[#120f1d] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] md:p-8">
            <button
              type="button"
              onClick={() => setDismissedResultKey(resultKey)}
              className="absolute top-4 right-4 rounded-full border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
              aria-label={text.close}
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-200">
                <CheckCircle2 className="h-7 w-7" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm uppercase tracking-[0.28em] text-fuchsia-300/80">{text.resultEyebrow}</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">{text.resultTitle}</h3>
                <p className="mt-3 text-sm leading-6 text-white/60">
                  {text.resultText}: {result.correctCount} / {result.totalQuestions}. {result.scorePercent}%.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-[24px] border border-white/8 bg-white/[0.03] px-5 py-4">
              <p className="text-sm text-white/55">{text.course}</p>
              <p className="mt-2 text-lg font-semibold text-white [overflow-wrap:anywhere]">{resolvedCourseTitle}</p>
              <p className="mt-2 text-sm leading-6 text-white/60 [overflow-wrap:anywhere]">
                {resolvedNextLessonTitle ? `${text.nextReady}: ${resolvedNextLessonTitle}.` : text.lastLesson}
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {resolvedNextLessonHref ? (
                <Link
                  href={resolvedNextLessonHref}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-fuchsia-400/20 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-violet-500 px-5 py-3 text-center text-sm font-semibold text-white shadow-[0_8px_30px_rgba(242,56,255,0.35)] transition hover:scale-[1.01]"
                >
                  {text.nextLesson}
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </Link>
              ) : null}
              <Link
                href={resolvedCourseHref}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-center text-sm font-medium text-white/90 transition hover:bg-white/10"
              >
                {text.backToCourse}
              </Link>
              <button
                type="button"
                onClick={() => setDismissedResultKey(resultKey)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-transparent px-5 py-3 text-center text-sm font-medium text-white/65 transition hover:bg-white/5 hover:text-white"
              >
                <RotateCcw className="h-4 w-4 shrink-0" />
                {text.stay}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
