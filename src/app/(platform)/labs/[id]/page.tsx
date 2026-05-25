import { Download } from "lucide-react";
import { notFound } from "next/navigation";

import { LabSubmissionForm } from "@/components/forms/lab-submission-form";
import { GlassCard } from "@/components/ui/glass-card";
import { requireUser } from "@/lib/auth";
import { getLabDetails } from "@/lib/data";
import { getLocale } from "@/lib/locale-server";
import { formatDate } from "@/lib/utils";

export default async function LabDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const locale = await getLocale();
  const { id } = await params;
  const lab = await getLabDetails(id, user.id);

  if (!lab) notFound();

  const requiredFormat = lab.requiredFormat ?? ".csv";
  const downloadLabel = requiredFormat.toUpperCase().replace(/^\./, "");
  const text =
    locale === "en"
      ? {
          eyebrow: "Lab",
          taskDescription: "Task description",
          goal: "Goal",
          instructions:
            "Execution instructions: upload the dataset, describe the analysis flow, list important features and visualizations, explain discovered patterns, and write practical conclusions.",
          fileFormat: "File format",
          minText: "Minimum text",
          symbols: "characters",
          deadline: "Deadline",
          datasetTitle: "Dataset for work",
          downloadCsv: "Download CSV",
          rows: "rows",
          noDataset: "The instructor has not attached a dataset to this lab yet.",
          caseTheory: "Case theory",
          solutionPlan: "Solution plan",
          grading: "What is assessed",
          submitTitle: "Submit solution",
          submitDescription: `Attach a ${downloadLabel} file if needed and add a text explanation.`,
          latestSubmission: "Latest submission",
          score: "Score",
        }
      : {
          eyebrow: "Лабораторная",
          taskDescription: "Описание задания",
          goal: "Цель",
          instructions:
            "Инструкция выполнения: загрузите датасет, опишите ход анализа, укажите признаки, визуализации, найденные закономерности и практические выводы.",
          fileFormat: "Формат файла",
          minText: "Минимум текста",
          symbols: "символов",
          deadline: "Дедлайн",
          datasetTitle: "Датасет для работы",
          downloadCsv: "Скачать CSV",
          rows: "строк",
          noDataset: "Для этой лабораторной преподаватель пока не прикрепил датасет.",
          caseTheory: "Теория кейса",
          solutionPlan: "План решения",
          grading: "Что оценивается",
          submitTitle: "Отправка решения",
          submitDescription: `Прикрепите ${downloadLabel}-файл при необходимости и добавьте текстовое объяснение.`,
          latestSubmission: "Последняя отправка",
          score: "Оценка",
        };

  return (
    <div className="space-y-6">
      <div className="min-w-0">
        <p className="text-sm uppercase tracking-[0.28em] text-fuchsia-300/80">{text.eyebrow}</p>
        <h1 className="mt-3 max-w-full whitespace-normal break-words text-3xl leading-[1.12] font-semibold text-white [overflow-wrap:anywhere] md:text-4xl">
          {lab.title}
        </h1>
        <p className="mt-3 max-w-3xl whitespace-normal break-words text-base leading-7 text-white/55 [overflow-wrap:anywhere]">
          {lab.description}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.92fr]">
        <GlassCard className="min-w-0">
          <h2 className="text-2xl font-semibold text-white">{text.taskDescription}</h2>
          <div className="mt-5 space-y-4 text-base leading-7 text-white/65">
            <p className="whitespace-normal break-words [overflow-wrap:anywhere]">
              <span className="text-white">{text.goal}:</span> {lab.goal}
            </p>
            <p className="whitespace-normal break-words [overflow-wrap:anywhere]">{text.instructions}</p>
            <p className="whitespace-normal break-words [overflow-wrap:anywhere]">
              <span className="text-white">{text.fileFormat}:</span> {requiredFormat}
            </p>
            <p className="whitespace-normal break-words [overflow-wrap:anywhere]">
              <span className="text-white">{text.minText}:</span> {lab.minAnswerLength} {text.symbols}
            </p>
            <p className="whitespace-normal break-words [overflow-wrap:anywhere]">
              <span className="text-white">{text.deadline}:</span> {formatDate(lab.deadline, locale)}
            </p>
          </div>
        </GlassCard>

        <GlassCard className="min-w-0">
          <h2 className="text-2xl font-semibold text-white">{text.datasetTitle}</h2>
          {lab.dataset ? (
            <div className="mt-5 space-y-4">
              <div className="min-w-0 rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
                <p className="whitespace-normal break-words font-medium text-white [overflow-wrap:anywhere]">
                  {lab.dataset.title}
                </p>
                <p className="mt-2 whitespace-normal break-words text-sm leading-6 text-white/55 [overflow-wrap:anywhere]">
                  {lab.dataset.description}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <a
                    href={`/api/lab-datasets/${lab.dataset.id}`}
                    download
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:border-fuchsia-400/35"
                  >
                    <Download className="h-4 w-4" />
                    {text.downloadCsv}
                  </a>
                  <span className="whitespace-normal break-words text-sm text-white/45 [overflow-wrap:anywhere]">
                    {lab.dataset.rowsCount} {text.rows}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-5 whitespace-normal break-words text-sm text-white/45 [overflow-wrap:anywhere]">
              {text.noDataset}
            </p>
          )}
        </GlassCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <GlassCard className="min-w-0">
          <h2 className="text-2xl font-semibold text-white">{text.caseTheory}</h2>
          <p className="mt-4 whitespace-normal break-words text-sm leading-6 text-white/60 [overflow-wrap:anywhere]">
            {lab.caseGuide.overview}
          </p>
          <div className="mt-5 space-y-3">
            {lab.caseGuide.theory.map((item) => (
              <div
                key={item}
                className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm leading-6 text-white/70 [overflow-wrap:anywhere]"
              >
                {item}
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="min-w-0">
          <h2 className="text-2xl font-semibold text-white">{text.solutionPlan}</h2>
          <div className="mt-5 space-y-3">
            {lab.caseGuide.checklist.map((item, index) => (
              <div
                key={item}
                className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm leading-6 text-white/70 [overflow-wrap:anywhere]"
              >
                <span className="font-medium text-white">{index + 1}. </span>
                {item}
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="min-w-0">
          <h2 className="text-2xl font-semibold text-white">{text.grading}</h2>
          <div className="mt-5 space-y-3">
            {lab.caseGuide.successCriteria.map((item) => (
              <div
                key={item}
                className="rounded-[22px] border border-fuchsia-400/15 bg-fuchsia-500/8 px-4 py-4 text-sm leading-6 text-white/75 [overflow-wrap:anywhere]"
              >
                {item}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="min-w-0">
        <h2 className="text-2xl font-semibold text-white">{text.submitTitle}</h2>
        <div className="mt-5 space-y-3">
          <p className="whitespace-normal break-words text-sm text-white/55 [overflow-wrap:anywhere]">
            {text.submitDescription}
          </p>
          <LabSubmissionForm
            labId={lab.id}
            requiredFormat={requiredFormat}
            minAnswerLength={lab.minAnswerLength}
            locale={locale}
          />
        </div>
      </GlassCard>

      {lab.latestSubmission ? (
        <GlassCard className="min-w-0">
          <h2 className="text-2xl font-semibold text-white">{text.latestSubmission}</h2>
          <div className="mt-5 rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
            <p className="text-sm text-white/45">{text.score}</p>
            <p className="mt-2 text-4xl font-semibold text-white">{lab.latestSubmission.score}</p>
            <pre className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-white/70 [overflow-wrap:anywhere]">
              {lab.latestSubmission.feedback}
            </pre>
          </div>
        </GlassCard>
      ) : null}
    </div>
  );
}
