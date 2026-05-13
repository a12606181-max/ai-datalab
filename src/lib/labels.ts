export function getDifficultyLabel(value: string) {
  const normalized = value.toLowerCase();

  if (normalized === "beginner") return "Базовый";
  if (normalized === "intermediate") return "Средний";
  if (normalized === "advanced") return "Продвинутый";
  return value;
}

export function getRoleLabel(value: "STUDENT" | "TEACHER") {
  return value === "TEACHER" ? "Преподаватель" : "Студент";
}

export function getLevelLabel(value: string) {
  const normalized = value.toLowerCase();

  if (normalized === "beginner") return "Начальный";
  if (normalized === "intermediate") return "Уверенный";
  if (normalized === "expert") return "Экспертный";
  return value;
}

export function getSkillLabel(value: string) {
  const map: Record<string, string> = {
    Python: "Python",
    "Data Analysis": "Анализ данных",
    "Machine Learning": "Машинное обучение",
    Visualization: "Визуализация",
    "AI Basics": "Основы ИИ",
  };

  return map[value] || value;
}
