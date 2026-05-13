import Link from "next/link";
import { CalendarDays, FlaskConical, FileDown } from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";
import { getDifficultyLabel } from "@/lib/labels";
import { formatDate } from "@/lib/utils";

export function LabCard({
  lab,
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
}) {
  return (
    <GlassCard className="hover-lift space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{lab.title}</h3>
          <p className="mt-2 text-sm leading-6 text-white/55">{lab.description}</p>
        </div>
        <span className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
          {getDifficultyLabel(lab.difficulty)}
        </span>
      </div>
      <div className="grid gap-3 text-sm text-white/55">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-fuchsia-300" />
          Цель: {lab.goal}
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-violet-300" />
          Дедлайн: {formatDate(lab.deadline)}
        </div>
        <div className="flex items-center gap-2">
          <FileDown className="h-4 w-4 text-cyan-300" />
          Датасет: {lab.datasetTitle || "Будет назначен преподавателем"}
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-3 py-1 text-xs text-fuchsia-200">
          {lab.status}
        </span>
        <Link
          href={`/labs/${lab.id}`}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-fuchsia-400/35 hover:text-fuchsia-200"
        >
          Открыть лабораторную
        </Link>
      </div>
    </GlassCard>
  );
}
