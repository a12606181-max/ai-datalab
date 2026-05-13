import { CourseCard } from "@/components/cards/course-card";
import { DatasetCard } from "@/components/cards/dataset-card";
import { LabCard } from "@/components/cards/lab-card";
import { GlassCard } from "@/components/ui/glass-card";
import { requireUser } from "@/lib/auth";
import { getGlobalSearchResults } from "@/lib/data";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireUser();
  const { q } = await searchParams;
  const results = await getGlobalSearchResults(user.id, user.role, q);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-fuchsia-300/80">Поиск</p>
        <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">Глобальный поиск по платформе</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-white/55">
          Здесь можно найти курсы, лабораторные и доступные данные по всей платформе.
        </p>
      </div>

      {!results.query ? (
        <GlassCard>
          <h2 className="text-xl font-semibold text-white">Введите запрос в верхней строке поиска</h2>
          <p className="mt-3 text-sm leading-6 text-white/55">
            Например: <span className="text-white">Python</span>, <span className="text-white">график</span>,{" "}
            <span className="text-white">успеваемость</span>, <span className="text-white">машинное обучение</span>.
          </p>
        </GlassCard>
      ) : null}

      {results.query ? (
        <GlassCard>
          <h2 className="text-xl font-semibold text-white">Результаты по запросу: {results.query}</h2>
          <p className="mt-3 text-sm text-white/55">
            Найдено: {results.courses.length} курсов, {results.labs.length} лабораторных и {results.datasets.length} наборов данных.
          </p>
        </GlassCard>
      ) : null}

      {results.courses.length ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Курсы</h2>
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {results.courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      ) : null}

      {results.labs.length ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Лабораторные</h2>
          <div className="grid gap-5 lg:grid-cols-2">
            {results.labs.map((lab) => (
              <LabCard
                key={lab.id}
                lab={{
                  id: lab.id,
                  title: lab.title,
                  description: lab.description,
                  goal: lab.goal,
                  difficulty: lab.difficulty,
                  deadline: lab.deadline,
                  datasetTitle: lab.dataset?.title,
                  status: lab.status,
                }}
              />
            ))}
          </div>
        </div>
      ) : null}

      {results.datasets.length ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">
            {user.role === "TEACHER" ? "Наборы данных" : "Личные отчёты"}
          </h2>
          <div className="grid gap-5 lg:grid-cols-2">
            {results.datasets.map((dataset) => (
              <DatasetCard key={dataset.id} dataset={dataset} />
            ))}
          </div>
        </div>
      ) : null}

      {results.query &&
      !results.courses.length &&
      !results.labs.length &&
      !results.datasets.length ? (
        <GlassCard>
          <h2 className="text-xl font-semibold text-white">Ничего не найдено</h2>
          <p className="mt-3 text-sm leading-6 text-white/55">
            Попробуйте более общий запрос: например, не <span className="text-white">регрессии</span>, а{" "}
            <span className="text-white">регрессия</span>.
          </p>
        </GlassCard>
      ) : null}
    </div>
  );
}
