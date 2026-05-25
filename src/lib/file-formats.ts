const DATASET_FILENAME_RE = /^[^/\\]+\.csv$/i;
const REQUIRED_FORMAT_RE = /^\.[a-z0-9]+$/i;

export function isSafeDatasetFilename(filename: string) {
  return DATASET_FILENAME_RE.test(filename.trim());
}

export function normalizeRequiredFormat(value?: string | null) {
  const trimmed = value?.trim().toLowerCase() ?? "";
  if (!trimmed) return ".csv";

  return trimmed.startsWith(".") ? trimmed : `.${trimmed}`;
}

export function isSupportedRequiredFormat(value: string) {
  return REQUIRED_FORMAT_RE.test(value);
}

export function getFileExtensionLabel(filename: string) {
  const match = filename.trim().match(/\.([a-z0-9]+)$/i);
  return match ? match[1].toUpperCase() : "FILE";
}
