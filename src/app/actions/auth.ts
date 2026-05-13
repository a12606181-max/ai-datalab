"use server";

import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

import { ActionState } from "@/lib/action-state";
import { createSession, hashPassword, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { registerSchema, loginSchema } from "@/lib/validations";

export async function registerAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const parsed = registerSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
      role: formData.get("role"),
      acceptTerms: formData.get("acceptTerms"),
    });

    if (!parsed.success) {
      return {
        success: false,
        message: "Проверьте корректность заполнения формы.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const { name, email, password, role } = parsed.data;
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return {
        success: false,
        message: "Пользователь с таким email уже существует.",
        fieldErrors: { email: ["Email уже используется."] },
      };
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role: role as UserRole,
        passwordHash: await hashPassword(password),
        level: role === "TEACHER" ? "Expert" : "Beginner",
      },
    });

    if (role === "STUDENT") {
      await prisma.skillProgress.createMany({
        data: [
          { userId: user.id, skill: "Python", value: 18 },
          { userId: user.id, skill: "Data Analysis", value: 14 },
          { userId: user.id, skill: "Machine Learning", value: 10 },
          { userId: user.id, skill: "Visualization", value: 15 },
          { userId: user.id, skill: "AI Basics", value: 22 },
        ],
      });
    }

    await createSession({ userId: user.id, role: user.role });
  } catch {
    return {
      success: false,
      message: "Не удалось зарегистрироваться. Попробуйте ещё раз.",
    };
  }

  redirect("/dashboard");
}

export async function loginAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const parsed = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!parsed.success) {
      return {
        success: false,
        message: "Проверьте email и пароль.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (!user) {
      return {
        success: false,
        message: "Пользователь не найден.",
        fieldErrors: { email: ["Пользователь с таким email не найден."] },
      };
    }

    const passwordValid = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!passwordValid) {
      return {
        success: false,
        message: "Неверный пароль.",
        fieldErrors: { password: ["Неверный пароль."] },
      };
    }

    await createSession({ userId: user.id, role: user.role });
  } catch {
    return {
      success: false,
      message: "Не удалось выполнить вход. Попробуйте снова.",
    };
  }

  redirect("/dashboard");
}
