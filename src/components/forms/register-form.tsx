"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { Check, LockKeyhole, Mail, Mars, UserRound, Venus } from "lucide-react";

import { registerAction } from "@/app/actions/auth";
import { useToast } from "@/components/providers/toast-provider";
import { ErrorMessage } from "@/components/ui/error-message";
import { FormInput } from "@/components/ui/form-input";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { initialActionState } from "@/lib/action-state";
import {
  getAvatarOptionsByGender,
  getDefaultAvatarKey,
  UserGenderValue,
} from "@/lib/avatar-options";

export function RegisterForm() {
  const [state, action] = useActionState(registerAction, initialActionState);
  const { pushToast } = useToast();
  const [gender, setGender] = useState<UserGenderValue>("MALE");
  const [avatarKey, setAvatarKey] = useState(getDefaultAvatarKey("MALE"));

  const avatarOptions = useMemo(() => getAvatarOptionsByGender(gender), [gender]);

  useEffect(() => {
    if (!state.message) return;
    pushToast(state.message, state.success ? "success" : "error");
  }, [state, pushToast]);

  useEffect(() => {
    const redirectTo = typeof state.data?.redirectTo === "string" ? state.data.redirectTo : null;
    if (!state.success || !redirectTo) return;

    window.location.replace(redirectTo);
  }, [state.data, state.success]);

  useEffect(() => {
    if (avatarOptions.some((option) => option.key === avatarKey)) return;
    setAvatarKey(getDefaultAvatarKey(gender));
  }, [avatarKey, avatarOptions, gender]);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="gender" value={gender} />
      <input type="hidden" name="avatarKey" value={avatarKey} />

      <div>
        <FormInput name="name" label="Имя" icon={UserRound} placeholder="Ирина Смирнова" />
        <ErrorMessage error={state.fieldErrors?.name} />
      </div>
      <div>
        <FormInput
          name="email"
          type="email"
          label="Электронная почта"
          icon={Mail}
          placeholder="student@aidatalab.ru"
        />
        <ErrorMessage error={state.fieldErrors?.email} />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <FormInput
            name="password"
            type="password"
            label="Пароль"
            icon={LockKeyhole}
            placeholder="Минимум 8 символов"
          />
          <ErrorMessage error={state.fieldErrors?.password} />
        </div>
        <div>
          <FormInput
            name="confirmPassword"
            type="password"
            label="Повтор пароля"
            icon={LockKeyhole}
            placeholder="Повторите пароль"
          />
          <ErrorMessage error={state.fieldErrors?.confirmPassword} />
        </div>
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-white/90">Роль</label>
        <select
          name="role"
          defaultValue="STUDENT"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-400/35"
        >
          <option value="STUDENT" className="bg-[#0f0c18]">
            Студент
          </option>
          <option value="TEACHER" className="bg-[#0f0c18]">
            Преподаватель
          </option>
        </select>
        <ErrorMessage error={state.fieldErrors?.role} />
      </div>
      <div>
        <span className="mb-2 block text-sm font-medium text-white/90">Пол</span>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setGender("MALE")}
            className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm transition ${
              gender === "MALE"
                ? "border-fuchsia-400/60 bg-fuchsia-500/15 text-white"
                : "border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:text-white"
            }`}
          >
            <Mars className="h-4 w-4" />
            Мужской
          </button>
          <button
            type="button"
            onClick={() => setGender("FEMALE")}
            className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm transition ${
              gender === "FEMALE"
                ? "border-fuchsia-400/60 bg-fuchsia-500/15 text-white"
                : "border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:text-white"
            }`}
          >
            <Venus className="h-4 w-4" />
            Женский
          </button>
        </div>
        <ErrorMessage error={state.fieldErrors?.gender} />
      </div>
      <div>
        <span className="mb-2 block text-sm font-medium text-white/90">Выберите аватар</span>
        <p className="mb-3 text-xs text-white/45">
          Варианты сделаны в более чётком качестве, чтобы хорошо выглядеть и на телефоне, и на большом экране.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {avatarOptions.map((option) => {
            const selected = option.key === avatarKey;

            return (
              <button
                key={option.key}
                type="button"
                onClick={() => setAvatarKey(option.key)}
                className={`group relative overflow-hidden rounded-[24px] border p-2 text-left transition ${
                  selected
                    ? "border-fuchsia-400/70 bg-fuchsia-500/10 shadow-[0_0_28px_rgba(217,70,239,0.18)]"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
                }`}
                aria-pressed={selected}
                aria-label={option.label}
              >
                <div className="relative aspect-square overflow-hidden rounded-[20px] bg-black/20">
                  <Image
                    src={option.src}
                    alt={option.label}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 33vw, 180px"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 px-1 pb-1">
                  <span className="min-w-0 text-sm font-medium text-white/85">
                    {option.label}
                  </span>
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                      selected
                        ? "border-fuchsia-300 bg-fuchsia-500 text-white"
                        : "border-white/15 bg-white/5 text-transparent"
                    }`}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        <ErrorMessage error={state.fieldErrors?.avatarKey} />
      </div>
      <div>
        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75">
          <input type="checkbox" name="acceptTerms" className="h-4 w-4 accent-fuchsia-500" />
          Я соглашаюсь с условиями использования платформы
        </label>
        <ErrorMessage error={state.fieldErrors?.acceptTerms} />
      </div>
      <FormSubmitButton
        label="Создать аккаунт"
        loadingLabel="Регистрация..."
        className="w-full justify-center"
      />
      <p className="text-sm text-white/55">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="text-fuchsia-300 hover:text-white">
          Войти
        </Link>
      </p>
    </form>
  );
}
