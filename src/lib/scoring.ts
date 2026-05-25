import { normalizeLearningText } from "@/lib/learning-analytics";

const GENERIC_CONCEPT_GROUPS = [
  {
    title: "структура данных",
    terms: ["данн", "датасет", "таблиц", "csv"],
  },
  {
    title: "анализ и сравнение",
    terms: ["анализ", "сравн", "исслед", "закономер"],
  },
  {
    title: "признаки и переменные",
    terms: ["признак", "столб", "перемен", "feature"],
  },
  {
    title: "очистка данных",
    terms: ["пропуск", "дублик", "выброс", "очист"],
  },
  {
    title: "визуализация",
    terms: ["график", "диаграм", "визуал"],
  },
  {
    title: "моделирование",
    terms: ["модел", "алгоритм", "регресс", "классиф", "ml"],
  },
  {
    title: "метрики качества",
    terms: ["метрик", "точност", "accuracy", "mae", "rmse", "f1"],
  },
  {
    title: "выводы и рекомендации",
    terms: ["вывод", "интерпрет", "рекоменд", "итог"],
  },
];

function includesAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(normalizeLearningText(term)));
}

function buildStrengths(params: {
  answerLength: number;
  coveredConcepts: string[];
  matchedFocusTerms: string[];
}) {
  const strengths: string[] = [];

  if (params.answerLength >= 180) {
    strengths.push("Ответ развёрнутый и показывает не только итог, но и ход решения.");
  }

  if (params.coveredConcepts.length >= 4) {
    strengths.push("В ответе используется профильная терминология по анализу данных.");
  }

  if (params.matchedFocusTerms.length >= 2) {
    strengths.push("Решение хорошо связано именно с тем кейсом, который выполняет студент.");
  }

  if (!strengths.length) {
    strengths.push("Ответ показывает базовое понимание задания и направления анализа.");
  }

  return strengths.slice(0, 3);
}

function buildImprovements(params: {
  coveredConcepts: string[];
  matchedFocusTerms: string[];
}) {
  const improvements: string[] = [];

  if (!params.coveredConcepts.includes("структура данных")) {
    improvements.push("Уточните, с какими данными или признаками вы работали и что именно анализировали.");
  }

  if (!params.coveredConcepts.includes("выводы и рекомендации")) {
    improvements.push("Добавьте более чёткий итоговый вывод и короткую практическую рекомендацию.");
  }

  if (
    !params.coveredConcepts.includes("визуализация") &&
    !params.coveredConcepts.includes("метрики качества")
  ) {
    improvements.push("Покажите, чем вы подтверждаете результат: графиком, таблицей или метрикой.");
  }

  if (params.matchedFocusTerms.length === 0) {
    improvements.push("Используйте терминологию именно этого кейса: так решение будет выглядеть более предметным.");
  }

  return improvements.slice(0, 3);
}

export function scoreLabSubmission(answerText: string, focusTerms: string[] = []) {
  const normalized = normalizeLearningText(answerText);
  const normalizedFocusTerms = focusTerms.map((term) => normalizeLearningText(term));

  const coveredConcepts = GENERIC_CONCEPT_GROUPS.filter((group) => includesAny(normalized, group.terms)).map(
    (group) => group.title,
  );
  const matchedFocusTerms = normalizedFocusTerms.filter((term) => normalized.includes(term));
  const hasNumericEvidence = /\d/.test(answerText);

  let score = 20;

  if (answerText.trim().length >= 80) score += 10;
  if (answerText.trim().length >= 180) score += 10;
  score += coveredConcepts.length * 7;
  score += Math.min(14, matchedFocusTerms.length * 4);
  if (hasNumericEvidence) score += 5;
  if (includesAny(normalized, ["почему", "потому", "следовательно"])) score += 4;
  if (includesAny(normalized, ["рекоменд", "следующий шаг"])) score += 4;

  const finalScore = Math.min(100, score);
  const strengths = buildStrengths({
    answerLength: answerText.trim().length,
    coveredConcepts,
    matchedFocusTerms,
  });
  const improvements = buildImprovements({ coveredConcepts, matchedFocusTerms });

  const mentorTip =
    finalScore >= 85
      ? "Попробуйте усилить решение численными результатами или сравнением нескольких подходов."
      : "Дополните ответ более точным выводом, терминологией кейса и подтверждением через график, таблицу или метрику.";

  return {
    score: finalScore,
    feedback: [
      "Сильные стороны:",
      ...strengths.map((item) => `- ${item}`),
      "",
      "Что улучшить:",
      ...improvements.map((item) => `- ${item}`),
      "",
      `Рекомендация ИИ-наставника: ${mentorTip}`,
    ].join("\n"),
  };
}

export function generateMentorReply(message: string) {
  const normalized = normalizeLearningText(message);

  if (normalized.includes("регресс")) {
    return "Регрессия помогает предсказывать числовое значение. Начните с выбора целевой переменной, проверьте признаки и сравните качество модели по метрикам MAE или RMSE.";
  }

  if (
    normalized.includes("очист") ||
    normalized.includes("пропуск") ||
    normalized.includes("дублик")
  ) {
    return "При очистке данных сначала найдите пропуски, дубликаты и выбросы. Затем выберите стратегию: удалить значение, заполнить его или отдельно объяснить аномалию.";
  }

  if (
    normalized.includes("модел") ||
    normalized.includes("точност") ||
    normalized.includes("accuracy")
  ) {
    return "Если модель ошибается, проверьте качество признаков, баланс классов и способ проверки результата. Полезно сравнить несколько моделей и посмотреть метрики на тестовой выборке.";
  }

  if (normalized.includes("график") || normalized.includes("диаграм") || normalized.includes("визуал")) {
    return "Для сравнения категорий подойдёт столбчатая диаграмма, а для динамики по времени лучше выбрать линейный график. После построения обязательно объясните, какую закономерность показывает визуализация.";
  }

  if (normalized.includes("признак")) {
    return "Признаки — это характеристики объектов, по которым мы анализируем данные или обучаем модель. Полезно сразу разделить признаки на важные, вспомогательные и потенциально шумные.";
  }

  return "Двигайтесь по шагам: сформулируйте задачу, проверьте качество данных, выберите способ анализа и только потом переходите к выводам. Если хотите, я могу помочь разложить ваш кейс по этапам.";
}
