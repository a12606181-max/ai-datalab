import { GraduationCap, NotebookTabs, PercentCircle, Users } from "lucide-react";

import { StatCard } from "@/components/ui/stat-card";

export function TeacherStats({
  studentsCount,
  submissionsCount,
  averageScore,
  completedLabs,
}: {
  studentsCount: number;
  submissionsCount: number;
  averageScore: number;
  completedLabs: number;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Количество студентов"
        value={String(studentsCount)}
        caption="Активные студенты"
        icon={Users}
      />
      <StatCard
        title="Проверенные работы"
        value={String(submissionsCount)}
        caption="Всего отправок"
        icon={NotebookTabs}
      />
      <StatCard
        title="Средний балл"
        value={`${averageScore}%`}
        caption="Средний результат группы"
        icon={PercentCircle}
      />
      <StatCard
        title="Завершенные лабораторные"
        value={String(completedLabs)}
        caption="Сданные работы"
        icon={GraduationCap}
      />
    </div>
  );
}
