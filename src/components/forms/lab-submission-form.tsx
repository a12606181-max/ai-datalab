"use client";

import { useActionState, useEffect } from "react";
import { FileUp } from "lucide-react";

import { submitLabAction } from "@/app/actions/learning";
import { useToast } from "@/components/providers/toast-provider";
import { ErrorMessage } from "@/components/ui/error-message";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { initialActionState } from "@/lib/action-state";

export function LabSubmissionForm({
  labId,
}: {
  labId: string;
}) {
  const [state, action] = useActionState(submitLabAction, initialActionState);
  const { pushToast } = useToast();
  const result = state.data as { score?: number; feedback?: string } | undefined;

  useEffect(() => {
    if (!state.message) return;
    pushToast(state.message, state.success ? "success" : "error");
  }, [state, pushToast]);

  return (
    <div className="space-y-5">
      <form action={action} className="space-y-4">
        <input type="hidden" name="labId" value={labId} />
        <div>
          <label className="mb-2 block text-sm font-medium text-white/90">Ваше решение</label>
          <textarea
            name="answerText"
            rows={8}
            placeholder="Опишите ход анализа, признаки, визуализации, модель и выводы. Минимум 30 символов."
            className="w-full rounded-[24px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-fuchsia-400/35"
          />
          <ErrorMessage error={state.fieldErrors?.answerText} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-white/90">CSV-файл решения</label>
          <label className="flex items-center gap-3 rounded-[22px] border border-dashed border-white/12 bg-white/[0.03] px-4 py-4 text-sm text-white/65">
            <FileUp className="h-4 w-4 text-fuchsia-300" />
            <span>Загрузить CSV</span>
            <input type="file" name="file" accept=".csv" className="hidden" />
          </label>
          <ErrorMessage error={state.fieldErrors?.uploadedFileName} />
        </div>
        <FormSubmitButton label="Отправить решение" loadingLabel="Проверка решения..." />
      </form>

      {result?.score ? (
        <div className="rounded-[24px] border border-fuchsia-400/18 bg-fuchsia-500/8 px-5 py-5">
          <p className="text-sm text-fuchsia-200">Автоматическая проверка завершена</p>
          <p className="mt-2 text-4xl font-semibold text-white">{result.score}</p>
          <pre className="mt-4 whitespace-pre-wrap text-sm leading-6 text-white/70">{result.feedback}</pre>
        </div>
      ) : null}
    </div>
  );
}
