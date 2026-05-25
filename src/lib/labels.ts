import { AppLocale } from "@/lib/locale";

export function getDifficultyLabel(value: string, locale: AppLocale = "ru") {
  const normalized = value.toLowerCase();

  if (locale === "en") {
    if (normalized === "beginner") return "Beginner";
    if (normalized === "intermediate") return "Intermediate";
    if (normalized === "advanced") return "Advanced";
    return value;
  }

  if (normalized === "beginner") return "\u0411\u0430\u0437\u043e\u0432\u044b\u0439";
  if (normalized === "intermediate") return "\u0421\u0440\u0435\u0434\u043d\u0438\u0439";
  if (normalized === "advanced") return "\u041f\u0440\u043e\u0434\u0432\u0438\u043d\u0443\u0442\u044b\u0439";
  return value;
}

export function getRoleLabel(value: "STUDENT" | "TEACHER" | "ADMIN", locale: AppLocale = "ru") {
  if (locale === "en") {
    if (value === "ADMIN") return "Administrator";
    return value === "TEACHER" ? "Teacher" : "Student";
  }

  if (value === "ADMIN") {
    return "\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440";
  }

  return value === "TEACHER"
    ? "\u041f\u0440\u0435\u043f\u043e\u0434\u0430\u0432\u0430\u0442\u0435\u043b\u044c"
    : "\u0421\u0442\u0443\u0434\u0435\u043d\u0442";
}

export function getLevelLabel(value: string, locale: AppLocale = "ru") {
  const normalized = value.toLowerCase();

  if (locale === "en") {
    if (normalized === "beginner") return "Beginner";
    if (normalized === "intermediate") return "Intermediate";
    if (normalized === "expert") return "Expert";
    return value;
  }

  if (normalized === "beginner") return "\u041d\u0430\u0447\u0430\u043b\u044c\u043d\u044b\u0439";
  if (normalized === "intermediate") return "\u0423\u0432\u0435\u0440\u0435\u043d\u043d\u044b\u0439";
  if (normalized === "expert") return "\u042d\u043a\u0441\u043f\u0435\u0440\u0442\u043d\u044b\u0439";
  return value;
}

export function getSkillLabel(value: string, locale: AppLocale = "ru") {
  if (locale === "en") {
    const enMap: Record<string, string> = {
      Python: "Python",
      "Data Analysis": "Data Analysis",
      "Machine Learning": "Machine Learning",
      Visualization: "Visualization",
      "AI Basics": "AI Basics",
    };

    return enMap[value] || value;
  }

  const ruMap: Record<string, string> = {
    Python: "Python",
    "Data Analysis": "\u0410\u043d\u0430\u043b\u0438\u0437 \u0434\u0430\u043d\u043d\u044b\u0445",
    "Machine Learning": "\u041c\u0430\u0448\u0438\u043d\u043d\u043e\u0435 \u043e\u0431\u0443\u0447\u0435\u043d\u0438\u0435",
    Visualization: "\u0412\u0438\u0437\u0443\u0430\u043b\u0438\u0437\u0430\u0446\u0438\u044f",
    "AI Basics": "\u041e\u0441\u043d\u043e\u0432\u044b \u0418\u0418",
  };

  return ruMap[value] || value;
}
