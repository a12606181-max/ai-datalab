import { CourseCard } from "@/components/cards/course-card";
import { requireUser } from "@/lib/auth";
import { getCoursesForUser } from "@/lib/data";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireUser();
  const { q } = await searchParams;
  const courses = await getCoursesForUser(user.id, q);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-fuchsia-300/80">Курсы</p>
        <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">Учебные курсы</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-white/55">
          Подберите модуль под свой уровень и переходите от базовой аналитики данных к машинному обучению и AI в образовании.
        </p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
