"use client";

import { useActionState, useEffect } from "react";
import { Bot, Send } from "lucide-react";

import { sendMentorMessageAction } from "@/app/actions/mentor";
import { useToast } from "@/components/providers/toast-provider";
import { ErrorMessage } from "@/components/ui/error-message";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { initialActionState } from "@/lib/action-state";

const quickPrompts = [
  "Объясни регрессию",
  "Как очистить данные?",
  "Почему модель ошибается?",
  "Как построить график?",
  "Что такое признаки?",
];

export function MentorChat({
  messages,
}: {
  messages: Array<{ id: string; role: "USER" | "AI"; content: string; createdAt: Date | string }>;
}) {
  const [state, action] = useActionState(sendMentorMessageAction, initialActionState);
  const { pushToast } = useToast();

  useEffect(() => {
    if (state.success && state.message) pushToast(state.message);
    if (!state.success && state.message) pushToast(state.message, "error");
  }, [state, pushToast]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.7fr_0.8fr]">
      <div className="glass-card rounded-[28px] border p-5">
        <div className="thin-scrollbar max-h-[540px] space-y-4 overflow-y-auto pr-1">
          {messages.map((message) => (
            <div
              key={message.id}
              className={message.role === "USER" ? "flex justify-end" : "flex justify-start"}
            >
              <div
                className={
                  message.role === "USER"
                    ? "max-w-[88%] rounded-[24px] rounded-br-md bg-gradient-to-r from-fuchsia-500 via-pink-500 to-violet-500 px-4 py-3 text-sm text-white shadow-[0_8px_30px_rgba(242,56,255,0.28)] md:max-w-[78%]"
                    : "glass-card flex max-w-[88%] items-start gap-3 rounded-[24px] rounded-bl-md px-4 py-3 text-sm text-white/90 md:max-w-[78%]"
                }
              >
                {message.role === "AI" ? <Bot className="mt-0.5 h-4 w-4 text-fuchsia-300" /> : null}
                <span>{message.content}</span>
              </div>
            </div>
          ))}
        </div>
        <form action={action} className="mt-5 space-y-3">
          <textarea
            name="message"
            rows={4}
            placeholder="Спросите ИИ-наставника про регрессию, очистку данных, признаки, метрики или графики..."
            className="w-full rounded-[22px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-fuchsia-400/35"
          />
          <ErrorMessage error={state.fieldErrors?.message} />
          <div className="flex items-center justify-end">
            <FormSubmitButton label="Отправить" loadingLabel="Отправка..." className="gap-2">
              <Send className="h-4 w-4" />
            </FormSubmitButton>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <div className="glass-card rounded-[28px] border p-5">
          <p className="text-sm font-semibold text-white">Быстрые подсказки</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <form key={prompt} action={action}>
                <input type="hidden" name="message" value={prompt} />
                <button className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-white/70 transition hover:border-fuchsia-400/35 hover:text-white">
                  {prompt}
                </button>
              </form>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-[28px] border p-5">
          <p className="text-sm font-semibold text-white">Как работает наставник</p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-white/55">
            <li>Подсказывает, как улучшить решение лабораторной.</li>
            <li>Объясняет термины аналитики данных и машинного обучения.</li>
            <li>Помогает выбрать график, признаки и метрики.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
