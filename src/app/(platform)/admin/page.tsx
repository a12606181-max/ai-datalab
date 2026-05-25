import { UserStatus } from "@prisma/client";
import { BookCheck, GraduationCap, ShieldCheck, Users } from "lucide-react";

import {
  approveTeacherAction,
  deleteUserAction,
  rejectTeacherAction,
} from "@/app/actions/admin";
import { EmptyState } from "@/components/ui/empty-state";
import { GlassCard } from "@/components/ui/glass-card";
import { StatCard } from "@/components/ui/stat-card";
import { requireAdmin } from "@/lib/auth";
import { getAdminDashboardData } from "@/lib/data";
import { getLevelLabel, getRoleLabel } from "@/lib/labels";
import { getLocale } from "@/lib/locale-server";
import { formatDate } from "@/lib/utils";

function getStatusLabel(status: UserStatus, locale: "ru" | "en") {
  if (locale === "en") {
    if (status === UserStatus.APPROVED) return "Approved";
    if (status === UserStatus.REJECTED) return "Rejected";
    return "Pending";
  }

  if (status === UserStatus.APPROVED) return "Одобрен";
  if (status === UserStatus.REJECTED) return "Отклонён";
  return "На проверке";
}

function getStatusClassName(status: UserStatus) {
  if (status === UserStatus.APPROVED) {
    return "border-emerald-400/20 bg-emerald-500/10 text-emerald-100";
  }

  if (status === UserStatus.REJECTED) {
    return "border-rose-400/20 bg-rose-500/10 text-rose-100";
  }

  return "border-amber-400/20 bg-amber-500/10 text-amber-100";
}

function ActionButton({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <button
      type="submit"
      className={
        tone === "danger"
          ? "rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-2 text-sm text-rose-100 transition hover:bg-rose-500/20"
          : "rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/80 transition hover:bg-white/[0.08]"
      }
    >
      {children}
    </button>
  );
}

export default async function AdminPage() {
  await requireAdmin();
  const locale = await getLocale();
  const admin = await getAdminDashboardData();

  const text =
    locale === "en"
      ? {
          eyebrow: "Administration",
          title: "Admin panel",
          description:
            "Here you can track student statistics, approve new teachers, and manage the active platform users.",
          queueTitle: "Teacher approval queue",
          queueDescription:
            "New teacher registrations appear here. Approve the teacher to unlock the teacher workspace, or reject the request.",
          approve: "Approve",
          reject: "Reject",
          studentsTitle: "Student statistics",
          studentsDescription:
            "A compact list of students with progress indicators across lessons and labs.",
          usersTitle: "User management",
          usersDescription: "You can remove students and teachers from the platform here.",
          emptyQueueTitle: "No pending teacher requests",
          emptyQueueDescription: "When a new teacher registers, the request will appear in this section.",
          name: "Name",
          email: "Email",
          level: "Level",
          lessons: "Lessons",
          labs: "Labs",
          average: "Average score",
          registeredAt: "Registered",
          role: "Role",
          status: "Status",
          delete: "Delete",
          studentsCount: "Students",
          teachersCount: "Approved teachers",
          pendingCount: "Pending requests",
          scoreCaption: "Average lab score",
          lessonsCaption: "Completed lessons on the platform",
          labsCaption: "Reviewed lab submissions",
        }
      : {
          eyebrow: "Администрирование",
          title: "Панель администратора",
          description:
            "Здесь собрана статистика по обучающимся, очередь новых преподавателей и управление пользователями платформы.",
          queueTitle: "Заявки преподавателей",
          queueDescription:
            "Новые регистрации преподавателей появляются здесь. Можно одобрить доступ к кабинету преподавателя или отклонить заявку.",
          approve: "Одобрить",
          reject: "Отклонить",
          studentsTitle: "Статистика по обучающимся",
          studentsDescription:
            "Короткая сводка по студентам: прогресс по урокам, количество лабораторных и средний балл.",
          usersTitle: "Управление пользователями",
          usersDescription: "Здесь можно удалять студентов и преподавателей из системы.",
          emptyQueueTitle: "Новых заявок преподавателей нет",
          emptyQueueDescription: "Когда новый преподаватель зарегистрируется, заявка появится в этом блоке.",
          name: "Имя",
          email: "Email",
          level: "Уровень",
          lessons: "Уроки",
          labs: "Лабы",
          average: "Средний балл",
          registeredAt: "Дата регистрации",
          role: "Роль",
          status: "Статус",
          delete: "Удалить",
          studentsCount: "Студенты",
          teachersCount: "Одобренные преподаватели",
          pendingCount: "Заявки на проверке",
          scoreCaption: "Средний балл по лабораторным",
          lessonsCaption: "Всего завершённых уроков",
          labsCaption: "Проверенных лабораторных",
        };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-fuchsia-300/80">{text.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">{text.title}</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-white/55">{text.description}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title={text.studentsCount}
          value={String(admin.stats.studentsCount)}
          caption={text.studentsDescription}
          icon={Users}
        />
        <StatCard
          title={text.teachersCount}
          value={String(admin.stats.approvedTeachersCount)}
          caption={text.queueDescription}
          icon={ShieldCheck}
        />
        <StatCard
          title={text.pendingCount}
          value={String(admin.stats.pendingTeachersCount)}
          caption={text.queueTitle}
          icon={GraduationCap}
        />
        <StatCard
          title={text.average}
          value={`${admin.stats.averageScore}%`}
          caption={text.scoreCaption}
          icon={BookCheck}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <GlassCard>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">{text.queueTitle}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">{text.queueDescription}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/65">
              {text.pendingCount}: <span className="text-white">{admin.pendingTeachers.length}</span>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {admin.pendingTeachers.length ? (
              admin.pendingTeachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-lg font-semibold text-white">{teacher.name}</p>
                        <span
                          className={`rounded-full border px-3 py-1 text-xs ${getStatusClassName(teacher.status)}`}
                        >
                          {getStatusLabel(teacher.status, locale)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-white/55">{teacher.email}</p>
                      <p className="mt-1 text-sm text-white/45">
                        {text.registeredAt}: {formatDate(teacher.createdAt, locale)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <form action={approveTeacherAction}>
                        <input type="hidden" name="userId" value={teacher.id} />
                        <ActionButton>{text.approve}</ActionButton>
                      </form>
                      <form action={rejectTeacherAction}>
                        <input type="hidden" name="userId" value={teacher.id} />
                        <ActionButton tone="danger">{text.reject}</ActionButton>
                      </form>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                title={text.emptyQueueTitle}
                description={text.emptyQueueDescription}
              />
            )}
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="text-2xl font-semibold text-white">{text.studentsTitle}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">{text.studentsDescription}</p>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm text-white/70">
              <thead className="text-white/45">
                <tr>
                  <th className="pb-3 pr-4 font-medium">{text.name}</th>
                  <th className="pb-3 pr-4 font-medium">{text.level}</th>
                  <th className="pb-3 pr-4 font-medium">{text.lessons}</th>
                  <th className="pb-3 pr-4 font-medium">{text.labs}</th>
                  <th className="pb-3 font-medium">{text.average}</th>
                </tr>
              </thead>
              <tbody>
                {admin.studentRows.map((student) => (
                  <tr key={student.id} className="border-t border-white/8">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-white">{student.name}</p>
                      <p className="mt-1 text-xs text-white/45">{student.email}</p>
                    </td>
                    <td className="py-3 pr-4">{getLevelLabel(student.level, locale)}</td>
                    <td className="py-3 pr-4">{student.completedLessons}</td>
                    <td className="py-3 pr-4">{student.submittedLabs}</td>
                    <td className="py-3">{student.averageScore}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <h2 className="text-2xl font-semibold text-white">{text.usersTitle}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">{text.usersDescription}</p>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm text-white/70">
            <thead className="text-white/45">
              <tr>
                <th className="pb-3 pr-4 font-medium">{text.name}</th>
                <th className="pb-3 pr-4 font-medium">{text.role}</th>
                <th className="pb-3 pr-4 font-medium">{text.status}</th>
                <th className="pb-3 pr-4 font-medium">{text.registeredAt}</th>
                <th className="pb-3 font-medium">{text.delete}</th>
              </tr>
            </thead>
            <tbody>
              {admin.users.map((user) => (
                <tr key={user.id} className="border-t border-white/8">
                  <td className="py-3 pr-4">
                    <p className="font-medium text-white">{user.name}</p>
                    <p className="mt-1 text-xs text-white/45">{user.email}</p>
                  </td>
                  <td className="py-3 pr-4">{getRoleLabel(user.role, locale)}</td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-full border px-3 py-1 text-xs ${getStatusClassName(user.status)}`}>
                      {getStatusLabel(user.status, locale)}
                    </span>
                  </td>
                  <td className="py-3 pr-4">{formatDate(user.createdAt, locale)}</td>
                  <td className="py-3">
                    <form action={deleteUserAction}>
                      <input type="hidden" name="userId" value={user.id} />
                      <ActionButton tone="danger">{text.delete}</ActionButton>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
            <p className="text-sm text-white/45">{text.lessonsCaption}</p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {admin.stats.completedLessonsCount}
            </p>
          </div>
          <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
            <p className="text-sm text-white/45">{text.labsCaption}</p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {admin.stats.completedLabsCount}
            </p>
          </div>
          <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
            <p className="text-sm text-white/45">{text.average}</p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {admin.stats.averageScore}%
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
