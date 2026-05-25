"use client";

import { useActionState, useEffect } from "react";
import { Mail, UserRound } from "lucide-react";

import { updateProfileAction } from "@/app/actions/profile";
import { useToast } from "@/components/providers/toast-provider";
import { ErrorMessage } from "@/components/ui/error-message";
import { FormInput } from "@/components/ui/form-input";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { initialActionState } from "@/lib/action-state";
import { AppLocale } from "@/lib/locale";

export function ProfileForm({
  name,
  email,
  locale = "ru",
}: {
  name: string;
  email: string;
  locale?: AppLocale;
}) {
  const [state, action] = useActionState(updateProfileAction, initialActionState);
  const { pushToast } = useToast();

  useEffect(() => {
    if (!state.message) return;
    pushToast(state.message, state.success ? "success" : "error");
  }, [state, pushToast]);

  const text =
    locale === "en"
      ? {
          name: "Name",
          email: "Email",
          save: "Save profile",
          saving: "Saving...",
        }
      : {
          name: "Имя",
          email: "Электронная почта",
          save: "Сохранить профиль",
          saving: "Сохранение...",
        };

  return (
    <form action={action} className="space-y-5">
      <div>
        <FormInput defaultValue={name} name="name" label={text.name} icon={UserRound} />
        <ErrorMessage error={state.fieldErrors?.name} />
      </div>
      <div>
        <FormInput defaultValue={email} name="email" type="email" label={text.email} icon={Mail} />
        <ErrorMessage error={state.fieldErrors?.email} />
      </div>
      <FormSubmitButton label={text.save} loadingLabel={text.saving} />
    </form>
  );
}
