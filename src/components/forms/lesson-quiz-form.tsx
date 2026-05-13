"use client";

import { useActionState, useEffect } from "react";

import { completeLessonAction } from "@/app/actions/learning";
import { useToast } from "@/components/providers/toast-provider";
import { ErrorMessage } from "@/components/ui/error-message";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { GlassCard } from "@/components/ui/glass-card";
import { initialActionState } from "@/lib/action-state";
import { cn } from "@/lib/utils";

type QuizResult = {
  quizId: string;
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  explanation: string;
  correct: boolean;
};

export function LessonQuizForm({
  lessonId,
  quizzes,
  completed,
}: {
  lessonId: string;
  quizzes: Array<{
    id: string;
    order: number;
    question: string;
    options: string[];
  }>;
  completed: boolean;
}) {
  const [state, action] = useActionState(completeLessonAction, initialActionState);
  const { pushToast } = useToast();
  const result = state.data as
    | {
        scorePercent?: number;
        correctCount?: number;
        totalQuestions?: number;
        results?: QuizResult[];
      }
    | undefined;

  useEffect(() => {
    if (!state.message) return;
    pushToast(state.message, state.success ? "success" : "error");
  }, [state, pushToast]);

  const resultMap = new Map((result?.results ?? []).map((item) => [item.quizId, item]));

  return (
    <GlassCard className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-fuchsia-300/80">Мини-тест</p>
        <h3 className="mt-2 text-xl font-semibold text-white">Проверьте понимание темы</h3>
        <p className="mt-2 text-sm leading-6 text-white/55">
          После отправки теста неверные вопросы будут отмечены красным кругом, а верные — мягким зелёным.
        </p>
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
                <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold", bubbleClass)}>
                  {quiz.order}
                </span>
                <div>
                  <p className="text-lg font-medium text-white">{quiz.question}</p>
                  {quizResult ? (
                    <p className={cn("mt-2 text-sm", quizResult.correct ? "text-emerald-200" : "text-rose-200")}>
                      {quizResult.correct ? "Ответ верный" : "В этом вопросе допущена ошибка"}
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
                      <input
                        type="radio"
                        name={`answer.${quiz.id}`}
                        value={option}
                        className="accent-fuchsia-500"
                      />
                      <span>{option}</span>
                    </label>
                  );
                })}
              </div>
              {quizResult ? (
                <div className="mt-4 rounded-[18px] border border-white/8 bg-black/15 px-4 py-3 text-sm leading-6 text-white/65">
                  <p className="font-medium text-white">Пояснение</p>
                  <p className="mt-2">{quizResult.explanation}</p>
                </div>
              ) : null}
            </div>
          );
        })}
        <ErrorMessage error={state.fieldErrors?.answers} />
        <FormSubmitButton
          label={completed ? "Пройти тест ещё раз" : "Завершить тест"}
          loadingLabel="Проверка..."
        />
      </form>
      {result?.scorePercent !== undefined ? (
        <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm leading-6 text-white/70">
          <p className="text-lg font-semibold text-white">
            Результат: {result.correctCount} из {result.totalQuestions} правильных ответов
          </p>
          <p className="mt-2">Итог по тесту: {result.scorePercent}%.</p>
        </div>
      ) : null}
    </GlassCard>
  );
}
