import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  ChartNoAxesCombined,
  Database,
  FlaskConical,
  GraduationCap,
  Sparkles,
  Users,
} from "lucide-react";

import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton, ghostButtonClassName } from "@/components/ui/gradient-button";

const benefits = [
  {
    title: "Интерактивные уроки",
    description: "Подробная теория, мини-тесты и понятная структура модулей по аналитике данных и ИИ.",
    icon: GraduationCap,
  },
  {
    title: "Практические лабораторные",
    description: "Реальные кейсы junior data analyst и ML engineer с отправкой решений и проверкой.",
    icon: FlaskConical,
  },
  {
    title: "ИИ-наставник",
    description: "Персональные подсказки, объяснение ошибок и рекомендации по следующему шагу.",
    icon: BrainCircuit,
  },
  {
    title: "Аналитика прогресса",
    description: "Графики, карта навыков, активность, слабые темы и персональные рекомендации.",
    icon: ChartNoAxesCombined,
  },
  {
    title: "Учебные датасеты",
    description: "Наборы данных для уроков, лабораторных и итоговых учебных кейсов.",
    icon: Database,
  },
  {
    title: "Внедрение в образование",
    description: "Готовая платформа для школы, колледжа или вуза с практической и методической ценностью.",
    icon: Users,
  },
];

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="relative mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-white/8 bg-white/[0.03] px-5 py-4 backdrop-blur">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-500 font-bold text-white shadow-[0_0_24px_rgba(242,56,255,0.35)]">
              AI
            </span>
            <div>
              <p className="text-lg font-semibold text-white">{APP_NAME}</p>
              <p className="text-xs text-white/45">Интеллектуальная образовательная платформа</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/about-project" className={ghostButtonClassName}>
              О проекте
            </Link>
            <Link href="/login" className={ghostButtonClassName}>
              Войти
            </Link>
          </div>
        </header>

        <section className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-4 py-2 text-sm text-fuchsia-200">
              <Sparkles className="h-4 w-4" />
              Конкурсная LMS-платформа по аналитике данных и искусственному интеллекту
            </div>
            <div>
              <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-white md:text-6xl">
                {APP_NAME}
              </h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-white/62">{APP_DESCRIPTION}</p>
              <p className="mt-4 max-w-3xl text-base leading-7 text-white/48">
                Платформа обучает аналитике данных и искусственному интеллекту через курсы, уроки, учебные датасеты, лабораторные работы, автоматическую проверку и ИИ-наставника. Проект ориентирован на школьников, студентов колледжей и вузов и готов к внедрению в образовательной организации.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <GradientButton href="/register">Начать обучение</GradientButton>
              <Link href="/login" className={ghostButtonClassName}>
                Войти в платформу
              </Link>
            </div>
          </div>

          <GlassCard className="overflow-hidden p-0">
            <div className="border-b border-white/8 bg-gradient-to-br from-fuchsia-500/30 via-violet-500/10 to-transparent p-6">
              <p className="text-sm uppercase tracking-[0.28em] text-fuchsia-200/90">Превью панели</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Учебная аналитика студента</h2>
            </div>
            <div className="grid gap-4 p-6 md:grid-cols-2">
              {[
                ["Завершённые уроки", "24"],
                ["Средний балл", "87%"],
                ["Советы наставника", "36"],
                ["Прогресс курса", "68%"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-sm text-white/45">{label}</p>
                  <p className="mt-4 text-3xl font-semibold text-white">{value}</p>
                </div>
              ))}
              <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4 md:col-span-2">
                <p className="text-sm text-white/45">Карта навыков</p>
                <div className="mt-5 space-y-4">
                  {[
                    ["Python", "76%"],
                    ["Анализ данных", "62%"],
                    ["Машинное обучение", "41%"],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-white/80">{label}</span>
                        <span className="text-white/45">{value}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/8">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500"
                          style={{ width: value }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </section>

        <section className="mt-16">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.28em] text-fuchsia-300/80">Для кого платформа</p>
            <h2 className="mt-4 text-3xl font-semibold text-white">
              Онлайн-модуль для реального обучения ИТ-направлениям
            </h2>
            <p className="mt-4 text-base leading-7 text-white/55">
              AI DataLab создаётся для школьников 9–11 классов, студентов колледжей, студентов вузов и начинающих специалистов в аналитике данных и искусственном интеллекте. Платформа подходит как для самостоятельного обучения, так и для внедрения в учебные программы образовательной организации.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {benefits.map((benefit) => (
              <GlassCard key={benefit.title} className="hover-lift min-h-[210px]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500/30 to-violet-500/30">
                  <benefit.icon className="h-5 w-5 text-fuchsia-200" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-white">{benefit.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/55">{benefit.description}</p>
              </GlassCard>
            ))}
          </div>
        </section>

        <section className="mt-16 grid gap-6 lg:grid-cols-3">
          <GlassCard className="lg:col-span-2">
            <p className="text-sm uppercase tracking-[0.28em] text-fuchsia-300/80">Как внедрить</p>
            <h2 className="mt-4 text-3xl font-semibold text-white">
              Готовая архитектура для школы, колледжа и вуза
            </h2>
            <p className="mt-4 text-base leading-7 text-white/55">
              Платформа поддерживает роли студента и преподавателя, может использоваться как факультатив, модуль дисциплины, онлайн-практикум или самостоятельный трек для профориентации и подготовки к цифровым профессиям.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                "Онлайн-доступ для экспертов",
                "Практические задания и датасеты",
                "Инструкция запуска и демо-аккаунты",
              ].map((item) => (
                <div key={item} className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm text-white/70">
                  {item}
                </div>
              ))}
            </div>
          </GlassCard>
          <GlassCard className="flex flex-col justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-fuchsia-300/80">
                Экспертам конкурса
              </p>
              <h2 className="mt-4 text-2xl font-semibold text-white">Полное описание проекта</h2>
              <p className="mt-4 text-sm leading-6 text-white/55">
                На отдельной странице собраны цель проекта, методическая ценность, архитектура, стек технологий, сценарий деморолика и инструкция запуска локально.
              </p>
            </div>
            <Link href="/about-project" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-fuchsia-300">
              Перейти к описанию проекта
              <ArrowRight className="h-4 w-4" />
            </Link>
          </GlassCard>
        </section>
      </div>
    </div>
  );
}
