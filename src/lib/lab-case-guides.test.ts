import { describe, expect, it } from "vitest";

import { getLabCaseGuide } from "@/lib/lab-case-guides";

describe("getLabCaseGuide", () => {
  it("returns detailed theory for known labs", () => {
    const guide = getLabCaseGuide("Прогноз риска академической задолженности");

    expect(guide.theory.length).toBeGreaterThanOrEqual(3);
    expect(guide.checklist.length).toBeGreaterThanOrEqual(4);
    expect(guide.successCriteria.length).toBeGreaterThanOrEqual(4);
    expect(guide.focusTerms).toContain("модел");
  });

  it("returns a safe fallback for unknown labs", () => {
    const guide = getLabCaseGuide("Неизвестный кейс");

    expect(guide.overview.length).toBeGreaterThan(20);
    expect(guide.checklist.length).toBeGreaterThan(0);
  });
});
