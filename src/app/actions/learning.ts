"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { ActionState } from "@/lib/action-state";
import { requireUser } from "@/lib/auth";
import { getLabCaseGuide } from "@/lib/lab-case-guides";
import { resolveCourseSkill, resolveLabSkillBoosts } from "@/lib/learning-analytics";
import { prisma } from "@/lib/prisma";
import { scoreLabSubmission } from "@/lib/scoring";
import { labSubmissionSchema, lessonCompletionSchema } from "@/lib/validations";

async function incrementSkillProgress(
  db: Prisma.TransactionClient | typeof prisma,
  userId: string,
  skill: string,
  delta: number,
) {
  const current = await db.skillProgress.findFirst({
    where: { userId, skill },
  });

  if (current) {
    await db.skillProgress.update({
      where: { id: current.id },
      data: {
        value: Math.min(100, current.value + delta),
      },
    });
    return;
  }

  await db.skillProgress.create({
    data: {
      userId,
      skill,
      value: Math.min(100, Math.max(delta, 1)),
    },
  });
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

    await prisma.$transaction(async (tx) => {
      await tx.progress.upsert({
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
        tx.progress.count({
          where: {
            userId: user.id,
            courseId: lesson.courseId,
            type: "LESSON",
            completed: true,
          },
        }),
        tx.lesson.count({
          where: { courseId: lesson.courseId },
        }),
        tx.progress.findFirst({
          where: {
            userId: user.id,
            courseId: lesson.courseId,
            type: "COURSE",
          },
        }),
      ]);

      const progressValue = Math.round((completedLessons / Math.max(totalLessons, 1)) * 100);

      if (existingCourseProgress) {
        await tx.progress.update({
          where: { id: existingCourseProgress.id },
          data: {
            value: progressValue,
            completed: progressValue === 100,
          },
        });
      } else {
        await tx.progress.create({
          data: {
            userId: user.id,
            courseId: lesson.courseId,
            type: "COURSE",
            value: progressValue,
            completed: progressValue === 100,
          },
        });
      }

      await incrementSkillProgress(
        tx,
        user.id,
        resolveCourseSkill(lesson.course.title),
        Math.max(3, Math.round(scorePercent / 12)),
      );
    });

    revalidatePath("/dashboard");
    revalidatePath("/courses");
    revalidatePath(`/courses/${lesson.courseId}`);
    revalidatePath(`/lessons/${lesson.id}`);
    revalidatePath("/progress");
    revalidatePath("/profile");

    const nextLesson = await prisma.lesson.findFirst({
      where: {
        courseId: lesson.courseId,
        order: {
          gt: lesson.order,
        },
      },
      orderBy: { order: "asc" },
      select: {
        id: true,
        title: true,
      },
    });

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
        courseHref: `/courses/${lesson.courseId}`,
        courseTitle: lesson.course.title,
        nextLessonHref: nextLesson ? `/lessons/${nextLesson.id}` : null,
        nextLessonTitle: nextLesson?.title ?? null,
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

    const expectedFormat = (lab.requiredFormat || ".csv").toLowerCase();
    if (uploadedFileName && !uploadedFileName.toLowerCase().endsWith(expectedFormat)) {
      return {
        success: false,
        message: `Файл должен быть в формате ${expectedFormat}.`,
        fieldErrors: { uploadedFileName: [`Допустимы только файлы ${expectedFormat}.`] },
      };
    }

    if (parsed.data.answerText.trim().length < lab.minAnswerLength) {
      return {
        success: false,
        message: "Ответ пока слишком короткий для проверки.",
        fieldErrors: {
          answerText: [`Минимальная длина ответа для этого кейса — ${lab.minAnswerLength} символов.`],
        },
      };
    }

    const caseGuide = getLabCaseGuide(lab.title);
    const result = scoreLabSubmission(parsed.data.answerText, caseGuide.focusTerms);

    await prisma.$transaction(async (tx) => {
      await tx.submission.create({
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

      const existingProgress = await tx.progress.findFirst({
        where: { userId: user.id, labId: lab.id, type: "LAB" },
      });

      if (existingProgress) {
        await tx.progress.update({
          where: { id: existingProgress.id },
          data: {
            value: result.score,
            completed: true,
          },
        });
      } else {
        await tx.progress.create({
          data: {
            userId: user.id,
            labId: lab.id,
            type: "LAB",
            value: result.score,
            completed: true,
          },
        });
      }

      for (const boost of resolveLabSkillBoosts(lab.title)) {
        await incrementSkillProgress(
          tx,
          user.id,
          boost.skill,
          Math.max(1, Math.round((result.score / 100) * boost.value)),
        );
      }
    });

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
