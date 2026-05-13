import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { getDatasetDownload } from "@/lib/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ datasetId: string }> },
) {
  const user = await getCurrentUser();

  if (!user) {
    return new NextResponse("Требуется авторизация", { status: 401 });
  }

  const { datasetId } = await params;
  const file = await getDatasetDownload(user.id, user.role, datasetId);

  if (!file) {
    return new NextResponse("Файл не найден или недоступен", { status: 404 });
  }

  return new NextResponse(file.content, {
    status: 200,
    headers: {
      "Content-Type": file.mimeType,
      "Content-Disposition": `attachment; filename="${file.filename}"`,
    },
  });
}
