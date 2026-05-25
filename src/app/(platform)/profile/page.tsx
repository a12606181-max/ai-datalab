import { ProfileForm } from "@/components/forms/profile-form";
import { GlassCard } from "@/components/ui/glass-card";
import { requireUser } from "@/lib/auth";
import { getProfileData } from "@/lib/data";
import { getLevelLabel, getRoleLabel } from "@/lib/labels";
import { getLocale } from "@/lib/locale-server";
import { formatDate } from "@/lib/utils";

export default async function ProfilePage() {
  const user = await requireUser();
  const locale = await getLocale();
  const profile = await getProfileData(user.id);

  if (!profile) return null;

  const text =
    locale === "en"
      ? {
          eyebrow: "Profile",
          title: "User profile",
          description: "This page contains the main user data, learning level, and personal progress indicators.",
          card: "Profile card",
          name: "Name",
          role: "Role",
          level: "Level",
          registrationDate: "Registration date",
          stats: "Learning statistics",
          lessons: "Completed lessons",
          labs: "Labs",
          average: "Average score",
          edit: "Edit profile",
        }
      : {
          eyebrow: "Профиль",
          title: "Профиль пользователя",
          description: "Здесь собраны основные данные пользователя, учебный уровень и персональные показатели прогресса.",
          card: "Карточка профиля",
          name: "Имя",
          role: "Роль",
          level: "Уровень",
          registrationDate: "Дата регистрации",
          stats: "Учебная статистика",
          lessons: "Завершённые уроки",
          labs: "Лабораторные",
          average: "Средний балл",
          edit: "Редактирование профиля",
        };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-fuchsia-300/80">{text.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">{text.title}</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-white/55">{text.description}</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <GlassCard>
          <h2 className="text-2xl font-semibold text-white">{text.card}</h2>
          <div className="mt-5 space-y-4 text-sm text-white/65">
            <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
              <p className="text-white/45">{text.name}</p>
              <p className="mt-2 text-white">{profile.name}</p>
            </div>
            <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
              <p className="text-white/45">Email</p>
              <p className="mt-2 text-white">{profile.email}</p>
            </div>
            <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
              <p className="text-white/45">{text.role}</p>
              <p className="mt-2 text-white">{getRoleLabel(profile.role, locale)}</p>
            </div>
            <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
              <p className="text-white/45">{text.level}</p>
              <p className="mt-2 text-white">{getLevelLabel(profile.level, locale)}</p>
            </div>
            <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
              <p className="text-white/45">{text.registrationDate}</p>
              <p className="mt-2 text-white">{formatDate(profile.createdAt, locale)}</p>
            </div>
          </div>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard>
            <h2 className="text-2xl font-semibold text-white">{text.stats}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
                <p className="text-sm text-white/45">{text.lessons}</p>
                <p className="mt-2 text-3xl font-semibold text-white">{profile.completedLessons}</p>
              </div>
              <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
                <p className="text-sm text-white/45">{text.labs}</p>
                <p className="mt-2 text-3xl font-semibold text-white">{profile.completedLabs}</p>
              </div>
              <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
                <p className="text-sm text-white/45">{text.average}</p>
                <p className="mt-2 text-3xl font-semibold text-white">{profile.averageScore}%</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <h2 className="text-2xl font-semibold text-white">{text.edit}</h2>
            <div className="mt-5">
              <ProfileForm name={profile.name} email={profile.email} locale={locale} />
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
