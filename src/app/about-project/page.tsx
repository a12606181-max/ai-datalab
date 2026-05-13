import Link from "next/link";

import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton, ghostButtonClassName } from "@/components/ui/gradient-button";

const sections = [
  {
    title: "Цель проекта",
    content:
      "Создать интеллектуальную образовательную онлайн-платформу, на которой школьники и студенты изучают аналитику данных и искусственный интеллект через практические кейсы, лабораторные работы и ИИ-наставника.",
  },
  {
    title: "Актуальность",
    content:
      "Образовательным организациям нужен современный онлайн-формат обучения ИТ-направлениям с практической составляющей. AI DataLab закрывает этот запрос за счёт работы с датасетами, анализа, визуализации и основ машинного обучения.",
  },
  {
    title: "Целевая аудитория",
    content:
      "Школьники 9–11 классов, студенты колледжей, студенты вузов и начинающие специалисты в аналитике данных и искусственном интеллекте.",
  },
  {
    title: "Функциональные возможности",
    content:
      "Регистрация, вход, роли «Студент» и «Преподаватель», курсы, уроки с тестами, лабораторные работы, персональные отчёты студента, датасеты преподавателя, автоматическая проверка решений, ИИ-наставник, аналитика прогресса и кабинет преподавателя.",
  },
  {
    title: "Архитектура проекта",
    content:
      "Frontend и backend объединены в Next.js App Router. Данные хранятся в SQLite через Prisma. Аутентификация работает через cookie-сессию. Серверные действия обрабатывают формы, уроки, лабораторные и сообщения наставнику.",
  },
  {
    title: "Используемые технологии",
    content:
      "Next.js, TypeScript, Tailwind CSS, Prisma, SQLite, bcrypt, cookie-сессии, Zod, Recharts, lucide-react, next/font. При наличии ключа можно подключить реальный OpenAI API для ИИ-наставника.",
  },
  {
    title: "Методическая ценность",
    content:
      "Платформа показывает связку «теория + практика + анализ + вывод + обратная связь». Это позволяет использовать AI DataLab как онлайн-модуль, электив, цифровой тренажёр или часть курса по анализу данных.",
  },
  {
    title: "Практическое применение",
    content:
      "Студент изучает датасеты, очищает данные, строит графики, формулирует выводы, знакомится с ML-мышлением и получает автоматическую или ИИ-обратную связь.",
  },
  {
    title: "Возможность внедрения в образовательной организации",
    content:
      "Проект можно развернуть локально без внешних ключей. Это делает платформу пригодной для демонстрации экспертам, пилотного запуска в колледже или вузе и дальнейшей адаптации под реальный учебный процесс.",
  },
  {
    title: "Инструкция по запуску",
    content:
      "npm install → npx prisma migrate dev → npx prisma db seed → npm run dev. После запуска доступны демо-аккаунты студента и преподавателя.",
  },
];

export default function AboutProjectPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-fuchsia-300/80">О проекте</p>
          <h1 className="mt-3 text-4xl font-semibold text-white">{APP_NAME}</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-white/55">{APP_DESCRIPTION}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/" className={ghostButtonClassName}>
            На главную
          </Link>
          <GradientButton href="/register">Открыть платформу</GradientButton>
        </div>
      </div>

      <div className="grid gap-4">
        {sections.map((section) => (
          <GlassCard key={section.title}>
            <h2 className="text-2xl font-semibold text-white">{section.title}</h2>
            <p className="mt-4 text-base leading-7 text-white/60">{section.content}</p>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="mt-6">
        <h2 className="text-2xl font-semibold text-white">Демо-аккаунты</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm text-white/70">
            <p className="font-medium text-white">Студент</p>
            <p className="mt-2">student@aidatalab.ru</p>
            <p>Student123</p>
          </div>
          <div className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm text-white/70">
            <p className="font-medium text-white">Преподаватель</p>
            <p className="mt-2">teacher@aidatalab.ru</p>
            <p>Teacher123</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
