"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { LockKeyhole, Mail, UserRound } from "lucide-react";

import { registerAction } from "@/app/actions/auth";
import { useToast } from "@/components/providers/toast-provider";
import { ErrorMessage } from "@/components/ui/error-message";
import { FormInput } from "@/components/ui/form-input";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { initialActionState } from "@/lib/action-state";

export function RegisterForm() {
  const [state, action] = useActionState(registerAction, initialActionState);
  const { pushToast } = useToast();

  useEffect(() => {
    if (state.message && !state.success) pushToast(state.message, "error");
  }, [state, pushToast]);

  return (
    <form action={action} className="space-y-5">
      <div>
        <FormInput name="name" label="Имя" icon={UserRound} placeholder="Ирина Смирнова" />
        <ErrorMessage error={state.fieldErrors?.name} />
      </div>
      <div>
        <FormInput name="email" type="email" label="Электронная почта" icon={Mail} placeholder="student@aidatalab.ru" />
        <ErrorMessage error={state.fieldErrors?.email} />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <FormInput name="password" type="password" label="Пароль" icon={LockKeyhole} placeholder="Минимум 8 символов" />
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
        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75">
          <input type="checkbox" name="acceptTerms" className="h-4 w-4 accent-fuchsia-500" />
          Я соглашаюсь с условиями использования платформы
        </label>
        <ErrorMessage error={state.fieldErrors?.acceptTerms} />
      </div>
      <FormSubmitButton label="Создать аккаунт" loadingLabel="Регистрация..." className="w-full justify-center" />
      <p className="text-sm text-white/55">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="text-fuchsia-300 hover:text-white">
          Войти
        </Link>
      </p>
    </form>
  );
}
