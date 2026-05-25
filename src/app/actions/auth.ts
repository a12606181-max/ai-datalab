"use server";

import { UserGender, UserRole, UserStatus } from "@prisma/client";

import { ActionState } from "@/lib/action-state";
import { createSession, hashPassword, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema, registerSchema } from "@/lib/validations";

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
      gender: formData.get("gender"),
      avatarKey: formData.get("avatarKey"),
      acceptTerms: formData.get("acceptTerms"),
    });

    if (!parsed.success) {
      return {
        success: false,
        message: "Проверьте корректность заполнения формы.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const { name, email, password, role, gender, avatarKey } = parsed.data;
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return {
        success: false,
        message: "Пользователь с таким email уже существует.",
        fieldErrors: { email: ["Email уже используется."] },
      };
    }

    const isTeacherRequest = role === "TEACHER";

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role: role as UserRole,
        status: isTeacherRequest ? UserStatus.PENDING : UserStatus.APPROVED,
        gender: gender as UserGender,
        avatarKey,
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

    if (isTeacherRequest) {
      return {
        success: true,
        message: "Заявка преподавателя отправлена администратору. Войти в кабинет можно будет после одобрения.",
      };
    }

    await createSession({ userId: user.id, role: user.role });
    return {
      success: true,
      data: { redirectTo: "/dashboard" },
    };
  } catch {
    return {
      success: false,
      message: "Не удалось зарегистрироваться. Попробуйте ещё раз.",
    };
  }
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

    if (user.role === UserRole.TEACHER && user.status === UserStatus.PENDING) {
      return {
        success: false,
        message: "Заявка преподавателя ещё не одобрена администратором.",
        fieldErrors: {
          email: ["Дождитесь одобрения администратора, прежде чем входить в кабинет преподавателя."],
        },
      };
    }

    if (user.role === UserRole.TEACHER && user.status === UserStatus.REJECTED) {
      return {
        success: false,
        message: "Заявка преподавателя была отклонена администратором.",
        fieldErrors: {
          email: ["Эта заявка была отклонена. При необходимости зарегистрируйтесь заново с другим email."],
        },
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
    return {
      success: true,
      data: { redirectTo: user.role === UserRole.ADMIN ? "/admin" : "/dashboard" },
    };
  } catch {
    return {
      success: false,
      message: "Не удалось выполнить вход. Попробуйте снова.",
    };
  }
}
