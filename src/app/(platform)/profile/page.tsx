import { ProfileForm } from "@/components/forms/profile-form";
import { GlassCard } from "@/components/ui/glass-card";
import { requireUser } from "@/lib/auth";
import { getProfileData } from "@/lib/data";
import { getLevelLabel, getRoleLabel } from "@/lib/labels";
import { formatDate } from "@/lib/utils";

export default async function ProfilePage() {
  const user = await requireUser();
  const profile = await getProfileData(user.id);

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-fuchsia-300/80">Профиль</p>
        <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">Профиль пользователя</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-white/55">
          Здесь собраны основные данные пользователя, учебный уровень и персональные показатели прогресса.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <GlassCard>
          <h2 className="text-2xl font-semibold text-white">Карточка профиля</h2>
          <div className="mt-5 space-y-4 text-sm text-white/65">
            <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
              <p className="text-white/45">Имя</p>
              <p className="mt-2 text-white">{profile.name}</p>
            </div>
            <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
              <p className="text-white/45">Email</p>
              <p className="mt-2 text-white">{profile.email}</p>
            </div>
            <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
              <p className="text-white/45">Роль</p>
              <p className="mt-2 text-white">{getRoleLabel(profile.role)}</p>
            </div>
            <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
              <p className="text-white/45">Уровень</p>
              <p className="mt-2 text-white">{getLevelLabel(profile.level)}</p>
            </div>
            <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
              <p className="text-white/45">Дата регистрации</p>
              <p className="mt-2 text-white">{formatDate(profile.createdAt)}</p>
            </div>
          </div>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard>
            <h2 className="text-2xl font-semibold text-white">Учебная статистика</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
                <p className="text-sm text-white/45">Завершённые уроки</p>
                <p className="mt-2 text-3xl font-semibold text-white">{profile.completedLessons}</p>
              </div>
              <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
                <p className="text-sm text-white/45">Лабораторные</p>
                <p className="mt-2 text-3xl font-semibold text-white">{profile.completedLabs}</p>
              </div>
              <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
                <p className="text-sm text-white/45">Средний балл</p>
                <p className="mt-2 text-3xl font-semibold text-white">{profile.averageScore}%</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <h2 className="text-2xl font-semibold text-white">Редактирование профиля</h2>
            <div className="mt-5">
              <ProfileForm name={profile.name} email={profile.email} />
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
