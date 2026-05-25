import { DatasetCard } from "@/components/cards/dataset-card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth";
import { getDatasetsForUserLocalized } from "@/lib/data";
import { getRoleLabel } from "@/lib/labels";
import { getLocale } from "@/lib/locale-server";

export default async function DatasetsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireUser();
  const locale = await getLocale();
  const { q } = await searchParams;
  const datasets = await getDatasetsForUserLocalized(user.id, user.role, q, locale);

  const isTeacher = user.role === "TEACHER";
  const text =
    locale === "en"
      ? {
          eyebrow: isTeacher ? "Datasets" : "My reports",
          title: isTeacher ? "Instructor training datasets" : "Student personal data",
          description: isTeacher
            ? "All training datasets on the platform are collected here. An instructor can use them in labs and group analysis."
            : `For the role "${getRoleLabel(user.role, locale)}", only personal reports are available: your own performance, personal ranking, and current learning level.`,
          emptyTitle: isTeacher ? "No datasets found" : "Reports have not been generated yet",
          emptyDescription: isTeacher
            ? "Add a new dataset or refine the search query to see materials in this section."
            : "After the first lab, personal files and reports about your learning progress will appear here.",
        }
      : {
          eyebrow: isTeacher ? "Датасеты" : "Мои отчёты",
          title: isTeacher ? "Учебные датасеты преподавателя" : "Личные данные студента",
          description: isTeacher
            ? "Здесь собраны все учебные наборы данных платформы. Преподаватель может использовать их в лабораторных работах и анализе группы."
            : `Для роли «${getRoleLabel(user.role, locale)}» доступны только персональные отчёты: собственная успеваемость, личный рейтинг и текущий уровень обучения.`,
          emptyTitle: isTeacher ? "Датасеты не найдены" : "Отчёты пока не сформированы",
          emptyDescription: isTeacher
            ? "Добавьте новый набор данных или уточните поисковый запрос, чтобы увидеть материалы в этом разделе."
            : "После первой лабораторной здесь появятся персональные файлы и отчёты по вашему обучению.",
        };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-fuchsia-300/80">{text.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">{text.title}</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-white/55">{text.description}</p>
      </div>
      {datasets.length ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {datasets.map((dataset) => (
            <DatasetCard key={dataset.id} dataset={dataset} locale={locale} />
          ))}
        </div>
      ) : (
        <EmptyState title={text.emptyTitle} description={text.emptyDescription} />
      )}
    </div>
  );
}
