import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(2, "Имя должно содержать минимум 2 символа."),
    email: z.string().email("Введите корректный email."),
    password: z
      .string()
      .min(8, "Пароль должен содержать минимум 8 символов.")
      .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, "Пароль должен содержать буквы и цифры."),
    confirmPassword: z.string(),
    role: z.string().refine((value) => ["STUDENT", "TEACHER"].includes(value), {
      message: "Выберите роль.",
    }),
    acceptTerms: z
      .string()
      .optional()
      .refine((value) => value === "on", {
        message: "Необходимо согласиться с условиями использования.",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают.",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Введите корректный email."),
  password: z.string().min(1, "Введите пароль."),
});

export const profileSchema = z.object({
  name: z.string().min(2, "Имя должно содержать минимум 2 символа."),
  email: z.string().email("Введите корректный email."),
});

export const lessonCompletionSchema = z.object({
  lessonId: z.string().min(1),
});

export const labSubmissionSchema = z.object({
  labId: z.string().min(1),
  answerText: z
    .string()
    .min(30, "Ответ должен содержать минимум 30 символов.")
    .max(4000, "Ответ слишком длинный."),
  uploadedFileName: z.string().optional(),
});

export const mentorMessageSchema = z.object({
  message: z.string().min(2, "Введите вопрос для ИИ-наставника."),
});

export const courseSchema = z.object({
  title: z.string().min(3, "Название курса должно содержать минимум 3 символа."),
  description: z.string().min(20, "Описание должно содержать минимум 20 символов."),
  difficulty: z.string().min(1, "Выберите уровень сложности."),
});

export const lessonSchema = z.object({
  courseId: z.string().min(1, "Выберите курс."),
  title: z.string().min(3, "Название урока должно содержать минимум 3 символа."),
  content: z.string().min(120, "Теория урока должна быть подробной и содержать минимум 120 символов."),
  order: z.coerce.number().int().min(1, "Порядок урока должен быть положительным."),
  estimatedMinutes: z.coerce
    .number()
    .int()
    .min(10, "Длительность урока должна быть не менее 10 минут."),
  question: z.string().min(12, "Добавьте содержательный вопрос для теста."),
  optionA: z.string().min(1, "Заполните вариант A."),
  optionB: z.string().min(1, "Заполните вариант B."),
  optionC: z.string().min(1, "Заполните вариант C."),
  correctAnswer: z.string().min(1, "Выберите правильный ответ."),
  explanation: z.string().min(20, "Добавьте понятное объяснение правильного ответа."),
});

export const labSchema = z.object({
  title: z.string().min(3, "Название лабораторной должно содержать минимум 3 символа."),
  description: z.string().min(20, "Описание должно содержать минимум 20 символов."),
  goal: z.string().min(10, "Цель лабораторной должна быть подробнее."),
  difficulty: z.string().min(1, "Выберите уровень сложности."),
  deadline: z.string().min(1, "Укажите дедлайн."),
  datasetId: z.string().optional(),
  requiredFormat: z.string().optional(),
  minAnswerLength: z.coerce.number().int().min(30, "Минимальная длина ответа не менее 30."),
});

export const datasetSchema = z.object({
  title: z.string().min(3, "Название датасета должно содержать минимум 3 символа."),
  description: z.string().min(10, "Описание должно содержать минимум 10 символов."),
  filename: z.string().min(1, "Укажите имя файла."),
  rowsCount: z.coerce.number().int().positive("Количество строк должно быть положительным."),
  size: z.string().min(1, "Укажите размер файла."),
  tags: z.string().min(1, "Добавьте теги через запятую."),
});
