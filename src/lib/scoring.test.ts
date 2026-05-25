import { describe, expect, it } from "vitest";

import { generateMentorReply, scoreLabSubmission } from "@/lib/scoring";

describe("scoreLabSubmission", () => {
  it("rewards detailed answers that use case terminology", () => {
    const result = scoreLabSubmission(
      "Я проанализировал данные по успеваемости, выделил признаки посещаемости и среднего балла, сравнил группы студентов, построил график и сформулировал вывод с рекомендацией для преподавателя.",
      ["успеваем", "посещаем", "средний балл"],
    );

    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.feedback).toContain("Сильные стороны:");
    expect(result.feedback).toContain("Рекомендация ИИ-наставника:");
  });

  it("gives lower scores to vague answers", () => {
    const result = scoreLabSubmission("Посмотрел таблицу и сделал работу.");

    expect(result.score).toBeLessThan(60);
    expect(result.feedback).toContain("Что улучшить:");
  });
});

describe("generateMentorReply", () => {
  it("returns a targeted hint for regression questions", () => {
    const reply = generateMentorReply("Как проверить регрессию?");

    expect(reply).toContain("MAE");
    expect(reply).toContain("RMSE");
  });
});
