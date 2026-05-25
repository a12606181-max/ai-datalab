import { describe, expect, it } from "vitest";

import {
  getFileExtensionLabel,
  isSafeDatasetFilename,
  isSupportedRequiredFormat,
  normalizeRequiredFormat,
} from "@/lib/file-formats";

describe("file format helpers", () => {
  it("accepts only plain csv filenames", () => {
    expect(isSafeDatasetFilename("students.csv")).toBe(true);
    expect(isSafeDatasetFilename("reports/2026.csv")).toBe(false);
    expect(isSafeDatasetFilename("..\\secret.csv")).toBe(false);
  });

  it("normalizes required file formats", () => {
    expect(normalizeRequiredFormat("csv")).toBe(".csv");
    expect(normalizeRequiredFormat(" .XLSX ")).toBe(".xlsx");
    expect(normalizeRequiredFormat()).toBe(".csv");
  });

  it("validates supported file formats", () => {
    expect(isSupportedRequiredFormat(".csv")).toBe(true);
    expect(isSupportedRequiredFormat(".xlsx")).toBe(true);
    expect(isSupportedRequiredFormat("../csv")).toBe(false);
  });

  it("builds an uppercased extension label", () => {
    expect(getFileExtensionLabel("student-report.xlsx")).toBe("XLSX");
    expect(getFileExtensionLabel("dataset.csv")).toBe("CSV");
  });
});
