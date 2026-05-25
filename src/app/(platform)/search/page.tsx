import { CourseCard } from "@/components/cards/course-card";
import { DatasetCard } from "@/components/cards/dataset-card";
import { LabCard } from "@/components/cards/lab-card";
import { GlassCard } from "@/components/ui/glass-card";
import { requireUser } from "@/lib/auth";
import { getGlobalSearchResultsLocalized } from "@/lib/data";
import { getLocale } from "@/lib/locale-server";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireUser();
  const locale = await getLocale();
  const { q } = await searchParams;
  const results = await getGlobalSearchResultsLocalized(user.id, user.role, q, locale);

  const text =
    locale === "en"
      ? {
          eyebrow: "Search",
          title: "Platform-wide search",
          description: "Find courses, labs, and available data across the entire platform.",
          emptyQueryTitle: "Enter a query in the top search bar",
          emptyQueryDescription: "For example: Python, chart, performance, machine learning.",
          resultsTitle: "Results for query",
          found: "Found",
          courses: "Courses",
          labs: "Labs",
          datasets: user.role === "TEACHER" ? "Datasets" : "Personal reports",
          nothingTitle: "Nothing found",
          nothingDescription: "Try a broader query: for example, not regressions but regression.",
        }
      : {
          eyebrow: "Поиск",
          title: "Глобальный поиск по платформе",
          description: "Здесь можно найти курсы, лабораторные и доступные данные по всей платформе.",
          emptyQueryTitle: "Введите запрос в верхней строке поиска",
          emptyQueryDescription: "Например: Python, график, успеваемость, машинное обучение.",
          resultsTitle: "Результаты по запросу",
          found: "Найдено",
          courses: "Курсы",
          labs: "Лабораторные",
          datasets: user.role === "TEACHER" ? "Наборы данных" : "Личные отчёты",
          nothingTitle: "Ничего не найдено",
          nothingDescription: "Попробуйте более общий запрос: например, не регрессии, а регрессия.",
        };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-fuchsia-300/80">{text.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">{text.title}</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-white/55">{text.description}</p>
      </div>

      {!results.query ? (
        <GlassCard>
          <h2 className="text-xl font-semibold text-white">{text.emptyQueryTitle}</h2>
          <p className="mt-3 text-sm leading-6 text-white/55">{text.emptyQueryDescription}</p>
        </GlassCard>
      ) : null}

      {results.query ? (
        <GlassCard>
          <h2 className="text-xl font-semibold text-white">
            {text.resultsTitle}: {results.query}
          </h2>
          <p className="mt-3 text-sm text-white/55">
            {text.found}: {results.courses.length} / {text.courses.toLowerCase()}, {results.labs.length} / {text.labs.toLowerCase()}, {results.datasets.length} / {text.datasets.toLowerCase()}.
          </p>
        </GlassCard>
      ) : null}

      {results.courses.length ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">{text.courses}</h2>
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {results.courses.map((course) => (
              <CourseCard key={course.id} course={course} locale={locale} />
            ))}
          </div>
        </div>
      ) : null}

      {results.labs.length ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">{text.labs}</h2>
          <div className="grid gap-5 lg:grid-cols-2">
            {results.labs.map((lab) => (
              <LabCard
                key={lab.id}
                locale={locale}
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
          <h2 className="text-2xl font-semibold text-white">{text.datasets}</h2>
          <div className="grid gap-5 lg:grid-cols-2">
            {results.datasets.map((dataset) => (
              <DatasetCard key={dataset.id} dataset={dataset} locale={locale} />
            ))}
          </div>
        </div>
      ) : null}

      {results.query && !results.courses.length && !results.labs.length && !results.datasets.length ? (
        <GlassCard>
          <h2 className="text-xl font-semibold text-white">{text.nothingTitle}</h2>
          <p className="mt-3 text-sm leading-6 text-white/55">{text.nothingDescription}</p>
        </GlassCard>
      ) : null}
    </div>
  );
}
