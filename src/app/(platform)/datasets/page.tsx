import { DatasetCard } from "@/components/cards/dataset-card";
import { requireUser } from "@/lib/auth";
import { getDatasetsForUser } from "@/lib/data";
import { getRoleLabel } from "@/lib/labels";

export default async function DatasetsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireUser();
  const { q } = await searchParams;
  const datasets = await getDatasetsForUser(user.id, user.role, q);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-fuchsia-300/80">
          {user.role === "TEACHER" ? "Датасеты" : "Мои отчёты"}
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
          {user.role === "TEACHER" ? "Учебные датасеты преподавателя" : "Личные данные студента"}
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-white/55">
          {user.role === "TEACHER"
            ? "Здесь собраны все учебные наборы данных платформы. Преподаватель может использовать их в лабораторных работах и анализе группы."
            : `Для роли «${getRoleLabel(user.role)}» доступны только персональные отчёты: собственная успеваемость, личный рейтинг и текущий уровень обучения.`}
        </p>
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        {datasets.map((dataset) => (
          <DatasetCard key={dataset.id} dataset={dataset} />
        ))}
      </div>
    </div>
  );
}
