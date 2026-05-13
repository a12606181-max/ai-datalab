"use server";

import { revalidatePath } from "next/cache";

import { ActionState } from "@/lib/action-state";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/validations";

export async function updateProfileAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = profileSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
    });

    if (!parsed.success) {
      return {
        success: false,
        message: "Проверьте данные профиля.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const duplicate = await prisma.user.findFirst({
      where: {
        email: parsed.data.email,
        NOT: { id: user.id },
      },
    });

    if (duplicate) {
      return {
        success: false,
        message: "Этот email уже используется другим пользователем.",
        fieldErrors: { email: ["Email уже занят."] },
      };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: parsed.data,
    });

    revalidatePath("/profile");
    revalidatePath("/settings");

    return {
      success: true,
      message: "Профиль успешно обновлён.",
    };
  } catch {
    return {
      success: false,
      message: "Не удалось обновить профиль.",
    };
  }
}
