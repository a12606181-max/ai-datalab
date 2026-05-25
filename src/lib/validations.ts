import { z } from "zod";

import {
  isAvatarKeyForGender,
  isSupportedAvatarKey,
  isSupportedUserGender,
} from "@/lib/avatar-options";
import {
  isSupportedRequiredFormat,
  normalizeRequiredFormat,
} from "@/lib/file-formats";

const trimmedText = (min: number, message: string) =>
  z.string().trim().min(min, message);

const optionalTrimmedText = () =>
  z
    .string()
    .optional()
    .transform((value) => value?.trim() ?? "");

const optionalPositiveInt = (message: string) =>
  z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) return undefined;
      return value;
    },
    z.coerce.number().int().min(1, message).optional(),
  );

const normalizedEmail = z
  .string()
  .trim()
  .toLowerCase()
  .email("Введите корректный email.");

export const registerSchema = z
  .object({
    name: trimmedText(2, "Имя должно содержать минимум 2 символа."),
    email: normalizedEmail,
    password: z
      .string()
      .trim()
      .min(8, "Пароль должен содержать минимум 8 символов.")
      .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, "Пароль должен содержать буквы и цифры."),
    confirmPassword: z.string(),
    role: z.string().refine((value) => ["STUDENT", "TEACHER"].includes(value), {
      message: "Выберите роль.",
    }),
    gender: z.string().refine((value) => isSupportedUserGender(value), {
      message: "Выберите пол.",
    }),
    avatarKey: z.string().refine((value) => isSupportedAvatarKey(value), {
      message: "Выберите аватар.",
    }),
    acceptTerms: z
      .string()
      .optional()
      .refine((value) => value === "on", {
        message: "Необходимо согласиться с условиями использования.",
      }),
  })
  .superRefine((data, ctx) => {
    if (isSupportedUserGender(data.gender) && !isAvatarKeyForGender(data.avatarKey, data.gender)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["avatarKey"],
        message: "Выберите аватар из доступных для выбранного пола.",
      });
    }
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают.",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: normalizedEmail,
  password: z.string().trim().min(1, "Введите пароль."),
});

export const profileSchema = z.object({
  name: trimmedText(2, "Имя должно содержать минимум 2 символа."),
  email: normalizedEmail,
});

export const lessonCompletionSchema = z.object({
  lessonId: z.string().min(1),
});

export const labSubmissionSchema = z.object({
  labId: z.string().min(1),
  answerText: z
    .string()
    .trim()
    .min(30, "Ответ должен содержать минимум 30 символов.")
    .max(4000, "Ответ слишком длинный."),
  uploadedFileName: z.string().optional(),
});

export const mentorMessageSchema = z.object({
  message: z.string().trim().min(2, "Введите вопрос для ИИ-наставника."),
});

export const courseSchema = z.object({
  title: trimmedText(1, "Введите название курса."),
  description: optionalTrimmedText(),
  difficulty: z.string().min(1, "Выберите уровень сложности."),
});

export const lessonSchema = z.object({
  courseId: z.string().min(1, "Выберите курс."),
  title: trimmedText(1, "Введите название урока."),
  content: trimmedText(1, "Добавьте теорию урока."),
  order: optionalPositiveInt("Порядок урока должен быть положительным числом."),
  estimatedMinutes: optionalPositiveInt("Длительность урока должна быть положительным числом."),
});

export const lessonQuizSchema = z.object({
  question: trimmedText(1, "Добавьте вопрос для мини-теста."),
  optionA: trimmedText(1, "Заполните вариант 1."),
  optionB: trimmedText(1, "Заполните вариант 2."),
  optionC: trimmedText(1, "Заполните вариант 3."),
  correctAnswer: z.string().refine((value) => ["A", "B", "C"].includes(value), {
    message: "Выберите правильный вариант ответа.",
  }),
  explanation: optionalTrimmedText(),
});

export const labSchema = z.object({
  title: trimmedText(1, "Введите название лабораторной."),
  description: optionalTrimmedText(),
  goal: optionalTrimmedText(),
  difficulty: z.string().min(1, "Выберите уровень сложности."),
  deadline: z
    .string()
    .optional()
    .transform((value) => value?.trim() ?? "")
    .refine((value) => !value || !Number.isNaN(Date.parse(value)), "Укажите корректную дату дедлайна."),
  datasetId: z.string().optional(),
  requiredFormat: z
    .string()
    .trim()
    .optional()
    .transform((value) => normalizeRequiredFormat(value))
    .refine(
      isSupportedRequiredFormat,
      "Укажите расширение в формате .csv или .xlsx без слэшей и пробелов.",
    ),
  minAnswerLength: optionalPositiveInt("Минимальная длина ответа должна быть положительным числом."),
});

export const datasetSchema = z.object({
  title: trimmedText(1, "Введите название датасета."),
  description: optionalTrimmedText(),
  filename: z
    .string()
    .trim()
    .min(1, "Укажите имя CSV-файла.")
    .regex(/\.csv$/i, "Для датасета нужен CSV-файл с расширением .csv."),
  rowsCount: optionalPositiveInt("Количество строк должно быть положительным числом."),
  size: optionalTrimmedText(),
  tags: optionalTrimmedText(),
});
