"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { LockKeyhole, Mail } from "lucide-react";

import { loginAction } from "@/app/actions/auth";
import { useToast } from "@/components/providers/toast-provider";
import { ErrorMessage } from "@/components/ui/error-message";
import { FormInput } from "@/components/ui/form-input";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { initialActionState } from "@/lib/action-state";

export function LoginForm() {
  const [state, action] = useActionState(loginAction, initialActionState);
  const { pushToast } = useToast();

  useEffect(() => {
    if (state.message && !state.success) pushToast(state.message, "error");
  }, [state, pushToast]);

  return (
    <form action={action} className="space-y-5">
      <div>
        <FormInput name="email" type="email" label="Электронная почта" icon={Mail} placeholder="student@aidatalab.ru" />
        <ErrorMessage error={state.fieldErrors?.email} />
      </div>
      <div>
        <FormInput name="password" type="password" label="Пароль" icon={LockKeyhole} placeholder="Введите пароль" />
        <ErrorMessage error={state.fieldErrors?.password} />
      </div>
      <FormSubmitButton label="Войти в платформу" loadingLabel="Вход..." className="w-full justify-center" />
      <p className="text-sm text-white/55">
        Нет аккаунта?{" "}
        <Link href="/register" className="text-fuchsia-300 hover:text-white">
          Зарегистрироваться
        </Link>
      </p>
    </form>
  );
}
