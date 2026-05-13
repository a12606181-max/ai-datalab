import { LabCard } from "@/components/cards/lab-card";
import { requireUser } from "@/lib/auth";
import { getLabs } from "@/lib/data";

export default async function LabsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireUser();
  const { q } = await searchParams;
  const labs = await getLabs(user.id, q);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-fuchsia-300/80">Лабораторные</p>
        <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">Практические лабораторные</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-white/55">
          Здесь студент решает кейсы по анализу данных и AI: очищает датасеты, строит графики, предлагает признаки и получает автоматическую проверку.
        </p>
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        {labs.map((lab) => (
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
  );
}
