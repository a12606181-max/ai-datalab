import { LabCard } from "@/components/cards/lab-card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth";
import { getLabsLocalized } from "@/lib/data";
import { getLocale } from "@/lib/locale-server";

export default async function LabsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireUser();
  const locale = await getLocale();
  const { q } = await searchParams;
  const labs = await getLabsLocalized(user.id, q, locale);

  const text =
    locale === "en"
      ? {
          eyebrow: "Labs",
          title: "Practical labs",
          description:
            "Here students solve data analytics and AI cases: clean datasets, build charts, suggest features, and receive automated review.",
          emptyTitle: "No labs found",
          emptyDescription: "The list is empty right now. Try resetting the search or wait for new practical assignments.",
        }
      : {
          eyebrow: "Лабораторные",
          title: "Практические лабораторные",
          description:
            "Здесь студент решает кейсы по анализу данных и AI: очищает датасеты, строит графики, предлагает признаки и получает автоматическую проверку.",
          emptyTitle: "Лабораторные не найдены",
          emptyDescription: "Сейчас список пуст. Попробуйте сбросить поиск или дождитесь новых практических заданий.",
        };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-fuchsia-300/80">{text.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">{text.title}</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-white/55">{text.description}</p>
      </div>
      {labs.length ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {labs.map((lab) => (
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
      ) : (
        <EmptyState title={text.emptyTitle} description={text.emptyDescription} />
      )}
    </div>
  );
}
