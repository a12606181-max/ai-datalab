import { CourseCard } from "@/components/cards/course-card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth";
import { getCoursesForUser } from "@/lib/data";
import { getLocaleMessages } from "@/lib/locale";
import { getLocale } from "@/lib/locale-server";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireUser();
  const locale = await getLocale();
  const messages = getLocaleMessages(locale);
  const { q } = await searchParams;
  const courses = await getCoursesForUser(user.id, q);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-fuchsia-300/80">{messages.coursesPage.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">{messages.coursesPage.title}</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-white/55">{messages.coursesPage.description}</p>
      </div>
      {courses.length ? (
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} locale={locale} />
          ))}
        </div>
      ) : (
        <EmptyState title={messages.coursesPage.emptyTitle} description={messages.coursesPage.emptyDescription} />
      )}
    </div>
  );
}
