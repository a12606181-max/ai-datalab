import { AppLocale } from "@/lib/locale";
import { getSkillLabel } from "@/lib/labels";

type ActivityPoint = {
  date: Date | string;
  weight?: number;
};

type SkillLike = {
  skill: string;
  value: number;
};

type PendingLabLike = {
  title: string;
  difficulty?: string;
};

export function normalizeLearningText(value: string) {
  return value
    .toLocaleLowerCase("ru-RU")
    .normalize("NFKC")
    .replace(/ё/g, "е")
    .trim();
}

export function resolveCourseSkill(courseTitle: string) {
  const normalized = normalizeLearningText(courseTitle);

  if (normalized.includes("python")) return "Python";
  if (normalized.includes("машин") || normalized.includes("ml")) return "Machine Learning";
  if (normalized.includes("визуал") || normalized.includes("график")) return "Visualization";
  if (normalized.includes("искусственный интеллект") || normalized.includes("ии")) return "AI Basics";
  return "Data Analysis";
}

export function resolveLabSkillBoosts(labTitle: string) {
  const normalized = normalizeLearningText(labTitle);
  const boosts = [{ skill: "Data Analysis", value: 6 }];

  if (normalized.includes("график") || normalized.includes("визуал")) {
    boosts.push({ skill: "Visualization", value: 8 });
    boosts.push({ skill: "Python", value: 4 });
    return boosts;
  }

  if (
    normalized.includes("прогноз") ||
    normalized.includes("model") ||
    normalized.includes("модел") ||
    normalized.includes("ml")
  ) {
    boosts.push({ skill: "Machine Learning", value: 8 });
    boosts.push({ skill: "AI Basics", value: 4 });
    return boosts;
  }

  boosts.push({ skill: "Python", value: 6 });
  boosts.push({ skill: "AI Basics", value: 4 });
  return boosts;
}

function toDayKey(date: Date | string) {
  const value = new Date(date);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getWeekdayLabel(date: Date, locale: AppLocale = "ru") {
  const label = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "ru-RU", {
    weekday: "short",
  })
    .format(date)
    .replace(".", "");

  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function buildDailyActivity(points: ActivityPoint[], days = 7, locale: AppLocale = "ru") {
  const totals = new Map<string, number>();

  for (const point of points) {
    const key = toDayKey(point.date);
    totals.set(key, (totals.get(key) ?? 0) + (point.weight ?? 1));
  }

  return Array.from({ length: days }).map((_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (days - index - 1));

    return {
      name: getWeekdayLabel(date, locale),
      value: totals.get(toDayKey(date)) ?? 0,
    };
  });
}

export function buildWeeklyActivity(points: ActivityPoint[], weeks = 5, locale: AppLocale = "ru") {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const buckets = Array.from({ length: weeks }, () => 0);

  for (const point of points) {
    const date = new Date(point.date);
    date.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86_400_000);
    if (diffDays < 0) continue;

    const weekIndexFromEnd = Math.floor(diffDays / 7);
    if (weekIndexFromEnd >= weeks) continue;

    const bucketIndex = weeks - weekIndexFromEnd - 1;
    buckets[bucketIndex] += point.weight ?? 1;
  }

  return buckets.map((value, index) => ({
    week: locale === "en" ? `Week ${index + 1}` : `Неделя ${index + 1}`,
    value,
  }));
}

export function getWeakSkills(skills: SkillLike[], threshold = 50) {
  return skills
    .filter((item) => item.value < threshold)
    .sort((a, b) => a.value - b.value);
}

export function buildRecommendedNextStep(
  skills: SkillLike[],
  pendingLabs: PendingLabLike[],
  locale: AppLocale = "ru",
) {
  const weakestSkill = getWeakSkills(skills)[0];

  if (weakestSkill && pendingLabs[0]) {
    return locale === "en"
      ? `First strengthen the skill "${getSkillLabel(weakestSkill.skill, locale)}", then complete the lab "${pendingLabs[0].title}".`
      : `Сначала подтяните навык «${getSkillLabel(weakestSkill.skill, locale)}», а затем выполните кейс «${pendingLabs[0].title}».`;
  }

  if (weakestSkill) {
    return locale === "en"
      ? `Review the topic "${getSkillLabel(weakestSkill.skill, locale)}" and reinforce it in the next lesson or lab.`
      : `Повторите тему «${getSkillLabel(weakestSkill.skill, locale)}» и закрепите её на ближайшем уроке или лабораторной.`;
  }

  if (pendingLabs[0]) {
    return locale === "en"
      ? `A good next step is to complete the lab "${pendingLabs[0].title}" and review the quality of your conclusions.`
      : `Следующий разумный шаг — завершить лабораторную «${pendingLabs[0].title}» и проверить качество вывода.`;
  }

  return locale === "en"
    ? "Keep going at the current pace: complete lessons in order and support each answer with clear conclusions."
    : "Продолжайте обучение в текущем темпе: проходите уроки по порядку и дополняйте каждый ответ конкретными выводами.";
}

export function buildNextSteps(
  skills: SkillLike[],
  pendingLabs: PendingLabLike[],
  locale: AppLocale = "ru",
) {
  const steps: string[] = [];
  const weakSkills = getWeakSkills(skills);

  for (const skill of weakSkills.slice(0, 2)) {
    steps.push(
      locale === "en"
        ? `Review the topic "${getSkillLabel(skill.skill, locale)}" and close the theory gaps.`
        : `Повторить тему «${getSkillLabel(skill.skill, locale)}» и закрыть пробелы в теории.`,
    );
  }

  for (const lab of pendingLabs.slice(0, 2)) {
    steps.push(
      locale === "en"
        ? `Complete the lab "${lab.title}" and write up the conclusions from your analysis.`
        : `Завершить кейс «${lab.title}» и оформить выводы по результатам анализа.`,
    );
  }

  if (!steps.length) {
    steps.push(
      locale === "en"
        ? "Continue to the next course module and reinforce the material with a new practical task."
        : "Продолжить следующий модуль курса и закрепить материал новой практической работой.",
    );
  }

  return steps.slice(0, 3);
}

export function formatStudyDuration(totalMinutes: number, locale: AppLocale = "ru") {
  const safeMinutes = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;

  if (!hours) return locale === "en" ? `${minutes} min` : `${minutes} мин`;
  if (!minutes) return locale === "en" ? `${hours} h` : `${hours} ч`;
  return locale === "en" ? `${hours} h ${minutes} min` : `${hours} ч ${minutes} мин`;
}

export function buildTimeSpentSummary(
  params: {
    lessonMinutes: number;
    submittedLabsCount: number;
    mentorRepliesCount: number;
  },
  locale: AppLocale = "ru",
) {
  const theoryMinutes = params.lessonMinutes;
  const practiceMinutes = params.submittedLabsCount * 45;
  const mentorMinutes = params.mentorRepliesCount * 8;
  const total = Math.max(theoryMinutes + practiceMinutes + mentorMinutes, 1);

  const items = [
    { label: locale === "en" ? "Theory and lessons" : "Теория и уроки", minutes: theoryMinutes },
    { label: locale === "en" ? "Practice and labs" : "Практика и кейсы", minutes: practiceMinutes },
    { label: locale === "en" ? "Mentor work" : "Работа с наставником", minutes: mentorMinutes },
  ];

  return items.map((item) => ({
    label: item.label,
    hours: formatStudyDuration(item.minutes, locale),
    progress: Math.round((item.minutes / total) * 100),
  }));
}
