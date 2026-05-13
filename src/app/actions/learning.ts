"use server";

import { revalidatePath } from "next/cache";

import { ActionState } from "@/lib/action-state";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scoreLabSubmission } from "@/lib/scoring";
import { labSubmissionSchema, lessonCompletionSchema } from "@/lib/validations";

function getCourseSkill(courseTitle: string) {
  if (courseTitle.includes("Python")) return "Python";
  if (courseTitle.includes("машин")) return "Machine Learning";
  if (courseTitle.includes("Визуал")) return "Visualization";
  if (courseTitle.includes("Искусственный интеллект")) return "AI Basics";
  return "Data Analysis";
}

export async function completeLessonAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = lessonCompletionSchema.safeParse({
      lessonId: formData.get("lessonId"),
    });

    if (!parsed.success) {
      return {
        success: false,
        message: "Не удалось определить урок для проверки теста.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: parsed.data.lessonId },
      include: {
        course: true,
        quizzes: { orderBy: { order: "asc" } },
      },
    });

    if (!lesson || !lesson.quizzes.length) {
      return { success: false, message: "Урок или тест не найден." };
    }

    const results = lesson.quizzes.map((quiz) => {
      const answer = String(formData.get(`answer.${quiz.id}`) || "");
      return {
        quizId: quiz.id,
        question: quiz.question,
        selectedAnswer: answer,
        correctAnswer: quiz.correctAnswer,
        explanation: quiz.explanation,
        correct: answer === quiz.correctAnswer,
      };
    });

    const unanswered = results.filter((item) => !item.selectedAnswer);
    if (unanswered.length) {
      return {
        success: false,
        message: "Выберите ответ на каждый вопрос теста.",
        fieldErrors: {
          answers: ["Нужно ответить на все вопросы, прежде чем завершить тест."],
        },
      };
    }

    const correctCount = results.filter((item) => item.correct).length;
    const scorePercent = Math.round((correctCount / results.length) * 100);

    await prisma.progress.upsert({
      where: { id: `${user.id}-${lesson.id}-lesson` },
      update: {
        value: scorePercent,
        completed: true,
      },
      create: {
        id: `${user.id}-${lesson.id}-lesson`,
        userId: user.id,
        courseId: lesson.courseId,
        lessonId: lesson.id,
        type: "LESSON",
        value: scorePercent,
        completed: true,
      },
    });

    const [completedLessons, totalLessons, existingCourseProgress] = await Promise.all([
      prisma.progress.count({
        where: {
          userId: user.id,
          courseId: lesson.courseId,
          type: "LESSON",
          completed: true,
        },
      }),
      prisma.lesson.count({
        where: { courseId: lesson.courseId },
      }),
      prisma.progress.findFirst({
        where: {
          userId: user.id,
          courseId: lesson.courseId,
          type: "COURSE",
        },
      }),
    ]);

    const progressValue = Math.round((completedLessons / Math.max(totalLessons, 1)) * 100);

    if (existingCourseProgress) {
      await prisma.progress.update({
        where: { id: existingCourseProgress.id },
        data: {
          value: progressValue,
          completed: progressValue === 100,
        },
      });
    } else {
      await prisma.progress.create({
        data: {
          userId: user.id,
          courseId: lesson.courseId,
          type: "COURSE",
          value: progressValue,
          completed: progressValue === 100,
        },
      });
    }

    const courseSkill = getCourseSkill(lesson.course.title);
    const currentSkill = await prisma.skillProgress.findFirst({
      where: { userId: user.id, skill: courseSkill },
    });

    if (currentSkill) {
      await prisma.skillProgress.update({
        where: { id: currentSkill.id },
        data: { value: Math.min(100, currentSkill.value + Math.max(3, Math.round(scorePercent / 12))) },
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/courses");
    revalidatePath(`/courses/${lesson.courseId}`);
    revalidatePath(`/lessons/${lesson.id}`);
    revalidatePath("/progress");
    revalidatePath("/profile");

    return {
      success: true,
      message:
        scorePercent === 100
          ? "Тест завершён без ошибок."
          : "Тест завершён. Вопросы с ошибками отмечены красным.",
      data: {
        scorePercent,
        correctCount,
        totalQuestions: results.length,
        results,
      },
    };
  } catch {
    return {
      success: false,
      message: "Не удалось завершить урок.",
    };
  }
}

export async function submitLabAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const uploadedFile = formData.get("file");
    const uploadedFileName =
      uploadedFile instanceof File && uploadedFile.size > 0 ? uploadedFile.name : undefined;

    if (uploadedFileName && !uploadedFileName.toLowerCase().endsWith(".csv")) {
      return {
        success: false,
        message: "Файл должен быть в формате .csv.",
        fieldErrors: { uploadedFileName: ["Допустимы только файлы CSV."] },
      };
    }

    const parsed = labSubmissionSchema.safeParse({
      labId: formData.get("labId"),
      answerText: formData.get("answerText"),
      uploadedFileName,
    });

    if (!parsed.success) {
      return {
        success: false,
        message: "Проверьте решение перед отправкой.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const lab = await prisma.lab.findUnique({
      where: { id: parsed.data.labId },
      include: { dataset: true },
    });

    if (!lab) {
      return { success: false, message: "Лабораторная не найдена." };
    }

    const result = scoreLabSubmission(parsed.data.answerText);

    await prisma.submission.create({
      data: {
        userId: user.id,
        labId: lab.id,
        answerText: parsed.data.answerText,
        uploadedFileName,
        score: result.score,
        status: "CHECKED",
        feedback: result.feedback,
      },
    });

    const existingProgress = await prisma.progress.findFirst({
      where: { userId: user.id, labId: lab.id, type: "LAB" },
    });

    if (existingProgress) {
      await prisma.progress.update({
        where: { id: existingProgress.id },
        data: {
          value: result.score,
          completed: true,
        },
      });
    } else {
      await prisma.progress.create({
        data: {
          userId: user.id,
          labId: lab.id,
          type: "LAB",
          value: result.score,
          completed: true,
        },
      });
    }

    const skillBoosts = [
      { skill: "Data Analysis", value: 6 },
      { skill: lab.title.includes("график") ? "Visualization" : "Python", value: 7 },
      {
        skill: lab.title.includes("ML") || lab.title.includes("Прогноз")
          ? "Machine Learning"
          : "AI Basics",
        value: 5,
      },
    ];

    for (const boost of skillBoosts) {
      const current = await prisma.skillProgress.findFirst({
        where: { userId: user.id, skill: boost.skill },
      });

      if (current) {
        await prisma.skillProgress.update({
          where: { id: current.id },
          data: {
            value: Math.min(100, current.value + Math.round((result.score / 100) * boost.value)),
          },
        });
      }
    }

    revalidatePath("/dashboard");
    revalidatePath("/labs");
    revalidatePath(`/labs/${lab.id}`);
    revalidatePath("/progress");
    revalidatePath("/teacher");
    revalidatePath("/profile");

    return {
      success: true,
      message: "Решение отправлено и автоматически проверено.",
      data: {
        score: result.score,
        feedback: result.feedback,
      },
    };
  } catch {
    return {
      success: false,
      message: "Не удалось отправить лабораторную.",
    };
  }
}
