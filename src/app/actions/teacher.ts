"use server";

import { access, readFile, stat } from "node:fs/promises";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { ActionState } from "@/lib/action-state";
import { requireTeacher } from "@/lib/auth";
import { resolveDatasetFilePath } from "@/lib/dataset-files";
import { prisma } from "@/lib/prisma";
import { courseSchema, datasetSchema, labSchema, lessonQuizSchema, lessonSchema } from "@/lib/validations";

function getDefaultLabDeadline() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  date.setHours(0, 0, 0, 0);
  return date;
}

function parseLessonQuizzes(rawQuizzes: FormDataEntryValue | null) {
  if (typeof rawQuizzes !== "string") {
    return {
      success: false as const,
      errorMessage: "Добавьте хотя бы один вопрос к уроку.",
    };
  }

  try {
    const parsedJson = JSON.parse(rawQuizzes);
    const parsedQuizzes = z.array(lessonQuizSchema).min(1, "Добавьте хотя бы один вопрос к уроку.").safeParse(parsedJson);

    if (!parsedQuizzes.success) {
      return {
        success: false as const,
        errorMessage:
          parsedQuizzes.error.issues[0]?.message || "Проверьте вопросы теста перед сохранением урока.",
      };
    }

    return {
      success: true as const,
      value: parsedQuizzes.data,
    };
  } catch {
    return {
      success: false as const,
      errorMessage: "Не удалось прочитать вопросы теста. Добавьте их заново и попробуйте ещё раз.",
    };
  }
}

function countCsvRows(content: string) {
  const lines = content.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim().length > 0);
  return Math.max(lines.length - 1, 0);
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function createCourseAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireTeacher();

    const parsed = courseSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description"),
      difficulty: formData.get("difficulty"),
    });

    if (!parsed.success) {
      return {
        success: false,
        message: "Проверьте форму курса.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    await prisma.course.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description || `Новый курс «${parsed.data.title}» на платформе AI DataLab.`,
        difficulty: parsed.data.difficulty,
        lessonsCount: 0,
        imageGradient: "from-fuchsia-500/30 via-violet-500/10 to-transparent",
      },
    });

    revalidatePath("/courses");
    revalidatePath("/teacher");

    return { success: true, message: "Курс добавлен." };
  } catch {
    return { success: false, message: "Не удалось создать курс." };
  }
}

export async function createLessonAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireTeacher();

    const parsed = lessonSchema.safeParse({
      courseId: formData.get("courseId"),
      title: formData.get("title"),
      content: formData.get("content"),
      order: formData.get("order"),
      estimatedMinutes: formData.get("estimatedMinutes"),
    });

    if (!parsed.success) {
      return {
        success: false,
        message: "Проверьте форму урока.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const parsedQuizzes = parseLessonQuizzes(formData.get("quizzes"));

    if (!parsedQuizzes.success) {
      return {
        success: false,
        message: "Проверьте форму урока.",
        fieldErrors: {
          quizzes: [parsedQuizzes.errorMessage],
        },
      };
    }

    const [lessonsCount, lastLesson] = await Promise.all([
      prisma.lesson.count({
        where: { courseId: parsed.data.courseId },
      }),
      prisma.lesson.findFirst({
        where: { courseId: parsed.data.courseId },
        orderBy: { order: "desc" },
        select: { order: true },
      }),
    ]);
    const nextOrder = (lastLesson?.order ?? 0) + 1;

    const requestedOrder = parsed.data.order;
    const existingLessonWithOrder = requestedOrder
      ? await prisma.lesson.findFirst({
          where: {
            courseId: parsed.data.courseId,
            order: requestedOrder,
          },
        })
      : null;

    const finalOrder = !requestedOrder || existingLessonWithOrder ? nextOrder : requestedOrder;
    const finalEstimatedMinutes = parsed.data.estimatedMinutes ?? 15;

    await prisma.$transaction(async (tx) => {
      const lesson = await tx.lesson.create({
        data: {
          courseId: parsed.data.courseId,
          title: parsed.data.title,
          content: parsed.data.content,
          order: finalOrder,
          estimatedMinutes: finalEstimatedMinutes,
        },
      });

      await tx.quiz.createMany({
        data: parsedQuizzes.value.map((quiz, index) => {
          const answerMap = {
            A: quiz.optionA,
            B: quiz.optionB,
            C: quiz.optionC,
          } as const;

          return {
          lessonId: lesson.id,
          order: index + 1,
          question: quiz.question,
          options: JSON.stringify([quiz.optionA, quiz.optionB, quiz.optionC]),
          correctAnswer: answerMap[quiz.correctAnswer as keyof typeof answerMap],
          explanation: quiz.explanation || "Преподаватель не добавил пояснение к этому вопросу.",
        };
        }),
      });

      await tx.course.update({
        where: { id: parsed.data.courseId },
        data: { lessonsCount: lessonsCount + 1 },
      });
    });

    revalidatePath("/courses");
    revalidatePath(`/courses/${parsed.data.courseId}`);
    revalidatePath("/teacher");

    if (!requestedOrder) {
      return {
        success: true,
        message: `Урок добавлен. Система автоматически поставила порядок ${finalOrder}.`,
      };
    }

    if (existingLessonWithOrder) {
      return {
        success: true,
        message: `Урок добавлен. Порядок ${requestedOrder} был занят, поэтому установлен следующий свободный номер: ${finalOrder}.`,
      };
    }

    return {
      success: true,
      message: `Урок добавлен. В тесте сохранено ${parsedQuizzes.value.length} вопрос(ов).`,
    };
  } catch {
    return { success: false, message: "Не удалось создать урок." };
  }
}

export async function createLabAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireTeacher();

    const parsed = labSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description"),
      goal: formData.get("goal"),
      difficulty: formData.get("difficulty"),
      deadline: formData.get("deadline"),
      datasetId: formData.get("datasetId") || undefined,
      requiredFormat: formData.get("requiredFormat") || undefined,
      minAnswerLength: formData.get("minAnswerLength"),
    });

    if (!parsed.success) {
      return {
        success: false,
        message: "Проверьте форму лабораторной.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    await prisma.lab.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description || `Практическая работа «${parsed.data.title}».`,
        goal: parsed.data.goal || "Закрепить тему на практике и получить проверяемый результат.",
        difficulty: parsed.data.difficulty,
        deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : getDefaultLabDeadline(),
        datasetId: parsed.data.datasetId || undefined,
        requiredFormat: parsed.data.requiredFormat || ".csv",
        minAnswerLength: parsed.data.minAnswerLength ?? 30,
      },
    });

    revalidatePath("/labs");
    revalidatePath("/teacher");

    return { success: true, message: "Лабораторная добавлена." };
  } catch {
    return { success: false, message: "Не удалось создать лабораторную." };
  }
}

export async function createDatasetAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireTeacher();

    const parsed = datasetSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description"),
      filename: formData.get("filename"),
      rowsCount: formData.get("rowsCount"),
      size: formData.get("size"),
      tags: formData.get("tags"),
    });

    if (!parsed.success) {
      return {
        success: false,
        message: "Проверьте форму датасета.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const datasetPath = resolveDatasetFilePath(parsed.data.filename);

    if (!datasetPath) {
      return {
        success: false,
        message: "Имя файла должно указывать только на CSV внутри public/datasets.",
        fieldErrors: {
          filename: ["Используйте имя вида dataset.csv без папок и специальных путей."],
        },
      };
    }

    try {
      await access(datasetPath);
    } catch {
      return {
        success: false,
        message: "CSV-файл не найден в папке public/datasets.",
        fieldErrors: {
          filename: ["Сначала добавьте CSV-файл в public/datasets, а потом зарегистрируйте его в панели преподавателя."],
        },
      };
    }

    const [fileStats, fileContent] = await Promise.all([
      stat(datasetPath),
      readFile(datasetPath, "utf8"),
    ]);

    const detectedRowsCount = countCsvRows(fileContent);

    await prisma.dataset.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description || `Учебный датасет «${parsed.data.title}».`,
        filename: parsed.data.filename,
        rowsCount: parsed.data.rowsCount ?? detectedRowsCount,
        size: parsed.data.size || formatBytes(fileStats.size),
        tags: JSON.stringify(
          parsed.data.tags
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        ),
      },
    });

    revalidatePath("/datasets");
    revalidatePath("/teacher");

    return { success: true, message: "Датасет добавлен." };
  } catch {
    return { success: false, message: "Не удалось создать датасет." };
  }
}
