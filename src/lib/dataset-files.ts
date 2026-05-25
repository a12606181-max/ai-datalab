import "server-only";

import path from "node:path";

import { isSafeDatasetFilename } from "@/lib/file-formats";

export function resolveDatasetFilePath(filename: string) {
  const normalizedFilename = filename.trim();
  if (!isSafeDatasetFilename(normalizedFilename)) {
    return null;
  }

  const datasetsDir = path.resolve(process.cwd(), "public", "datasets");
  const filePath = path.resolve(datasetsDir, normalizedFilename);

  if (path.dirname(filePath) !== datasetsDir) {
    return null;
  }

  return filePath;
}
