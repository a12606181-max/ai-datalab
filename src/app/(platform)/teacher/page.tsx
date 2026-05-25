import { LineScoreChart } from "@/components/charts/line-score-chart";
import { TeacherWorkspace } from "@/components/forms/teacher-forms";
import { TeacherStats } from "@/components/teacher/teacher-stats";
import { SubmissionTable } from "@/components/teacher/submission-table";
import { EmptyState } from "@/components/ui/empty-state";
import { GlassCard } from "@/components/ui/glass-card";
import { requireTeacher } from "@/lib/auth";
import { getTeacherAnalytics } from "@/lib/data";

export default async function TeacherPage() {
  await requireTeacher();
  const analytics = await getTeacherAnalytics();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-fuchsia-300/80">Панель преподавателя</p>
        <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">Кабинет преподавателя</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-white/55">
          Здесь собраны быстрые действия для создания материалов и живая аналитика по студентам: кто учится, что сдают чаще всего и где группе нужна дополнительная практика.
        </p>
      </div>

      <TeacherWorkspace
        courses={analytics.courses.map((course) => ({
          id: course.id,
          title: course.title,
          lessonsCount: course.lessonsCount,
        }))}
        datasets={analytics.datasets.map((dataset) => ({
          id: dataset.id,
          title: dataset.title,
        }))}
      />

      <TeacherStats
        studentsCount={analytics.studentsCount}
        submissionsCount={analytics.submissionsCount}
        averageScore={analytics.averageScore}
        completedLabs={analytics.completedLabs}
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <GlassCard>
          <h2 className="text-2xl font-semibold text-white">Динамика результатов студентов</h2>
          <div className="mt-5">
            <LineScoreChart data={analytics.chartData} />
          </div>
        </GlassCard>
        <GlassCard>
          <h2 className="text-2xl font-semibold text-white">Темы, которым стоит уделить внимание</h2>
          <div className="mt-5 space-y-3">
            {analytics.weakTopics.length ? (
              analytics.weakTopics.map((topic) => (
                <div key={topic.skill} className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
                  <p className="font-medium text-white">{topic.skill}</p>
                  <p className="mt-2 text-sm text-white/45">
                    Средний уровень группы: {topic.value}%
                  </p>
                </div>
              ))
            ) : (
              <EmptyState
                title="Слабых тем пока не найдено"
                description="Когда аналитика увидит устойчиво слабые навыки группы, они появятся в этом блоке."
              />
            )}
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <GlassCard>
          <h2 className="text-2xl font-semibold text-white">Студенты</h2>
          <div className="mt-5 space-y-3">
            {analytics.students.length ? (
              analytics.students.map((student) => (
                <div key={student.id} className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
                  <p className="font-medium text-white">{student.name}</p>
                  <p className="mt-2 text-sm text-white/45">{student.email}</p>
                  <p className="mt-1 text-sm text-white/45">Уровень: {student.level}</p>
                </div>
              ))
            ) : (
              <EmptyState
                title="Студенты еще не зарегистрированы"
                description="После появления первых студентов здесь будет их список и базовая учебная аналитика."
              />
            )}
          </div>
        </GlassCard>
        <GlassCard>
          <h2 className="text-2xl font-semibold text-white">Последние отправки лабораторных</h2>
          <div className="mt-5">
            <SubmissionTable submissions={analytics.submissions} />
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
