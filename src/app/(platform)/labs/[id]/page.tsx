import { notFound } from "next/navigation";
import { Download } from "lucide-react";

import { LabSubmissionForm } from "@/components/forms/lab-submission-form";
import { GlassCard } from "@/components/ui/glass-card";
import { requireUser } from "@/lib/auth";
import { getLabDetails } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function LabDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const lab = await getLabDetails(id, user.id);

  if (!lab) notFound();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-fuchsia-300/80">Лабораторная</p>
        <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">{lab.title}</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-white/55">{lab.description}</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.92fr]">
        <GlassCard>
          <h2 className="text-2xl font-semibold text-white">Описание задания</h2>
          <div className="mt-5 space-y-4 text-base leading-7 text-white/65">
            <p><span className="text-white">Цель:</span> {lab.goal}</p>
            <p>
              Инструкция выполнения: загрузите CSV-датасет, опишите ход анализа, уточните, какие признаки и визуализации использовали, какие закономерности нашли и какие рекомендации можете предложить.
            </p>
            <p><span className="text-white">Дедлайн:</span> {formatDate(lab.deadline)}</p>
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="text-2xl font-semibold text-white">Датасет для работы</h2>
          {lab.dataset ? (
            <div className="mt-5 space-y-4">
              <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
                <p className="font-medium text-white">{lab.dataset.title}</p>
                <p className="mt-2 text-sm leading-6 text-white/55">{lab.dataset.description}</p>
                <div className="mt-4 flex items-center gap-3">
                  <a
                    href={`/api/lab-datasets/${lab.dataset.id}`}
                    download
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:border-fuchsia-400/35"
                  >
                    <Download className="h-4 w-4" />
                    Скачать CSV
                  </a>
                  <span className="text-sm text-white/45">{lab.dataset.rowsCount} строк</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-5 text-sm text-white/45">Для этой лабораторной преподаватель пока не прикрепил датасет.</p>
          )}
        </GlassCard>
      </div>

      <GlassCard>
        <h2 className="text-2xl font-semibold text-white">Отправка решения</h2>
        <div className="mt-5">
          <LabSubmissionForm labId={lab.id} />
        </div>
      </GlassCard>

      {lab.latestSubmission ? (
        <GlassCard>
          <h2 className="text-2xl font-semibold text-white">Последняя отправка</h2>
          <div className="mt-5 rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
            <p className="text-sm text-white/45">Оценка</p>
            <p className="mt-2 text-4xl font-semibold text-white">{lab.latestSubmission.score}</p>
            <pre className="mt-4 whitespace-pre-wrap text-sm leading-6 text-white/70">{lab.latestSubmission.feedback}</pre>
          </div>
        </GlassCard>
      ) : null}
    </div>
  );
}
