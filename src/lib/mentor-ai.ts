import OpenAI from "openai";

import {
  buildNextSteps,
  buildRecommendedNextStep,
  getWeakSkills,
  resolveCourseSkill,
} from "@/lib/learning-analytics";
import { getLevelLabel, getSkillLabel } from "@/lib/labels";
import {
  getMentorPlainText,
  MentorAnalysisCard,
  MentorSuggestion,
  serializeMentorStructuredMessage,
} from "@/lib/mentor-content";
import { prisma } from "@/lib/prisma";
import { average, formatDate } from "@/lib/utils";

let client: OpenAI | null = null;
let cachedClientKey = "";
let cachedClientBaseURL = "";

type MentorClientConfig = {
  apiKey: string;
  baseURL?: string;
  model: string;
};

type RankedSuggestion = MentorSuggestion & {
  score: number;
};

type MentorContext = {
  userName: string;
  userLevel: string;
  lessonsCompleted: number;
  completedLabs: number;
  averageLabScore: number;
  overallCourseProgress: number;
  strongestSkills: Array<{ skill: string; value: number }>;
  weakSkills: Array<{ skill: string; value: number }>;
  recommendedStep: string;
  nextSteps: string[];
  recentLessons: Array<{ title: string; courseTitle: string }>;
  recentLabs: Array<{ title: string; score: number }>;
  courseCards: Array<{
    id: string;
    title: string;
    description: string;
    difficulty: string;
    lessonsCount: number;
    progress: number;
    skill: string;
  }>;
  lessonCards: Array<{
    id: string;
    title: string;
    courseId: string;
    courseTitle: string;
    order: number;
    estimatedMinutes: number;
  }>;
  labCards: Array<{
    id: string;
    title: string;
    description: string;
    goal: string;
    difficulty: string;
    deadline: string;
    datasetTitle: string | null;
    completed: boolean;
  }>;
  datasetCards: Array<{
    id: string;
    title: string;
    description: string;
    filename: string;
    rowsCount: number;
  }>;
  recentChatHistory: Array<{
    role: "USER" | "AI";
    content: string;
  }>;
};

function normalizeLearningText(value: string) {
  return value.toLocaleLowerCase("ru-RU").normalize("NFKC").trim();
}

function getClientConfig(): MentorClientConfig | null {
  const apiKey = process.env.MENTOR_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  return {
    apiKey,
    baseURL: process.env.MENTOR_BASE_URL || process.env.OPENAI_BASE_URL,
    model: process.env.MENTOR_MODEL || process.env.OPENAI_MODEL || "gpt-5.2",
  };
}

function getClient() {
  const config = getClientConfig();
  if (!config) return null;

  if (!client || cachedClientKey !== config.apiKey || cachedClientBaseURL !== (config.baseURL || "")) {
    client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
    });
    cachedClientKey = config.apiKey;
    cachedClientBaseURL = config.baseURL || "";
  }

  return client;
}

function containsAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(normalizeLearningText(term)));
}

function splitQueryTokens(normalizedQuery: string) {
  return normalizedQuery
    .split(/[^a-zа-яё0-9+#.-]+/i)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);
}

function countMatches(text: string, tokens: string[]) {
  return tokens.reduce((score, token) => score + (text.includes(token) ? 1 : 0), 0);
}

function inferFocusSkills(normalizedQuery: string) {
  const skills = new Set<string>();

  if (containsAny(normalizedQuery, ["python", "pandas", "numpy", "код", "программ", "js", "javascript", "typescript"])) {
    skills.add("Python");
  }

  if (containsAny(normalizedQuery, ["машин", "ml", "регресс", "классиф", "model", "нейрон"])) {
    skills.add("Machine Learning");
  }

  if (containsAny(normalizedQuery, ["визуал", "график", "диаграм", "matplotlib", "seaborn", "plotly"])) {
    skills.add("Visualization");
  }

  if (containsAny(normalizedQuery, ["ии", "ai", "llm", "gpt", "agent", "агент"])) {
    skills.add("AI Basics");
  }

  if (containsAny(normalizedQuery, ["аналит", "данн", "очист", "csv", "sql", "таблиц", "dataset"])) {
    skills.add("Data Analysis");
  }

  return Array.from(skills);
}

function wantsAnalysis(message: string) {
  const normalized = normalizeLearningText(message);
  return containsAny(normalized, [
    "проанализируй",
    "анализ",
    "мой прогресс",
    "мои результаты",
    "мои слабые стороны",
    "что дальше",
    "следующий шаг",
    "мой уровень",
    "мой план",
    "что мне подтянуть",
  ]);
}

function wantsSuggestions(message: string) {
  const normalized = normalizeLearningText(message);
  return containsAny(normalized, [
    "что пройти",
    "с чего начать",
    "какой курс",
    "какой урок",
    "какую лабораторную",
    "какой датасет",
    "подбери",
    "рекомендуй",
    "открыть",
    "курс",
    "урок",
    "лаборатор",
    "датасет",
    "материал",
    "навигац",
    "платформ",
    "сайт",
  ]);
}

function isFollowUpQuestion(normalizedQuery: string) {
  return containsAny(normalizedQuery, [
    "подробнее",
    "еще",
    "ещё",
    "продолжи",
    "объясни это",
    "а как",
    "а что",
    "покажи пример",
    "приведи пример",
    "разверни",
    "раскрой",
  ]);
}

function shouldReuseHistory(message: string, recentChatHistory: MentorContext["recentChatHistory"]) {
  const normalizedQuery = normalizeLearningText(message);
  if (isFollowUpQuestion(normalizedQuery)) return true;

  const lastUserMessage = [...recentChatHistory].reverse().find((item) => item.role === "USER")?.content;
  if (!lastUserMessage) return false;

  const currentTokens = new Set(splitQueryTokens(normalizedQuery));
  const lastTokens = splitQueryTokens(normalizeLearningText(lastUserMessage));
  const overlap = lastTokens.filter((token) => currentTokens.has(token)).length;

  return overlap >= 2;
}

function buildAnalysisCard(context: MentorContext): MentorAnalysisCard {
  const strengths = [
    context.lessonsCompleted > 0
      ? `Завершено уроков: ${context.lessonsCompleted}. Это уже даёт хорошую учебную базу.`
      : "Уроки ещё не завершены, поэтому первый быстрый рост даст прохождение базовой теории.",
    context.completedLabs > 0
      ? `Лабораторных завершено: ${context.completedLabs}, средний результат сейчас ${context.averageLabScore}%.`
      : "Лабораторные ещё не закрыты, значит основной прирост сейчас даст практика.",
    context.strongestSkills[0]
      ? `Сильнее всего сейчас выглядит навык «${getSkillLabel(context.strongestSkills[0].skill)}» — ${context.strongestSkills[0].value}%.`
      : "Профиль сильных навыков проявится заметнее после первых завершённых уроков и лабораторных.",
  ];

  const focusAreas = context.weakSkills.length
    ? context.weakSkills.slice(0, 3).map((skill) => `${getSkillLabel(skill.skill)} — ${skill.value}%`)
    : ["Критически слабых зон сейчас не видно, можно планомерно двигаться дальше по программе."];

  return {
    title: "Персональный AI-разбор прогресса",
    summary: `Общий прогресс по курсам: ${context.overallCourseProgress}%. Уровень: ${getLevelLabel(context.userLevel)}. ${context.recommendedStep}`,
    strengths,
    focusAreas,
    nextSteps: context.nextSteps,
  };
}

function rankSuggestions(query: string, context: MentorContext) {
  const normalizedQuery = normalizeLearningText(query);
  const tokens = splitQueryTokens(normalizedQuery);
  const focusSkills = inferFocusSkills(normalizedQuery);
  const asksCourse = containsAny(normalizedQuery, ["курс", "что пройти", "с чего начать"]);
  const asksLesson = containsAny(normalizedQuery, ["урок", "следующий урок"]);
  const asksLab = containsAny(normalizedQuery, ["лаборатор", "практик", "кейс"]);
  const asksDataset = containsAny(normalizedQuery, ["датасет", "dataset", "csv", "набор данных"]);
  const asksProgress = wantsAnalysis(query);
  const beginnerTone = containsAny(normalizedQuery, ["с нуля", "нович", "ничего не знаю", "без опыта", "начинающ"]);

  const suggestions: RankedSuggestion[] = [];

  for (const course of context.courseCards) {
    const searchable = normalizeLearningText(`${course.title} ${course.description} ${course.skill} ${course.difficulty}`);
    let score = countMatches(searchable, tokens) * 5;

    if (asksCourse) score += 10;
    if (asksProgress && course.progress < 100) score += 6;
    if (focusSkills.includes(course.skill)) score += 10;
    if (course.progress > 0 && course.progress < 100) score += 4;
    if (course.difficulty.toLowerCase() === "beginner" && beginnerTone) score += 7;

    suggestions.push({
      type: "course",
      title: course.title,
      href: `/courses/${course.id}`,
      reason:
        course.progress > 0
          ? `В этом курсе у вас уже есть прогресс ${course.progress}%, его удобно продолжить.`
          : `Этот курс ближе всего к теме «${getSkillLabel(course.skill)}».`,
      ctaLabel: "Открыть курс",
      meta: `${course.lessonsCount} уроков • прогресс ${course.progress}%`,
      score,
    });
  }

  for (const lesson of context.lessonCards) {
    const searchable = normalizeLearningText(`${lesson.title} ${lesson.courseTitle}`);
    let score = countMatches(searchable, tokens) * 5;

    if (asksLesson) score += 10;
    if (asksProgress) score += 5;
    if (containsAny(normalizedQuery, ["следующий", "дальше", "продолжить"])) score += 8;

    suggestions.push({
      type: "lesson",
      title: lesson.title,
      href: `/lessons/${lesson.id}`,
      reason: `Следующий доступный урок в курсе «${lesson.courseTitle}».`,
      ctaLabel: "Открыть урок",
      meta: `${lesson.estimatedMinutes} минут • урок ${lesson.order}`,
      score,
    });
  }

  for (const lab of context.labCards) {
    const searchable = normalizeLearningText(`${lab.title} ${lab.description} ${lab.goal} ${lab.datasetTitle ?? ""}`);
    let score = countMatches(searchable, tokens) * 5;

    if (asksLab) score += 10;
    if (asksProgress && !lab.completed) score += 5;
    if (!lab.completed) score += 3;
    if (focusSkills.length > 0) score += countMatches(searchable, focusSkills.map((skill) => normalizeLearningText(skill))) * 3;

    suggestions.push({
      type: "lab",
      title: lab.title,
      href: `/labs/${lab.id}`,
      reason: lab.completed
        ? "Эту лабораторную можно пересмотреть как образец или для повторения."
        : "Эта лабораторная подходит как следующий практический шаг.",
      ctaLabel: "Открыть лабораторную",
      meta: `До ${lab.deadline}${lab.datasetTitle ? ` • датасет: ${lab.datasetTitle}` : ""}`,
      score,
    });
  }

  for (const dataset of context.datasetCards) {
    const searchable = normalizeLearningText(`${dataset.title} ${dataset.description} ${dataset.filename}`);
    let score = countMatches(searchable, tokens) * 5;

    if (asksDataset) score += 10;

    suggestions.push({
      type: "dataset",
      title: dataset.title,
      href: "/datasets",
      reason: "Этот датасет уже есть на платформе и подходит для практики.",
      ctaLabel: "Открыть датасеты",
      meta: `${dataset.rowsCount} строк • ${dataset.filename}`,
      score,
    });
  }

  const threshold = wantsSuggestions(query) ? 1 : 6;

  return suggestions
    .filter((item) => item.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .reduce<RankedSuggestion[]>((acc, item) => {
      if (acc.some((existing) => existing.href === item.href)) return acc;
      acc.push(item);
      return acc;
    }, [])
    .slice(0, asksProgress ? 4 : 3);
}

async function getMentorContext(userId: string): Promise<MentorContext> {
  const [user, skillProgress, courseProgress, lessonProgress, labSubmissions, courses, labs, datasets, recentMessages] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, level: true },
      }),
      prisma.skillProgress.findMany({
        where: { userId },
        orderBy: { value: "desc" },
      }),
      prisma.progress.findMany({
        where: { userId, type: "COURSE" },
        select: { courseId: true, value: true, completed: true },
      }),
      prisma.progress.findMany({
        where: { userId, type: "LESSON", completed: true },
        include: {
          lesson: {
            select: {
              id: true,
              title: true,
              order: true,
              estimatedMinutes: true,
              course: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.submission.findMany({
        where: { userId },
        include: {
          lab: {
            select: {
              id: true,
              title: true,
              difficulty: true,
              deadline: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.course.findMany({
        orderBy: [{ createdAt: "asc" }, { title: "asc" }],
        include: {
          lessons: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              order: true,
              estimatedMinutes: true,
            },
          },
        },
      }),
      prisma.lab.findMany({
        orderBy: { deadline: "asc" },
        include: {
          dataset: {
            select: { title: true },
          },
        },
      }),
      prisma.dataset.findMany({
        orderBy: { title: "asc" },
        take: 8,
      }),
      prisma.mentorMessage.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          role: true,
          content: true,
        },
      }),
    ]);

  const completedLessonIds = new Set(
    lessonProgress.flatMap((item) => (item.lesson?.id ? [item.lesson.id] : [])),
  );
  const completedLabIds = new Set(labSubmissions.map((item) => item.labId));
  const courseProgressMap = new Map(courseProgress.map((item) => [item.courseId, item.value]));
  const weakSkills = getWeakSkills([...skillProgress].sort((a, b) => a.value - b.value));
  const strongestSkills = [...skillProgress].sort((a, b) => b.value - a.value).slice(0, 3);
  const pendingLabs = labs
    .filter((lab) => !completedLabIds.has(lab.id))
    .map((lab) => ({ title: lab.title, difficulty: lab.difficulty }));

  const lessonCards = courses
    .flatMap((course) =>
      course.lessons
        .filter((lesson) => !completedLessonIds.has(lesson.id))
        .slice(0, 1)
        .map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          courseId: course.id,
          courseTitle: course.title,
          order: lesson.order,
          estimatedMinutes: lesson.estimatedMinutes,
        })),
    )
    .slice(0, 8);

  return {
    userName: user?.name || "Студент",
    userLevel: user?.level || "Beginner",
    lessonsCompleted: lessonProgress.length,
    completedLabs: labSubmissions.length,
    averageLabScore: average(labSubmissions.map((item) => item.score)),
    overallCourseProgress: average(courseProgress.map((item) => item.value)),
    strongestSkills,
    weakSkills,
    recommendedStep: buildRecommendedNextStep(skillProgress, pendingLabs),
    nextSteps: buildNextSteps(skillProgress, pendingLabs),
    recentLessons: lessonProgress.slice(0, 3).flatMap((item) =>
      item.lesson
        ? [
            {
              title: item.lesson.title,
              courseTitle: item.lesson.course.title,
            },
          ]
        : [],
    ),
    recentLabs: labSubmissions.slice(0, 3).map((submission) => ({
      title: submission.lab.title,
      score: submission.score,
    })),
    courseCards: courses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      difficulty: course.difficulty,
      lessonsCount: course.lessonsCount,
      progress: courseProgressMap.get(course.id) ?? 0,
      skill: resolveCourseSkill(course.title),
    })),
    lessonCards,
    labCards: labs.map((lab) => ({
      id: lab.id,
      title: lab.title,
      description: lab.description,
      goal: lab.goal,
      difficulty: lab.difficulty,
      deadline: formatDate(lab.deadline),
      datasetTitle: lab.dataset?.title ?? null,
      completed: completedLabIds.has(lab.id),
    })),
    datasetCards: datasets.map((dataset) => ({
      id: dataset.id,
      title: dataset.title,
      description: dataset.description,
      filename: dataset.filename,
      rowsCount: dataset.rowsCount,
    })),
    recentChatHistory: recentMessages.reverse().map((message) => ({
      role: message.role,
      content: getMentorPlainText(message.content),
    })),
  };
}

function buildMentorSystemPrompt() {
  return [
    "You are AIDataLab Mentor, a full conversational AI assistant for an educational platform.",
    "Answer in the same language as the user's message. If the user writes in Russian, answer in Russian.",
    "Your job is to answer the real question first, not to replace the answer with navigation or template text.",
    "You may help broadly with artificial intelligence, data analytics, statistics, SQL, Python, programming, debugging, software development, information technology, and the AIDataLab platform.",
    "If the user asks a theory question, explain the concept clearly and naturally.",
    "If the user asks a practical question, give a step-by-step answer.",
    "If the user asks about learning progress, strengths, weaknesses, or what to study next, use the supplied platform context to give a personalized analysis.",
    "If relevant, after the main answer you may suggest real platform materials from the provided context.",
    "Never invent courses, lessons, labs, datasets, progress, or user achievements that are not present in the supplied context.",
    "Do not answer with JSON, XML, markdown tables, or service notes.",
    "Write like a helpful, modern chat assistant: natural, clear, smart, and non-robotic.",
    "Do not be overly restrictive. For basic and broad educational questions, answer normally and fully.",
  ].join(" ");
}

function buildMentorContextMessage(
  context: MentorContext,
  suggestions: MentorSuggestion[],
  analysis: MentorAnalysisCard | null,
) {
  const strongest = context.strongestSkills.length
    ? context.strongestSkills.map((item) => `${getSkillLabel(item.skill)} ${item.value}%`).join(", ")
    : "not enough data yet";
  const weakest = context.weakSkills.length
    ? context.weakSkills.map((item) => `${getSkillLabel(item.skill)} ${item.value}%`).join(", ")
    : "no clearly weak skills detected";
  const recentLessons = context.recentLessons.length
    ? context.recentLessons.map((item) => `- ${item.title} (${item.courseTitle})`).join("\n")
    : "- no completed lessons yet";
  const recentLabs = context.recentLabs.length
    ? context.recentLabs.map((item) => `- ${item.title}: ${item.score}%`).join("\n")
    : "- no completed labs yet";
  const materials = suggestions.length
    ? suggestions
        .map((item) => `- [${item.type}] ${item.title} | ${item.reason} | link ${item.href}`)
        .join("\n")
    : "- no especially relevant platform materials were found for this question";

  return [
    "Platform context:",
    `User name: ${context.userName}`,
    `Level: ${getLevelLabel(context.userLevel)}`,
    `Completed lessons: ${context.lessonsCompleted}`,
    `Completed labs: ${context.completedLabs}`,
    `Average lab score: ${context.averageLabScore}%`,
    `Overall course progress: ${context.overallCourseProgress}%`,
    `Strongest skills: ${strongest}`,
    `Weak skills: ${weakest}`,
    `Recommended next step: ${context.recommendedStep}`,
    "",
    "Recent lessons:",
    recentLessons,
    "",
    "Recent labs:",
    recentLabs,
    "",
    "Real platform materials you may recommend if relevant:",
    materials,
    "",
    "Analysis helper:",
    analysis
      ? `${analysis.summary}\nStrengths: ${analysis.strengths.join(" | ")}\nFocus areas: ${analysis.focusAreas.join(" | ")}\nNext steps: ${analysis.nextSteps.join(" | ")}`
      : "No special progress analysis requested for this message.",
  ].join("\n");
}

function buildMentorMessages(
  message: string,
  context: MentorContext,
  suggestions: MentorSuggestion[],
  analysis: MentorAnalysisCard | null,
) {
  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    {
      role: "system",
      content: buildMentorSystemPrompt(),
    },
    {
      role: "system",
      content: `${buildMentorContextMessage(context, suggestions, analysis)}\n\nCurrent user question is the highest priority. Do not continue an older topic unless the new message clearly depends on it.`,
    },
  ];

  const history = shouldReuseHistory(message, context.recentChatHistory)
    ? context.recentChatHistory.filter((item) => item.content.trim().length > 0).slice(-6)
    : [];

  for (const item of history) {
    messages.push({
      role: item.role === "USER" ? "user" : "assistant",
      content: item.content,
    });
  }

  const normalizedMessage = normalizeLearningText(message);
  const lastHistory = history.at(-1);
  const lastMatchesCurrent =
    lastHistory?.role === "USER" &&
    normalizeLearningText(lastHistory.content) === normalizedMessage;

  if (!lastMatchesCurrent) {
    messages.push({
      role: "user",
      content: message,
    });
  }

  return messages;
}

function buildFallbackText(
  message: string,
  suggestions: MentorSuggestion[],
  analysis: MentorAnalysisCard | null,
  context: MentorContext,
) {
  const normalized = normalizeLearningText(message);
  const useRussian = /[а-яё]/i.test(message);

  if (analysis) {
    const nextStep = analysis.nextSteps[0] ? ` ${useRussian ? "Первый шаг:" : "First step:"} ${analysis.nextSteps[0]}.` : "";
    return `${analysis.summary}${nextStep}`;
  }

  if (containsAny(normalized, ["python"])) {
    return useRussian
      ? "Python — это универсальный язык программирования, который особенно популярен в аналитике данных, автоматизации, веб-разработке и искусственном интеллекте. Его любят за понятный синтаксис и большое количество готовых библиотек, поэтому с него удобно начинать и быстро переходить к практике."
      : "Python is a general-purpose programming language widely used in data analysis, automation, web development, and AI. It is popular because its syntax is easy to read and there are many ready-made libraries, so it is a strong starting point for practical work.";
  }

  if (containsAny(normalized, ["машин", "machine learning", "ml"])) {
    return useRussian
      ? "Машинное обучение — это раздел ИИ, где алгоритм учится на примерах из данных и затем использует найденные закономерности для прогнозов, классификации или рекомендаций. Проще говоря, системе показывают данные, и она учится принимать решения не только по жёстким правилам."
      : "Machine learning is a branch of AI where an algorithm learns patterns from data and then uses them for prediction, classification, or recommendation. In simple terms, the system studies examples instead of relying only on hard-coded rules.";
  }

  if (containsAny(normalized, ["аналит", "данн", "data analytics", "data analysis"])) {
    return useRussian
      ? "Аналитика данных — это процесс превращения сырых данных в понятные выводы и практические решения. Обычно он включает сбор данных, очистку, исследование, визуализацию, интерпретацию результатов и формирование рекомендаций."
      : "Data analytics is the process of turning raw data into understandable insights and practical decisions. It usually includes data collection, cleaning, exploration, visualization, interpretation, and recommendations.";
  }

  if (suggestions.length) {
    const best = suggestions.slice(0, 2).map((item) => `«${item.title}»`).join(", ");
    return useRussian
      ? `Сейчас у меня не получилось получить полноценный ответ от модели, но я уже подобрал близкие материалы на платформе: ${best}. Если хотите, я всё равно помогу выбрать лучший следующий шаг по ним.`
      : `I could not get a full model answer right now, but I already found relevant platform materials: ${best}. I can still help you choose the best next step based on them.`;
  }

  return useRussian
    ? `Сейчас модель временно не ответила. Попробуйте переформулировать вопрос чуть подробнее — например, уточнить тему по ИИ, аналитике данных, программированию, IT или материалам платформы. У вас текущий уровень: ${getLevelLabel(context.userLevel)}, а рекомендуемый следующий шаг — ${context.recommendedStep}`
    : `The model did not answer right now. Try rephrasing the question with a little more detail — for example about AI, data analytics, programming, IT, or platform materials. Your current level is ${getLevelLabel(context.userLevel)}, and the recommended next step is ${context.recommendedStep}.`;
}

async function generateModelText(
  message: string,
  context: MentorContext,
  suggestions: MentorSuggestion[],
  analysis: MentorAnalysisCard | null,
) {
  const openai = getClient();
  const config = getClientConfig();
  if (!openai || !config) return null;

  try {
    const response = await openai.chat.completions.create({
      model: config.model,
      temperature: 0.7,
      messages: buildMentorMessages(message, context, suggestions, analysis),
    });

    const text = response.choices?.[0]?.message?.content?.trim();
    if (text) return text;
  } catch (error) {
    console.error("[mentor-ai] primary model request failed", error);
  }

  try {
    const response = await openai.chat.completions.create({
      model: config.model,
      temperature: 0.5,
      messages: [
        {
          role: "system",
          content: buildMentorSystemPrompt(),
        },
        {
          role: "user",
          content: `${buildMentorContextMessage(context, suggestions, analysis)}\n\nUser question:\n${message}\n\nAnswer directly and naturally.`,
        },
      ],
    });

    const text = response.choices?.[0]?.message?.content?.trim();
    if (text) return text;
  } catch (error) {
    console.error("[mentor-ai] secondary model request failed", error);
  }

  return null;
}

export async function generateMentorAnswer(userId: string, message: string) {
  const context = await getMentorContext(userId);
  const suggestions = rankSuggestions(message, context);
  const analysis = wantsAnalysis(message) ? buildAnalysisCard(context) : null;
  const modelText = await generateModelText(message, context, suggestions, analysis);
  const text = modelText || buildFallbackText(message, suggestions, analysis, context);

  return serializeMentorStructuredMessage({
    kind: "ai-datalab-mentor-v1",
    text,
    suggestions: wantsSuggestions(message) || wantsAnalysis(message) ? suggestions : undefined,
    analysis,
  });
}

const mentorAi = { generateMentorAnswer };

export default mentorAi;
