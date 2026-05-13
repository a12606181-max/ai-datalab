"use server";

import { revalidatePath } from "next/cache";

import { ActionState } from "@/lib/action-state";
import { requireTeacher } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { courseSchema, datasetSchema, labSchema, lessonSchema } from "@/lib/validations";

function buildTeacherExtraQuestions(title: string) {
  return [
    {
      question: `Какой главный практический навык формирует урок «${title}»?`,
      options: ["Работа с данными и выводами", "Случайное изменение интерфейса", "Удаление всех строк из таблицы"],
      correctAnswer: "Работа с данными и выводами",
      explanation: "Любой урок платформы должен вести к реальному навыку анализа данных, а не к формальным действиям.",
    },
    {
      question: `Что студент должен сделать после изучения темы «${title}»?`,
      options: ["Применить материал на примере и сделать вывод", "Только прочитать название урока", "Пропустить проверку понимания темы"],
      correctAnswer: "Применить материал на примере и сделать вывод",
      explanation: "После теории важно перейти к практике, небольшому анализу и формулировке понятного вывода.",
    },
    {
      question: `Почему по теме «${title}» важно не только прочитать теорию, но и пройти тест?`,
      options: [
        "Тест помогает проверить, насколько тема действительно понята",
        "Тест нужен только для красивой кнопки",
        "Тест не связан с качеством обучения",
      ],
      correctAnswer: "Тест помогает проверить, насколько тема действительно понята",
      explanation: "Проверка вопросов после теории помогает закрепить понимание и увидеть, какие места нужно повторить.",
    },
    {
      question: `Какой результат считается лучшим после урока «${title}»?`,
      options: [
        "Студент может объяснить тему своими словами и применить её к задаче",
        "Студент просто открыл урок и сразу закрыл вкладку",
        "Студент прочитал только первый абзац",
      ],
      correctAnswer: "Студент может объяснить тему своими словами и применить её к задаче",
      explanation: "Хороший учебный результат — это не чтение ради чтения, а понимание темы и готовность использовать её на практике.",
    },
  ];
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
        ...parsed.data,
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
      question: formData.get("question"),
      optionA: formData.get("optionA"),
      optionB: formData.get("optionB"),
      optionC: formData.get("optionC"),
      correctAnswer: formData.get("correctAnswer"),
      explanation: formData.get("explanation"),
    });

    if (!parsed.success) {
      return {
        success: false,
        message: "Проверьте форму урока.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const lesson = await prisma.lesson.create({
      data: {
        courseId: parsed.data.courseId,
        title: parsed.data.title,
        content: parsed.data.content,
        order: parsed.data.order,
        estimatedMinutes: parsed.data.estimatedMinutes,
      },
    });

    const quizzes = [
      {
        question: parsed.data.question,
        options: [parsed.data.optionA, parsed.data.optionB, parsed.data.optionC],
        correctAnswer: parsed.data.correctAnswer,
        explanation: parsed.data.explanation,
      },
      ...buildTeacherExtraQuestions(parsed.data.title),
    ];

    await prisma.quiz.createMany({
      data: quizzes.map((quiz, index) => ({
        lessonId: lesson.id,
        order: index + 1,
        question: quiz.question,
        options: JSON.stringify(quiz.options),
        correctAnswer: quiz.correctAnswer,
        explanation: quiz.explanation,
      })),
    });

    const lessonsCount = await prisma.lesson.count({
      where: { courseId: parsed.data.courseId },
    });

    await prisma.course.update({
      where: { id: parsed.data.courseId },
      data: { lessonsCount },
    });

    revalidatePath("/courses");
    revalidatePath(`/courses/${parsed.data.courseId}`);
    revalidatePath("/teacher");
    return { success: true, message: "Урок и расширенный тест добавлены." };
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
        ...parsed.data,
        deadline: new Date(parsed.data.deadline),
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

    await prisma.dataset.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        filename: parsed.data.filename,
        rowsCount: parsed.data.rowsCount,
        size: parsed.data.size,
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
