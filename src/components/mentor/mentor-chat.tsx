"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Bot,
  BrainCircuit,
  Send,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { sendMentorMessageAction } from "@/app/actions/mentor";
import { initialActionState } from "@/lib/action-state";
import { AppLocale } from "@/lib/locale";
import { parseMentorStructuredMessage } from "@/lib/mentor-content";
import { useToast } from "@/components/providers/toast-provider";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";

const quickPromptsByLocale = {
  ru: [
    "Какой курс пройти для изучения Python?",
    "Проанализируй мой прогресс и скажи, что делать дальше",
    "Какую лабораторную мне лучше пройти следующей?",
    "Подбери материалы под мой текущий уровень",
    "Объясни тему урока простыми словами",
  ],
  en: [
    "Which course should I take to learn Python?",
    "Analyze my progress and tell me what to do next",
    "Which lab should I complete next?",
    "Recommend materials for my current level",
    "Explain the lesson topic in simple words",
  ],
} as const;

type MentorChatMessage = {
  id: string;
  role: "USER" | "AI";
  content: string;
  createdAt: Date | string;
  pending?: boolean;
};

function splitMentorText(content: string) {
  return content
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function scrollToBottom(node: HTMLDivElement | null) {
  if (!node) return;
  requestAnimationFrame(() => {
    node.scrollTop = node.scrollHeight;
  });
}

export function MentorChat({
  messages,
  locale = "ru",
}: {
  messages: Array<{ id: string; role: "USER" | "AI"; content: string; createdAt: Date | string }>;
  locale?: AppLocale;
}) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [isSending, startTransition] = useTransition();
  const [draft, setDraft] = useState("");
  const [messageError, setMessageError] = useState<string | undefined>();
  const [pendingMessages, setPendingMessages] = useState<MentorChatMessage[]>([]);
  const messagesRef = useRef<HTMLDivElement>(null);
  const displayedMessages = useMemo<MentorChatMessage[]>(
    () => [...messages, ...pendingMessages],
    [messages, pendingMessages],
  );

  useEffect(() => {
    scrollToBottom(messagesRef.current);
  }, [displayedMessages]);

  const text = useMemo(
    () =>
      locale === "en"
        ? {
            strengths: "Strengths",
            focusAreas: "Growth areas",
            nextSteps: "What to do next",
            suggestions: "Suitable platform materials",
            emptyTitle: "The dialog has not started yet",
            emptyDescription:
              "Ask about a course, lesson, lab, quiz, site navigation, or request a personal AI progress review. The mentor will pick materials directly from the platform.",
            placeholder:
              "For example: which course should I take for Python, how can I improve my progress, which lab should I open next?",
            send: "Send",
            sending: "AI is thinking...",
            thinking: "AI is thinking...",
            quickTips: "Quick prompts",
            howWorks: "How the mentor works",
            bullets: [
              "Answers questions about courses, lessons, quizzes, labs, datasets, and the platform.",
              "Selects real materials from the site and gives buttons to open a course, lesson, or lab directly from chat.",
              "Analyzes your progress in lessons, labs, and skills, then suggests the next steps.",
            ],
          }
        : {
            strengths: "Сильные стороны",
            focusAreas: "Зоны роста",
            nextSteps: "Что делать дальше",
            suggestions: "Подходящие материалы на платформе",
            emptyTitle: "Диалог ещё не начат",
            emptyDescription:
              "Спросите про курс, урок, лабораторную, тест, навигацию по сайту или попросите персональный AI-разбор прогресса. Наставник подберёт материалы прямо с платформы.",
            placeholder:
              "Например: какой курс пройти для Python, как улучшить мой прогресс, какую лабораторную открыть следующей?",
            send: "Отправить",
            sending: "ИИ думает...",
            thinking: "ИИ думает...",
            quickTips: "Быстрые подсказки",
            howWorks: "Как работает наставник",
            bullets: [
              "Отвечает по курсам, урокам, тестам, лабораторным, датасетам и работе платформы.",
              "Подбирает реальные материалы с сайта и даёт кнопки, чтобы открыть курс, урок или лабораторную прямо из чата.",
              "Анализирует ваш прогресс по урокам, лабораторным и навыкам, а затем предлагает следующие шаги.",
            ],
          },
    [locale],
  );

  const quickPrompts = quickPromptsByLocale[locale];

  async function submitMessage(message: string) {
    const trimmed = message.trim();
    if (!trimmed || isSending) return;

    setMessageError(undefined);

    const requestId = `pending-${Date.now()}`;
    const optimisticMessages: MentorChatMessage[] = [
      {
        id: `${requestId}-user`,
        role: "USER",
        content: trimmed,
        createdAt: new Date().toISOString(),
        pending: true,
      },
      {
        id: `${requestId}-ai`,
        role: "AI",
        content: text.thinking,
        createdAt: new Date().toISOString(),
        pending: true,
      },
    ];

    setPendingMessages((prev) => [...prev, ...optimisticMessages]);
    setDraft("");
    scrollToBottom(messagesRef.current);

    const formData = new FormData();
    formData.set("message", trimmed);

    startTransition(async () => {
      const result = await sendMentorMessageAction(initialActionState, formData);

      if (!result.success) {
        setPendingMessages((prev) =>
          prev.filter((item) => item.id !== `${requestId}-user` && item.id !== `${requestId}-ai`),
        );
        setDraft(trimmed);

        const fieldError = result.fieldErrors?.message;
        setMessageError(Array.isArray(fieldError) ? fieldError[0] : fieldError);

        if (result.message) pushToast(result.message, "error");
        return;
      }

      setPendingMessages((prev) =>
        prev.filter((item) => item.id !== `${requestId}-user` && item.id !== `${requestId}-ai`),
      );
      router.refresh();
    });
  }

  function handleTextareaKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    void submitMessage(draft);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.7fr_0.8fr]">
      <div className="glass-card rounded-[28px] border p-5">
        <div
          ref={messagesRef}
          className="thin-scrollbar max-h-[540px] space-y-4 overflow-y-auto pr-1"
        >
          {displayedMessages.length ? (
            displayedMessages.map((message) => {
              const parsed =
                message.role === "AI" && !message.pending
                  ? parseMentorStructuredMessage(message.content)
                  : null;
              const visibleText = parsed?.text ?? message.content;
              const paragraphs = splitMentorText(visibleText);

              return (
                <div
                  key={message.id}
                  className={message.role === "USER" ? "flex justify-end" : "flex justify-start"}
                >
                  <div
                    className={
                      message.role === "USER"
                        ? "max-w-[88%] rounded-[24px] rounded-br-md bg-gradient-to-r from-fuchsia-500 via-pink-500 to-violet-500 px-4 py-3 text-sm text-white shadow-[0_8px_30px_rgba(242,56,255,0.28)] md:max-w-[78%]"
                        : "glass-card flex max-w-[92%] items-start gap-3 rounded-[24px] rounded-bl-md px-4 py-4 text-sm text-white/90 md:max-w-[82%]"
                    }
                  >
                    {message.role === "AI" ? (
                      <Bot className="mt-0.5 h-4 w-4 shrink-0 text-fuchsia-300" />
                    ) : null}
                    <div className="min-w-0 flex-1 space-y-4">
                      <div className="space-y-3">
                        {(paragraphs.length ? paragraphs : [visibleText]).map((paragraph, index) => (
                          <p
                            key={index}
                            className={`break-words whitespace-pre-wrap leading-6 ${
                              message.pending ? "text-white/60" : "text-white/90"
                            }`}
                          >
                            {paragraph}
                          </p>
                        ))}
                      </div>

                      {parsed?.analysis ? (
                        <div className="rounded-[22px] border border-cyan-400/20 bg-cyan-500/8 p-4">
                          <div className="flex items-center gap-2 text-sm font-semibold text-cyan-100">
                            <TrendingUp className="h-4 w-4" />
                            <span>{parsed.analysis.title}</span>
                          </div>
                          <p className="mt-3 break-words leading-6 text-white/80">
                            {parsed.analysis.summary}
                          </p>
                          <div className="mt-4 grid gap-3 xl:grid-cols-3">
                            <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-3">
                              <p className="text-xs uppercase tracking-[0.22em] text-white/40">
                                {text.strengths}
                              </p>
                              <div className="mt-2 space-y-2">
                                {parsed.analysis.strengths.map((item, index) => (
                                  <p key={index} className="break-words text-sm leading-6 text-white/75">
                                    {item}
                                  </p>
                                ))}
                              </div>
                            </div>
                            <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-3">
                              <p className="text-xs uppercase tracking-[0.22em] text-white/40">
                                {text.focusAreas}
                              </p>
                              <div className="mt-2 space-y-2">
                                {parsed.analysis.focusAreas.map((item, index) => (
                                  <p key={index} className="break-words text-sm leading-6 text-white/75">
                                    {item}
                                  </p>
                                ))}
                              </div>
                            </div>
                            <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-3">
                              <p className="text-xs uppercase tracking-[0.22em] text-white/40">
                                {text.nextSteps}
                              </p>
                              <div className="mt-2 space-y-2">
                                {parsed.analysis.nextSteps.map((item, index) => (
                                  <p key={index} className="break-words text-sm leading-6 text-white/75">
                                    {item}
                                  </p>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {parsed?.suggestions?.length ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm font-semibold text-fuchsia-100">
                            <Sparkles className="h-4 w-4 text-fuchsia-300" />
                            <span>{text.suggestions}</span>
                          </div>
                          <div className="grid gap-3 md:grid-cols-2">
                            {parsed.suggestions.map((suggestion) => (
                              <div
                                key={`${suggestion.type}-${suggestion.href}`}
                                className="rounded-[22px] border border-fuchsia-400/18 bg-fuchsia-500/8 p-4"
                              >
                                <p className="break-words font-semibold text-white">{suggestion.title}</p>
                                {suggestion.meta ? (
                                  <p className="mt-1 break-words text-xs uppercase tracking-[0.18em] text-fuchsia-200/80">
                                    {suggestion.meta}
                                  </p>
                                ) : null}
                                <p className="mt-3 break-words text-sm leading-6 text-white/70">
                                  {suggestion.reason}
                                </p>
                                <Link
                                  href={suggestion.href}
                                  className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-3 py-2 text-sm font-medium text-white transition hover:border-fuchsia-300/40 hover:bg-white/12"
                                >
                                  <span>{suggestion.ctaLabel}</span>
                                  <ArrowUpRight className="h-4 w-4" />
                                </Link>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyState title={text.emptyTitle} description={text.emptyDescription} className="mt-2" />
          )}
        </div>

        <form
          className="mt-5 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            void submitMessage(draft);
          }}
        >
          <div className="relative">
            <textarea
              name="message"
              rows={3}
              value={draft}
              placeholder={text.placeholder}
              onChange={(event) => {
                setDraft(event.target.value);
                if (messageError) setMessageError(undefined);
              }}
              onKeyDown={handleTextareaKeyDown}
              className="w-full rounded-[22px] border border-white/10 bg-white/5 px-4 py-3 pr-16 text-sm text-white outline-none placeholder:text-white/35 focus:border-fuchsia-400/35"
            />
            <button
              type="submit"
              disabled={isSending || !draft.trim()}
              aria-label={isSending ? text.sending : text.send}
              title={isSending ? text.sending : text.send}
              className="absolute right-4 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center text-white/70 transition hover:text-white disabled:cursor-not-allowed disabled:text-white/30"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          <ErrorMessage error={messageError} />
        </form>
      </div>

      <div className="space-y-4">
        <div className="glass-card rounded-[28px] border p-5">
          <p className="text-sm font-semibold text-white">{text.quickTips}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => void submitMessage(prompt)}
                className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-white/70 transition hover:border-fuchsia-400/35 hover:text-white"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-[28px] border p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <BrainCircuit className="h-4 w-4 text-fuchsia-300" />
            <span>{text.howWorks}</span>
          </div>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-white/55">
            {text.bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
