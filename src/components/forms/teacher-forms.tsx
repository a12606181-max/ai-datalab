"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  BookPlus,
  CircleHelp,
  Database,
  FlaskConical,
  Plus,
  Trash2,
} from "lucide-react";

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
import { cn } from "@/lib/utils";

type TeacherActionKey = "course" | "lesson" | "lab" | "dataset";

type TeacherCourseOption = {
  id: string;
  title: string;
  lessonsCount: number;
};

type TeacherDatasetOption = {
  id: string;
  title: string;
};

type LessonQuizDraft = {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  correctAnswer: "A" | "B" | "C";
  explanation: string;
};

function createDraftId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function createQuizDraft(): LessonQuizDraft {
  return {
    id: createDraftId(),
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    correctAnswer: "A",
    explanation: "",
  };
}

function useActionToast(state: { message?: string; success?: boolean }) {
  const { pushToast } = useToast();

  useEffect(() => {
    if (!state.message) return;
    pushToast(state.message, state.success ? "success" : "error");
  }, [state, pushToast]);
}

function FieldHeading({
  label,
  hint,
}: {
  label: string;
  hint?: string;
}) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <span className="text-sm font-medium text-white/90">{label}</span>
      {hint ? (
        <span className="group relative inline-flex">
          <CircleHelp className="h-4 w-4 cursor-help text-white/35 transition group-hover:text-fuchsia-300" />
          <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden w-64 -translate-x-1/2 rounded-2xl border border-white/10 bg-[#171321] px-3 py-2 text-xs leading-5 text-white/75 shadow-xl group-hover:block">
            {hint}
          </span>
        </span>
      ) : null}
    </div>
  );
}

function TeacherTextarea({
  name,
  rows,
  placeholder,
  hint,
}: {
  name: string;
  rows: number;
  placeholder: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <textarea
        name={name}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-fuchsia-400/35"
      />
      {hint ? <span className="mt-2 block text-xs text-white/40">{hint}</span> : null}
    </label>
  );
}

function LessonQuizEditor({
  quiz,
  index,
  canRemove,
  onChange,
  onRemove,
}: {
  quiz: LessonQuizDraft;
  index: number;
  canRemove: boolean;
  onChange: (id: string, field: keyof Omit<LessonQuizDraft, "id">, value: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="space-y-4 rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-white">Тестовый вопрос {index + 1}</p>
          <p className="mt-1 text-sm text-white/45">
            Этот вопрос увидят студенты после теории урока.
          </p>
        </div>
        {canRemove ? (
          <button
            type="button"
            onClick={() => onRemove(quiz.id)}
            className="inline-flex items-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-100 transition hover:bg-rose-500/20"
          >
            <Trash2 className="h-4 w-4" />
            Удалить
          </button>
        ) : null}
      </div>

      <div>
        <FieldHeading label="Вопрос" />
        <input
          value={quiz.question}
          onChange={(event) => onChange(quiz.id, "question", event.target.value)}
          placeholder="Например: Что делает groupby в Pandas?"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-fuchsia-400/35"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <FieldHeading label="Вариант 1" />
          <input
            value={quiz.optionA}
            onChange={(event) => onChange(quiz.id, "optionA", event.target.value)}
            placeholder="Первый вариант"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-fuchsia-400/35"
          />
        </div>
        <div>
          <FieldHeading label="Вариант 2" />
          <input
            value={quiz.optionB}
            onChange={(event) => onChange(quiz.id, "optionB", event.target.value)}
            placeholder="Второй вариант"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-fuchsia-400/35"
          />
        </div>
        <div>
          <FieldHeading label="Вариант 3" />
          <input
            value={quiz.optionC}
            onChange={(event) => onChange(quiz.id, "optionC", event.target.value)}
            placeholder="Третий вариант"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-fuchsia-400/35"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <FieldHeading label="Правильный вариант" />
          <select
            value={quiz.correctAnswer}
            onChange={(event) => onChange(quiz.id, "correctAnswer", event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-400/35"
          >
            <option value="A" className="bg-[#0f0c18]">
              Вариант 1
            </option>
            <option value="B" className="bg-[#0f0c18]">
              Вариант 2
            </option>
            <option value="C" className="bg-[#0f0c18]">
              Вариант 3
            </option>
          </select>
        </div>
        <div>
          <FieldHeading
            label="Пояснение"
            hint="Необязательно. Можно кратко объяснить, почему этот ответ правильный."
          />
          <input
            value={quiz.explanation}
            onChange={(event) => onChange(quiz.id, "explanation", event.target.value)}
            placeholder="Короткое пояснение для разбора"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-fuchsia-400/35"
          />
        </div>
      </div>
    </div>
  );
}

export function TeacherCourseForm() {
  const [state, action] = useActionState(createCourseAction, initialActionState);
  useActionToast(state);

  return (
    <GlassCard className="space-y-5">
      <div>
        <h3 className="text-xl font-semibold text-white">Создание курса</h3>
        <p className="mt-2 text-sm leading-6 text-white/55">
          Заполните базовую информацию. Жестких требований по длине больше нет: можно начать
          коротко и дополнить позже.
        </p>
      </div>
      <form action={action} className="space-y-5">
        <div>
          <FieldHeading label="Название курса" />
          <input
            name="title"
            placeholder="Например: Анализ данных с нуля"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-fuchsia-400/35"
          />
          <ErrorMessage error={state.fieldErrors?.title} />
        </div>

        <div>
          <FieldHeading
            label="Описание"
            hint="Можно оставить кратким. Если поле пустое, система подставит нейтральное описание."
          />
          <TeacherTextarea
            name="description"
            rows={4}
            placeholder="Коротко опишите, чему учит курс и для кого он подходит."
          />
          <ErrorMessage error={state.fieldErrors?.description} />
        </div>

        <div>
          <FieldHeading label="Сложность" />
          <select
            name="difficulty"
            defaultValue="Beginner"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-400/35"
          >
            <option value="Beginner" className="bg-[#0f0c18]">
              Базовый
            </option>
            <option value="Intermediate" className="bg-[#0f0c18]">
              Средний
            </option>
            <option value="Advanced" className="bg-[#0f0c18]">
              Продвинутый
            </option>
          </select>
          <ErrorMessage error={state.fieldErrors?.difficulty} />
        </div>

        <FormSubmitButton label="Создать курс" loadingLabel="Создаю курс..." />
      </form>
    </GlassCard>
  );
}

export function TeacherLessonForm({
  courses,
}: {
  courses: TeacherCourseOption[];
}) {
  const [state, action] = useActionState(createLessonAction, initialActionState);
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id ?? "");
  const [quizzes, setQuizzes] = useState<LessonQuizDraft[]>([createQuizDraft()]);
  useActionToast(state);
  const effectiveCourseId =
    courses.some((course) => course.id === selectedCourseId) ? selectedCourseId : (courses[0]?.id ?? "");

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === effectiveCourseId) ?? courses[0],
    [courses, effectiveCourseId],
  );
  const suggestedOrder = (selectedCourse?.lessonsCount ?? 0) + 1;
  const serializedQuizzes = JSON.stringify(
    quizzes.map((quiz) => ({
      question: quiz.question,
      optionA: quiz.optionA,
      optionB: quiz.optionB,
      optionC: quiz.optionC,
      correctAnswer: quiz.correctAnswer,
      explanation: quiz.explanation,
    })),
  );

  const updateQuiz = (id: string, field: keyof Omit<LessonQuizDraft, "id">, value: string) => {
    setQuizzes((current) =>
      current.map((quiz) =>
        quiz.id === id
          ? {
              ...quiz,
              [field]: value,
            }
          : quiz,
      ),
    );
  };

  const addQuiz = () => {
    setQuizzes((current) => [...current, createQuizDraft()]);
  };

  const removeQuiz = (id: string) => {
    setQuizzes((current) => (current.length > 1 ? current.filter((quiz) => quiz.id !== id) : current));
  };

  return (
    <GlassCard className="space-y-5">
      <div>
        <h3 className="text-xl font-semibold text-white">Создание урока</h3>
        <p className="mt-2 text-sm leading-6 text-white/55">
          Здесь только нужные поля. Порядок можно не указывать, а тест полностью собирается
          преподавателем: столько вопросов, сколько вам нужно, и без автодобавления лишних.
        </p>
      </div>

      <form action={action} className="space-y-5">
        <input type="hidden" name="quizzes" value={serializedQuizzes} />

        <div>
          <FieldHeading label="Курс" />
          <select
            name="courseId"
            value={effectiveCourseId}
            onChange={(event) => setSelectedCourseId(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-400/35"
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id} className="bg-[#0f0c18]">
                {course.title}
              </option>
            ))}
          </select>
          <span className="mt-2 block text-xs text-white/40">
            Сейчас в курсе: {selectedCourse?.lessonsCount ?? 0} уроков.
          </span>
          <ErrorMessage error={state.fieldErrors?.courseId} />
        </div>

        <div>
          <FieldHeading label="Название урока" />
          <input
            name="title"
            placeholder="Например: Введение в Pandas"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-fuchsia-400/35"
          />
          <ErrorMessage error={state.fieldErrors?.title} />
        </div>

        <div>
          <FieldHeading label="Теория урока" />
          <TeacherTextarea
            name="content"
            rows={8}
            placeholder="Напишите материал простыми блоками: что это, зачем нужно, основные шаги, пример и частые ошибки."
            hint="Можно сохранять даже короткий черновик, без требований к большому объему текста."
          />
          <ErrorMessage error={state.fieldErrors?.content} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <FieldHeading
              label="Порядок"
              hint="Порядок показывает место урока внутри курса: 1 — первый урок, 2 — второй и так далее. Если поле оставить пустым, система сама поставит следующий номер."
            />
            <input
              name="order"
              type="number"
              placeholder={String(suggestedOrder)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-fuchsia-400/35"
            />
            <span className="mt-2 block text-xs text-white/40">
              Следующий свободный номер сейчас: {suggestedOrder}.
            </span>
            <ErrorMessage error={state.fieldErrors?.order} />
          </div>
          <div>
            <FieldHeading
              label="Длительность, минут"
              hint="Можно оставить пустым. Тогда система поставит 15 минут по умолчанию."
            />
            <input
              name="estimatedMinutes"
              type="number"
              placeholder="15"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-fuchsia-400/35"
            />
            <ErrorMessage error={state.fieldErrors?.estimatedMinutes} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-[24px] border border-white/8 bg-white/[0.03] p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h4 className="text-base font-semibold text-white">Тест к уроку</h4>
              <p className="mt-2 text-sm leading-6 text-white/50">
                Добавляйте столько тестовых вопросов, сколько нужно. В урок попадут только те
                вопросы, которые вы сами создали.
              </p>
            </div>
            <button
              type="button"
              onClick={addQuiz}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/10 px-4 py-3 text-sm font-medium text-fuchsia-100 transition hover:bg-fuchsia-500/20"
            >
              <Plus className="h-4 w-4" />
              Добавить тест
            </button>
          </div>

          {quizzes.map((quiz, index) => (
            <LessonQuizEditor
              key={quiz.id}
              quiz={quiz}
              index={index}
              canRemove={quizzes.length > 1}
              onChange={updateQuiz}
              onRemove={removeQuiz}
            />
          ))}
          <ErrorMessage error={state.fieldErrors?.quizzes} />
        </div>

        <FormSubmitButton label="Создать урок" loadingLabel="Создаю урок..." />
      </form>
    </GlassCard>
  );
}

export function TeacherLabForm({
  datasets,
}: {
  datasets: TeacherDatasetOption[];
}) {
  const [state, action] = useActionState(createLabAction, initialActionState);
  useActionToast(state);
  const defaultDeadline = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().slice(0, 10);
  }, []);

  return (
    <GlassCard className="space-y-5">
      <div>
        <h3 className="text-xl font-semibold text-white">Создание лабораторной</h3>
        <p className="mt-2 text-sm leading-6 text-white/55">
          Форма стала короче: только практическая суть задания и основные параметры. Ограничения
          по длине текста больше не мешают сохранить черновик.
        </p>
      </div>

      <form action={action} className="space-y-5">
        <div>
          <FieldHeading label="Название лабораторной" />
          <input
            name="title"
            placeholder="Например: Анализ продаж в CSV"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-fuchsia-400/35"
          />
          <ErrorMessage error={state.fieldErrors?.title} />
        </div>

        <div>
          <FieldHeading
            label="Описание"
            hint="Если оставить пустым, добавим нейтральное описание автоматически."
          />
          <TeacherTextarea
            name="description"
            rows={4}
            placeholder="Что нужно сделать и какой результат получить."
          />
          <ErrorMessage error={state.fieldErrors?.description} />
        </div>

        <div>
          <FieldHeading
            label="Цель"
            hint="Можно не расписывать подробно. Пустое поле тоже допустимо."
          />
          <TeacherTextarea
            name="goal"
            rows={3}
            placeholder="Например: научиться строить сводные выводы по данным."
          />
          <ErrorMessage error={state.fieldErrors?.goal} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <FieldHeading label="Сложность" />
            <select
              name="difficulty"
              defaultValue="Beginner"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-400/35"
            >
              <option value="Beginner" className="bg-[#0f0c18]">
                Базовый
              </option>
              <option value="Intermediate" className="bg-[#0f0c18]">
                Средний
              </option>
              <option value="Advanced" className="bg-[#0f0c18]">
                Продвинутый
              </option>
            </select>
            <ErrorMessage error={state.fieldErrors?.difficulty} />
          </div>
          <div>
            <FieldHeading
              label="Дедлайн"
              hint="Можно оставить дату по умолчанию. Если поле очистить, система поставит дедлайн через 7 дней."
            />
            <input
              name="deadline"
              type="date"
              defaultValue={defaultDeadline}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-400/35"
            />
            <ErrorMessage error={state.fieldErrors?.deadline} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <FieldHeading
              label="Привязать датасет"
              hint="Необязательно. Можно оставить без датасета и добавить его позже."
            />
            <select
              name="datasetId"
              defaultValue=""
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-400/35"
            >
              <option value="" className="bg-[#0f0c18]">
                Без датасета
              </option>
              {datasets.map((dataset) => (
                <option key={dataset.id} value={dataset.id} className="bg-[#0f0c18]">
                  {dataset.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <FieldHeading
              label="Формат ответа"
              hint="По умолчанию студентам будет удобнее загружать CSV."
            />
            <select
              name="requiredFormat"
              defaultValue=".csv"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-400/35"
            >
              <option value=".csv" className="bg-[#0f0c18]">
                CSV (.csv)
              </option>
              <option value=".xlsx" className="bg-[#0f0c18]">
                Excel (.xlsx)
              </option>
            </select>
          </div>
        </div>

        <FormSubmitButton label="Создать лабораторную" loadingLabel="Создаю лабораторную..." />
      </form>
    </GlassCard>
  );
}

export function TeacherDatasetForm() {
  const [state, action] = useActionState(createDatasetAction, initialActionState);
  useActionToast(state);

  return (
    <GlassCard className="space-y-5">
      <div>
        <h3 className="text-xl font-semibold text-white">Регистрация датасета</h3>
        <p className="mt-2 text-sm leading-6 text-white/55">
          Укажите CSV-файл из папки <code>public/datasets</code>. Количество строк и размер можно
          не заполнять, система определит их сама.
        </p>
      </div>

      <form action={action} className="space-y-5">
        <div>
          <FieldHeading label="Название датасета" />
          <input
            name="title"
            placeholder="Например: Продажи интернет-магазина"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-fuchsia-400/35"
          />
          <ErrorMessage error={state.fieldErrors?.title} />
        </div>

        <div>
          <FieldHeading
            label="Описание"
            hint="Это поле необязательно. Короткого описания достаточно."
          />
          <TeacherTextarea
            name="description"
            rows={4}
            placeholder="Какие данные внутри и для каких лабораторных они подходят."
          />
          <ErrorMessage error={state.fieldErrors?.description} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <FieldHeading
              label="Имя CSV-файла"
              hint="Например: sales.csv. Файл должен уже лежать в public/datasets."
            />
            <input
              name="filename"
              placeholder="sales.csv"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-fuchsia-400/35"
            />
            <ErrorMessage error={state.fieldErrors?.filename} />
          </div>
          <div>
            <FieldHeading
              label="Количество строк"
              hint="Необязательно. Если оставить пустым, посчитаем автоматически."
            />
            <input
              name="rowsCount"
              type="number"
              placeholder="Авто"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-fuchsia-400/35"
            />
            <ErrorMessage error={state.fieldErrors?.rowsCount} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <FieldHeading
              label="Размер файла"
              hint="Можно не заполнять. Система сама покажет размер в KB или MB."
            />
            <input
              name="size"
              placeholder="Авто"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-fuchsia-400/35"
            />
            <ErrorMessage error={state.fieldErrors?.size} />
          </div>
          <div>
            <FieldHeading
              label="Теги"
              hint="Необязательно. Пишите через запятую: sales, csv, analytics."
            />
            <input
              name="tags"
              placeholder="sales, csv, analytics"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-fuchsia-400/35"
            />
            <ErrorMessage error={state.fieldErrors?.tags} />
          </div>
        </div>

        <FormSubmitButton label="Добавить датасет" loadingLabel="Добавляю датасет..." />
      </form>
    </GlassCard>
  );
}

export function TeacherWorkspace({
  courses,
  datasets,
}: {
  courses: TeacherCourseOption[];
  datasets: TeacherDatasetOption[];
}) {
  const [activeAction, setActiveAction] = useState<TeacherActionKey>("course");

  const actionItems: Array<{
    key: TeacherActionKey;
    title: string;
    description: string;
    icon: typeof BookPlus;
  }> = [
    {
      key: "course",
      title: "Курс",
      description: "Создать новый курс и сразу открыть базовую структуру.",
      icon: BookPlus,
    },
    {
      key: "lesson",
      title: "Урок",
      description: "Добавить урок и собрать тест целиком из своих вопросов.",
      icon: BookOpen,
    },
    {
      key: "lab",
      title: "Лабораторная",
      description: "Создать практическую работу с датой и форматом ответа.",
      icon: FlaskConical,
    },
    {
      key: "dataset",
      title: "Датасет",
      description: "Зарегистрировать CSV и подтянуть его метаданные автоматически.",
      icon: Database,
    },
  ];

  return (
    <div className="space-y-6">
      <GlassCard className="space-y-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-fuchsia-300/80">Быстрые действия</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Удобное создание материалов</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
              Выберите, что хотите создать. Открыта будет только одна форма, поэтому панель не
              перегружена и ничего не придётся искать длинной прокруткой.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/60">
            Курсов: <span className="text-white">{courses.length}</span> • Датасетов:{" "}
            <span className="text-white">{datasets.length}</span>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {actionItems.map((item) => {
            const Icon = item.icon;
            const active = activeAction === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveAction(item.key)}
                className={cn(
                  "rounded-[24px] border px-4 py-4 text-left transition",
                  active
                    ? "border-fuchsia-400/40 bg-fuchsia-500/12 shadow-[0_10px_35px_rgba(242,56,255,0.18)]"
                    : "border-white/8 bg-white/[0.03] hover:border-fuchsia-400/20 hover:bg-white/[0.05]",
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-2xl border",
                      active
                        ? "border-fuchsia-400/35 bg-fuchsia-500/15 text-fuchsia-100"
                        : "border-white/10 bg-white/5 text-white/70",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-xs leading-5 text-white/45">{item.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </GlassCard>

      {activeAction === "course" ? <TeacherCourseForm /> : null}
      {activeAction === "lesson" && courses.length ? <TeacherLessonForm courses={courses} /> : null}
      {activeAction === "lesson" && !courses.length ? (
        <GlassCard>
          <h3 className="text-xl font-semibold text-white">Сначала нужен хотя бы один курс</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
            Чтобы добавить урок, сначала создайте курс. После этого вкладка уроков сразу станет
            доступна.
          </p>
          <button
            type="button"
            onClick={() => setActiveAction("course")}
            className="mt-5 rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/10 px-4 py-3 text-sm font-medium text-fuchsia-100 transition hover:bg-fuchsia-500/20"
          >
            Перейти к созданию курса
          </button>
        </GlassCard>
      ) : null}
      {activeAction === "lab" ? <TeacherLabForm datasets={datasets} /> : null}
      {activeAction === "dataset" ? <TeacherDatasetForm /> : null}
    </div>
  );
}
