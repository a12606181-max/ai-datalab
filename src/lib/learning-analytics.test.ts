import { describe, expect, it } from "vitest";

import {
  buildDailyActivity,
  buildNextSteps,
  buildRecommendedNextStep,
  buildTimeSpentSummary,
  buildWeeklyActivity,
  resolveCourseSkill,
  resolveLabSkillBoosts,
} from "@/lib/learning-analytics";

describe("resolveCourseSkill", () => {
  it("maps course titles to the correct skill", () => {
    expect(resolveCourseSkill("Python для анализа данных")).toBe("Python");
    expect(resolveCourseSkill("Визуализация данных")).toBe("Visualization");
    expect(resolveCourseSkill("Искусственный интеллект в образовании")).toBe("AI Basics");
    expect(resolveCourseSkill("Основы машинного обучения")).toBe("Machine Learning");
  });
});

describe("resolveLabSkillBoosts", () => {
  it("prefers visualization boosts for chart labs", () => {
    const boosts = resolveLabSkillBoosts("Построение графиков");

    expect(boosts.some((item) => item.skill === "Visualization")).toBe(true);
  });
});

describe("activity builders", () => {
  it("aggregates daily activity by date and weight", () => {
    const today = new Date();
    const data = buildDailyActivity([
      { date: today, weight: 1 },
      { date: today, weight: 2 },
    ]);

    expect(data).toHaveLength(7);
    expect(data[data.length - 1]?.value).toBe(3);
  });

  it("aggregates weekly activity into fixed buckets", () => {
    const now = new Date();
    const threeDaysAgo = new Date(now);
    threeDaysAgo.setDate(now.getDate() - 3);

    const result = buildWeeklyActivity([{ date: threeDaysAgo, weight: 2 }], 5);

    expect(result).toHaveLength(5);
    expect(result[result.length - 1]?.value).toBe(2);
  });
});

describe("recommendations", () => {
  it("builds the next step from weak skills and pending labs", () => {
    const step = buildRecommendedNextStep(
      [
        { skill: "Machine Learning", value: 42 },
        { skill: "Python", value: 80 },
      ],
      [{ title: "Финальный ML-кейс" }],
    );

    expect(step).toContain("Машинное обучение");
    expect(step).toContain("Финальный ML-кейс");
  });

  it("limits next steps to three items", () => {
    const steps = buildNextSteps(
      [
        { skill: "Machine Learning", value: 42 },
        { skill: "Visualization", value: 35 },
        { skill: "Python", value: 70 },
      ],
      [{ title: "Построение графиков" }, { title: "Финальный ML-кейс" }],
    );

    expect(steps.length).toBeLessThanOrEqual(3);
  });
});

describe("buildTimeSpentSummary", () => {
  it("converts minutes into dashboard-friendly cards", () => {
    const items = buildTimeSpentSummary({
      lessonMinutes: 120,
      submittedLabsCount: 2,
      mentorRepliesCount: 3,
    });

    expect(items).toHaveLength(3);
    expect(items[0]?.hours).toContain("ч");
    expect(items.reduce((sum, item) => sum + item.progress, 0)).toBeGreaterThan(95);
  });
});
