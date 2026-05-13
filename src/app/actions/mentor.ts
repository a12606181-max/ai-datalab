"use server";

import { revalidatePath } from "next/cache";

import { ActionState } from "@/lib/action-state";
import { requireUser } from "@/lib/auth";
import { generateMentorAnswer } from "@/lib/mentor-ai";
import { prisma } from "@/lib/prisma";
import { mentorMessageSchema } from "@/lib/validations";

export async function sendMentorMessageAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = mentorMessageSchema.safeParse({
      message: formData.get("message"),
    });

    if (!parsed.success) {
      return {
        success: false,
        message: "Введите сообщение для наставника.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    await prisma.mentorMessage.create({
      data: {
        userId: user.id,
        role: "USER",
        content: parsed.data.message,
      },
    });

    await prisma.mentorMessage.create({
      data: {
        userId: user.id,
        role: "AI",
        content: await generateMentorAnswer(parsed.data.message),
      },
    });

    revalidatePath("/mentor");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Ответ ИИ-наставника обновлён.",
    };
  } catch {
    return {
      success: false,
      message: "Не удалось отправить сообщение наставнику.",
    };
  }
}
