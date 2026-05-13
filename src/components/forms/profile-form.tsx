"use client";

import { useActionState, useEffect } from "react";
import { Mail, UserRound } from "lucide-react";

import { updateProfileAction } from "@/app/actions/profile";
import { useToast } from "@/components/providers/toast-provider";
import { ErrorMessage } from "@/components/ui/error-message";
import { FormInput } from "@/components/ui/form-input";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { initialActionState } from "@/lib/action-state";

export function ProfileForm({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const [state, action] = useActionState(updateProfileAction, initialActionState);
  const { pushToast } = useToast();

  useEffect(() => {
    if (!state.message) return;
    pushToast(state.message, state.success ? "success" : "error");
  }, [state, pushToast]);

  return (
    <form action={action} className="space-y-5">
      <div>
        <FormInput defaultValue={name} name="name" label="Имя" icon={UserRound} />
        <ErrorMessage error={state.fieldErrors?.name} />
      </div>
      <div>
        <FormInput defaultValue={email} name="email" type="email" label="Электронная почта" icon={Mail} />
        <ErrorMessage error={state.fieldErrors?.email} />
      </div>
      <FormSubmitButton label="Сохранить профиль" loadingLabel="Сохранение..." />
    </form>
  );
}
