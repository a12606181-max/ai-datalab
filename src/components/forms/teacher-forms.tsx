"use client";

import { useActionState, useEffect } from "react";

import {
  createCourseAction,
  createDatasetAction,
  createLabAction,
  createLessonAction,
} from "@/app/actions/teacher";
import { useToast } from "@/components/providers/toast-provider";
import { ErrorMessage } from "@/components/ui/error-message";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { GlassCard } from "@/components/ui/glass-card";
import { initialActionState } from "@/lib/action-state";

function useActionToast(state: { message?: string; success?: boolean }) {
  const { pushToast } = useToast();
  useEffect(() => {
    if (!state.message) return;
    pushToast(state.message, state.success ? "success" : "error");
  }, [state, pushToast]);
}

export function TeacherCourseForm() {
  const [state, action] = useActionState(createCourseAction, initialActionState);
  useActionToast(state);

  return (
    <GlassCard className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white">Добавить курс</h3>
        <p className="mt-2 text-sm text-white/50">Создайте новый учебный курс для платформы.</p>
      </div>
      <form action={action} className="space-y-4">
        <input name="title" placeholder="Название курса" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
        <ErrorMessage error={state.fieldErrors?.title} />
        <textarea name="description" rows={4} placeholder="Описание курса" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
        <ErrorMessage error={state.fieldErrors?.description} />
        <select name="difficulty" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none">
          <option value="Beginner" className="bg-[#0f0c18]">Базовый</option>
          <option value="Intermediate" className="bg-[#0f0c18]">Средний</option>
          <option value="Advanced" className="bg-[#0f0c18]">Продвинутый</option>
        </select>
        <ErrorMessage error={state.fieldErrors?.difficulty} />
        <FormSubmitButton label="Добавить курс" loadingLabel="Создание..." />
      </form>
    </GlassCard>
  );
}

export function TeacherLessonForm({
  courses,
}: {
  courses: Array<{ id: string; title: string }>;
}) {
  const [state, action] = useActionState(createLessonAction, initialActionState);
  useActionToast(state);

  return (
    <GlassCard className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white">Добавить урок</h3>
        <p className="mt-2 text-sm text-white/50">Добавьте подробную теорию и основной вопрос. Система автоматически расширит тест ещё четырьмя вопросами для закрепления.</p>
      </div>
      <form action={action} className="space-y-4">
        <select name="courseId" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none">
          {courses.map((course) => (
            <option key={course.id} value={course.id} className="bg-[#0f0c18]">
              {course.title}
            </option>
          ))}
        </select>
        <ErrorMessage error={state.fieldErrors?.courseId} />
        <input name="title" placeholder="Название урока" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
        <ErrorMessage error={state.fieldErrors?.title} />
        <textarea name="content" rows={7} placeholder="Подробный теоретический материал урока: объяснение темы, шаги, пример, типичные ошибки и практический вывод" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
        <ErrorMessage error={state.fieldErrors?.content} />
        <div className="grid gap-4 md:grid-cols-2">
          <input name="order" type="number" min="1" placeholder="Порядок" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
          <input name="estimatedMinutes" type="number" min="10" placeholder="Минут" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
        </div>
        <ErrorMessage error={state.fieldErrors?.order} />
        <ErrorMessage error={state.fieldErrors?.estimatedMinutes} />
        <input name="question" placeholder="Вопрос мини-теста" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
        <ErrorMessage error={state.fieldErrors?.question} />
        <div className="grid gap-4 md:grid-cols-3">
          <input name="optionA" placeholder="Вариант A" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
          <input name="optionB" placeholder="Вариант B" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
          <input name="optionC" placeholder="Вариант C" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <input name="correctAnswer" placeholder="Правильный ответ" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
          <input name="explanation" placeholder="Понятное объяснение правильного ответа" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
        </div>
        <FormSubmitButton label="Добавить урок" loadingLabel="Создание..." />
      </form>
    </GlassCard>
  );
}

export function TeacherLabForm({
  datasets,
}: {
  datasets: Array<{ id: string; title: string }>;
}) {
  const [state, action] = useActionState(createLabAction, initialActionState);
  useActionToast(state);

  return (
    <GlassCard className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white">Добавить лабораторную</h3>
        <p className="mt-2 text-sm text-white/50">Сформируйте практическое задание с дедлайном и датасетом.</p>
      </div>
      <form action={action} className="space-y-4">
        <input name="title" placeholder="Название лабораторной" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
        <ErrorMessage error={state.fieldErrors?.title} />
        <textarea name="description" rows={4} placeholder="Описание" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
        <ErrorMessage error={state.fieldErrors?.description} />
        <textarea name="goal" rows={3} placeholder="Цель лабораторной" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
        <ErrorMessage error={state.fieldErrors?.goal} />
        <div className="grid gap-4 md:grid-cols-2">
          <select name="difficulty" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none">
            <option value="Beginner" className="bg-[#0f0c18]">Базовый</option>
            <option value="Intermediate" className="bg-[#0f0c18]">Средний</option>
            <option value="Advanced" className="bg-[#0f0c18]">Продвинутый</option>
          </select>
          <input name="deadline" type="date" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
        </div>
        <select name="datasetId" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none">
          <option value="" className="bg-[#0f0c18]">Без датасета</option>
          {datasets.map((dataset) => (
            <option key={dataset.id} value={dataset.id} className="bg-[#0f0c18]">
              {dataset.title}
            </option>
          ))}
        </select>
        <div className="grid gap-4 md:grid-cols-2">
          <input name="requiredFormat" defaultValue=".csv" placeholder="Формат" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
          <input name="minAnswerLength" type="number" min="30" defaultValue="30" placeholder="Мин. длина ответа" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
        </div>
        <FormSubmitButton label="Добавить лабораторную" loadingLabel="Создание..." />
      </form>
    </GlassCard>
  );
}

export function TeacherDatasetForm() {
  const [state, action] = useActionState(createDatasetAction, initialActionState);
  useActionToast(state);

  return (
    <GlassCard className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white">Добавить датасет</h3>
        <p className="mt-2 text-sm text-white/50">Зарегистрируйте новый учебный датасет в системе.</p>
      </div>
      <form action={action} className="space-y-4">
        <input name="title" placeholder="Название датасета" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
        <ErrorMessage error={state.fieldErrors?.title} />
        <textarea name="description" rows={4} placeholder="Описание датасета" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
        <ErrorMessage error={state.fieldErrors?.description} />
        <div className="grid gap-4 md:grid-cols-2">
          <input name="filename" placeholder="filename.csv" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
          <input name="rowsCount" type="number" min="1" placeholder="Количество строк" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <input name="size" placeholder="Размер, например 25 KB" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
          <input name="tags" placeholder="education, ai, csv" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
        </div>
        <FormSubmitButton label="Добавить датасет" loadingLabel="Создание..." />
      </form>
    </GlassCard>
  );
}
