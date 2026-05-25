import Link from "next/link";
import { CalendarDays, FlaskConical, FileDown } from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";
import { AppLocale } from "@/lib/locale";
import { getDifficultyLabel } from "@/lib/labels";
import { formatDate } from "@/lib/utils";

export function LabCard({
  lab,
  locale = "ru",
}: {
  lab: {
    id: string;
    title: string;
    description: string;
    goal: string;
    difficulty: string;
    deadline: Date | string;
    datasetTitle?: string | null;
    status: string;
  };
  locale?: AppLocale;
}) {
  const text =
    locale === "en"
      ? {
          goal: "Goal",
          deadline: "Deadline",
          dataset: "Dataset",
          datasetFallback: "Will be assigned by the instructor",
          open: "Open lab",
        }
      : {
          goal: "Цель",
          deadline: "Дедлайн",
          dataset: "Датасет",
          datasetFallback: "Будет назначен преподавателем",
          open: "Открыть лабораторную",
        };

  return (
    <GlassCard className="hover-lift space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-white [overflow-wrap:anywhere]">{lab.title}</h3>
          <p className="mt-2 text-sm leading-6 text-white/55 [overflow-wrap:anywhere]">{lab.description}</p>
        </div>
        <span className="shrink-0 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
          {getDifficultyLabel(lab.difficulty, locale)}
        </span>
      </div>
      <div className="grid gap-3 text-sm text-white/55">
        <div className="flex items-start gap-2">
          <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-fuchsia-300" />
          <span className="[overflow-wrap:anywhere]">
            {text.goal}: {lab.goal}
          </span>
        </div>
        <div className="flex items-start gap-2">
          <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" />
          <span className="[overflow-wrap:anywhere]">
            {text.deadline}: {formatDate(lab.deadline, locale)}
          </span>
        </div>
        <div className="flex items-start gap-2">
          <FileDown className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
          <span className="[overflow-wrap:anywhere]">
            {text.dataset}: {lab.datasetTitle || text.datasetFallback}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="shrink-0 rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-3 py-1 text-xs text-fuchsia-200">
          {lab.status}
        </span>
        <Link
          href={`/labs/${lab.id}`}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-center text-sm font-medium text-white transition hover:border-fuchsia-400/35 hover:text-fuchsia-200"
        >
          {text.open}
        </Link>
      </div>
    </GlassCard>
  );
}
