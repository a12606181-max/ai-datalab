import { UserRole, UserStatus } from "@prisma/client";
import { readFile } from "node:fs/promises";
import * as XLSX from "xlsx";

import { resolveDatasetFilePath } from "@/lib/dataset-files";
import { AppLocale } from "@/lib/locale";
import { getLabCaseGuide } from "@/lib/lab-case-guides";
import {
  buildDailyActivity,
  buildNextSteps,
  buildRecommendedNextStep,
  buildTimeSpentSummary,
  buildWeeklyActivity,
  getWeakSkills,
} from "@/lib/learning-analytics";
import { getMentorPlainText } from "@/lib/mentor-content";
import { prisma } from "@/lib/prisma";
import { getSkillLabel } from "@/lib/labels";
import { average } from "@/lib/utils";

function parseJsonArray(value: string) {
  try {
    return JSON.parse(value) as string[];
  } catch {
    return [];
  }
}

function normalizeForSearch(value: string) {
  return value.toLocaleLowerCase("ru-RU").normalize("NFKC").trim();
}

function matchesQuery(query: string | undefined, fields: Array<string | null | undefined>) {
  if (!query) return true;
  const normalizedQuery = normalizeForSearch(query);
  return fields.some((field) => normalizeForSearch(field ?? "").includes(normalizedQuery));
}

function parseCsvLine(line: string, separator: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === separator && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values.map((item) => item.trim());
}

function parseCsvToRows(content: string) {
  const cleanContent = content.replace(/^\uFEFF/, "").trim();
  if (!cleanContent) return [];

  const lines = cleanContent.split(/\r?\n/).filter(Boolean);
  const separator = lines[0]?.includes(";") ? ";" : ",";
  const headers = parseCsvLine(lines[0], separator);

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line, separator);
    return headers.reduce<Record<string, string>>((acc, header, index) => {
      acc[header] = values[index] ?? "";
      return acc;
    }, {});
  });
}

function buildExcelBuffer(rows: Array<Record<string, string | number>>, sheetName: string): ArrayBuffer {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  const workbookBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  const bytes =
    workbookBuffer instanceof Uint8Array
      ? workbookBuffer
      : new Uint8Array(workbookBuffer);

  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

export async function getCoursesForUser(userId: string, q?: string) {
  const [courses, progress] = await Promise.all([
    prisma.course.findMany({
      orderBy: [{ createdAt: "asc" }, { title: "asc" }],
    }),
    prisma.progress.findMany({
      where: { userId, type: "COURSE" },
    }),
  ]);

  return courses
    .filter((course) => matchesQuery(q, [course.title, course.description, course.difficulty]))
    .map((course) => ({
      ...course,
      progress: progress.find((item) => item.courseId === course.id)?.value ?? 0,
    }));
}

export async function getCourseDetails(courseId: string, userId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      lessons: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!course) return null;

  const [progress, lessonProgress, labs] = await Promise.all([
    prisma.progress.findFirst({
      where: { userId, courseId, type: "COURSE" },
    }),
    prisma.progress.findMany({
      where: { userId, courseId, type: "LESSON", completed: true },
      select: { lessonId: true },
    }),
    prisma.lab.findMany({
      take: 3,
      orderBy: { deadline: "asc" },
      include: { dataset: true },
    }),
  ]);

  return {
    ...course,
    progress: progress?.value ?? 0,
    completedLessonIds: lessonProgress.flatMap((item) => (item.lessonId ? [item.lessonId] : [])),
    relatedLabs: labs,
  };
}

export async function getLessonDetails(lessonId: string, userId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      course: true,
      quizzes: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!lesson || !lesson.quizzes.length) return null;

  const [progress, nextLesson] = await Promise.all([
    prisma.progress.findFirst({
      where: {
        userId,
        lessonId,
        type: "LESSON",
        completed: true,
      },
    }),
    prisma.lesson.findFirst({
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
        order: true,
      },
    }),
  ]);

  return {
    ...lesson,
    courseHref: `/courses/${lesson.courseId}`,
    theorySections: lesson.content.split("\n\n").filter(Boolean),
    quizzes: lesson.quizzes.map((quiz) => ({
      ...quiz,
      options: parseJsonArray(quiz.options),
    })),
    completed: Boolean(progress),
    nextLesson: nextLesson
      ? {
          ...nextLesson,
          href: `/lessons/${nextLesson.id}`,
        }
      : null,
  };
}

export async function getLabs(userId: string, q?: string) {
  const [labs, progress] = await Promise.all([
    prisma.lab.findMany({
      orderBy: { deadline: "asc" },
      include: { dataset: true },
    }),
    prisma.progress.findMany({
      where: { userId, type: "LAB" },
    }),
  ]);

  return labs
    .filter((lab) => matchesQuery(q, [lab.title, lab.description, lab.goal, lab.dataset?.title]))
    .map((lab) => {
      const state = progress.find((item) => item.labId === lab.id);
      return {
        ...lab,
        status: state?.completed ? "Проверено" : "Открыто",
      };
    });
}

export async function getLabDetails(labId: string, userId: string) {
  const lab = await prisma.lab.findUnique({
    where: { id: labId },
    include: { dataset: true },
  });

  if (!lab) return null;

  const latestSubmission = await prisma.submission.findFirst({
    where: { userId, labId },
    orderBy: { createdAt: "desc" },
  });

  return {
    ...lab,
    caseGuide: getLabCaseGuide(lab.title),
    latestSubmission,
  };
}

export async function getStudentDatasetCards(userId: string, q?: string) {
  const [profile, submissions, skills, allStudents] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, level: true },
    }),
    prisma.submission.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { lab: true },
    }),
    prisma.skillProgress.findMany({
      where: { userId },
      orderBy: { skill: "asc" },
    }),
    prisma.user.findMany({
      where: { role: UserRole.STUDENT },
      select: { id: true, name: true },
    }),
  ]);

  const rankingList = await Promise.all(
    allStudents.map(async (student) => {
      const studentScores = await prisma.submission.findMany({
        where: { userId: student.id },
        select: { score: true },
      });
      return {
        userId: student.id,
        name: student.name,
        averageScore: average(studentScores.map((item) => item.score)),
      };
    }),
  );

  const sortedRanking = rankingList.sort((a, b) => b.averageScore - a.averageScore);
  const position = Math.max(1, sortedRanking.findIndex((item) => item.userId === userId) + 1);
  const averageScore = average(submissions.map((item) => item.score));

  const items = [
    {
      id: "student-performance",
      title: "Моя успеваемость",
      description:
        "Понятный личный отчёт: какие лабораторные уже сданы, какие оценки получены и какой средний балл у студента сейчас.",
      filename: "moya-uspevaemost.xlsx",
      rowsCount: Math.max(submissions.length, 1),
      size: "Excel-отчёт",
      tags: ["личный отчёт", "оценки", "успеваемость"],
      downloadHref: "/api/datasets/student-performance",
      downloadLabel: "Скачать Excel",
      secondaryHref: "/progress",
      secondaryLabel: "Открыть прогресс",
      audience: "student" as const,
    },
    {
      id: "student-ranking",
      title: "Мой рейтинг среди студентов",
      description: `Сводка по текущей позиции в рейтинге. Сейчас вы занимаете ${position} место из ${sortedRanking.length}, средний балл — ${averageScore}%.`,
      filename: "moi-reiting.xlsx",
      rowsCount: sortedRanking.length,
      size: "Excel-отчёт",
      tags: ["рейтинг", "сравнение", "группа"],
      downloadHref: "/api/datasets/student-ranking",
      downloadLabel: "Скачать Excel",
      secondaryHref: "/dashboard",
      secondaryLabel: "Открыть кабинет",
      audience: "student" as const,
    },
    {
      id: "student-level",
      title: "Мой уровень и навыки",
      description: `${profile?.name ?? "Студент"} может посмотреть текущий уровень обучения и освоение ключевых навыков по аналитике данных и ИИ.`,
      filename: "moi-uroven.xlsx",
      rowsCount: Math.max(skills.length, 1),
      size: "Excel-отчёт",
      tags: ["уровень", "навыки", "личный прогресс"],
      downloadHref: "/api/datasets/student-level",
      downloadLabel: "Скачать Excel",
      secondaryHref: "/profile",
      secondaryLabel: "Открыть профиль",
      audience: "student" as const,
    },
  ];

  return items.filter((item) => matchesQuery(q, [item.title, item.description, ...item.tags]));
}

export async function getDatasetsForUser(userId: string, role: UserRole, q?: string) {
  if (role === UserRole.STUDENT) {
    return getStudentDatasetCards(userId, q);
  }

  const datasets = await prisma.dataset.findMany({
    orderBy: [{ createdAt: "asc" }, { title: "asc" }],
  });

  return datasets
    .filter((dataset) => matchesQuery(q, [dataset.title, dataset.description, dataset.filename, dataset.tags]))
    .map((dataset) => ({
      ...dataset,
      tags: parseJsonArray(dataset.tags),
      downloadHref: `/api/datasets/${dataset.id}`,
      downloadLabel: "Скачать Excel",
      secondaryHref: `/labs?q=${encodeURIComponent(dataset.title)}`,
      secondaryLabel: "Найти лабораторную",
      audience: "teacher" as const,
    }));
}

type DatasetDownload = {
  filename: string;
  content: ArrayBuffer;
  mimeType: string;
};

export async function getDatasetDownload(userId: string, role: UserRole, datasetId: string): Promise<DatasetDownload | null> {
  if (role !== UserRole.STUDENT) {
    const dataset = await prisma.dataset.findUnique({ where: { id: datasetId } });
    if (!dataset) return null;

    const filePath = resolveDatasetFilePath(dataset.filename);
    if (!filePath) return null;

    let content: string;

    try {
      content = await readFile(filePath, "utf8");
    } catch {
      return null;
    }

    const rows = parseCsvToRows(content);

    return {
      filename: dataset.filename.replace(/\.csv$/i, ".xlsx"),
      content: buildExcelBuffer(rows, "Датасет"),
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  }

  const [user, skills, submissions, allStudents] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, level: true },
    }),
    prisma.skillProgress.findMany({
      where: { userId },
      orderBy: { skill: "asc" },
    }),
    prisma.submission.findMany({
      where: { userId },
      include: { lab: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { role: UserRole.STUDENT },
      select: { id: true, name: true },
    }),
  ]);

  const ranking = await Promise.all(
    allStudents.map(async (student) => {
      const scores = await prisma.submission.findMany({
        where: { userId: student.id },
        select: { score: true },
      });
      return {
        id: student.id,
        name: student.name,
        averageScore: average(scores.map((item) => item.score)),
      };
    }),
  );

  const sorted = ranking.sort((a, b) => b.averageScore - a.averageScore);
  const currentPosition = Math.max(1, sorted.findIndex((item) => item.id === userId) + 1);
  const myAverage = average(submissions.map((item) => item.score));

  if (datasetId === "student-performance") {
    const rows = submissions.length
      ? submissions.map((submission, index) => ({
          "№": index + 1,
          Студент: user?.name ?? "Студент",
          Лабораторная: submission.lab.title,
          Балл: submission.score,
          Статус: "Проверено",
          Комментарий: "Результат сохранён в личном кабинете",
        }))
      : [
          {
            "№": 1,
            Студент: user?.name ?? "Студент",
            Лабораторная: "Пока нет отправленных лабораторных",
            Балл: 0,
            Статус: "Нет данных",
            Комментарий: "Когда вы отправите первую работу, здесь появится отчёт",
          },
        ];

    return {
      filename: "moya-uspevaemost.xlsx",
      content: buildExcelBuffer(rows, "Успеваемость"),
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  }

  if (datasetId === "student-ranking") {
    return {
      filename: "moi-reiting.xlsx",
      content: buildExcelBuffer(
        [
          {
            Студент: user?.name ?? "Студент",
            "Место в рейтинге": currentPosition,
            "Всего студентов": sorted.length,
            "Средний балл": myAverage,
            Пояснение: "Чем выше средний балл по лабораторным, тем выше позиция в рейтинге.",
          },
        ],
        "Рейтинг",
      ),
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  }

  if (datasetId === "student-level") {
    const rows = skills.length
      ? skills.map((skill, index) => ({
          "№": index + 1,
          Студент: user?.name ?? "Студент",
          Уровень: user?.level ?? "Начальный",
          Навык: getSkillLabel(skill.skill),
          Освоение: `${skill.value}%`,
        }))
      : [
          {
            "№": 1,
            Студент: user?.name ?? "Студент",
            Уровень: user?.level ?? "Начальный",
            Навык: "Навыки ещё не рассчитаны",
            Освоение: "0%",
          },
        ];

    return {
      filename: "moi-uroven.xlsx",
      content: buildExcelBuffer(rows, "Навыки"),
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  }

  return null;
}

export async function getLabDatasetCsv(datasetId: string) {
  const dataset = await prisma.dataset.findUnique({ where: { id: datasetId } });
  if (!dataset) return null;

  const filePath = resolveDatasetFilePath(dataset.filename);
  if (!filePath) return null;

  let content: string;

  try {
    content = await readFile(filePath, "utf8");
  } catch {
    return null;
  }

  return {
    filename: dataset.filename,
    content: `\uFEFF${content}`,
    mimeType: "text/csv; charset=utf-8",
  };
}

export async function getMentorMessages(userId: string) {
  return prisma.mentorMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
}

export async function getProfileData(userId: string) {
  const [user, lessonCount, labSubmissions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        level: true,
        createdAt: true,
      },
    }),
    prisma.progress.count({
      where: { userId, type: "LESSON", completed: true },
    }),
    prisma.submission.findMany({
      where: { userId },
      select: { score: true },
    }),
  ]);

  if (!user) return null;

  return {
    ...user,
    completedLessons: lessonCount,
    completedLabs: labSubmissions.length,
    averageScore: average(labSubmissions.map((item) => item.score)),
  };
}

export async function getDashboardData(userId: string) {
  const [user, courseProgress, labSubmissions, skillProgress, mentorMessages, labs, lessonProgress] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, role: true, level: true },
      }),
      prisma.progress.findMany({
        where: { userId, type: "COURSE" },
      }),
      prisma.submission.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: { lab: true },
      }),
      prisma.skillProgress.findMany({
        where: { userId },
      }),
      prisma.mentorMessage.findMany({
        where: { userId, role: "AI" },
        orderBy: { createdAt: "desc" },
      }),
      prisma.lab.findMany({
        take: 4,
        orderBy: { deadline: "asc" },
        include: { dataset: true },
      }),
      prisma.progress.findMany({
        where: { userId, type: "LESSON", completed: true },
        include: {
          lesson: {
            select: { estimatedMinutes: true },
          },
        },
      }),
    ]);

  const lessonsCompleted = lessonProgress.length;
  const averageScore = average(labSubmissions.map((item) => item.score));
  const overallProgress = average(courseProgress.map((item) => item.value));
  const activity = buildDailyActivity([
    ...courseProgress.map((item) => ({ date: item.updatedAt, weight: 1 })),
    ...lessonProgress.map((item) => ({ date: item.updatedAt, weight: 1 })),
    ...labSubmissions.map((item) => ({ date: item.createdAt, weight: 2 })),
    ...mentorMessages.map((item) => ({ date: item.createdAt, weight: 1 })),
  ]);
  const submittedLabIds = new Set(labSubmissions.map((item) => item.labId));
  const pendingLabs = labs
    .filter((lab) => !submittedLabIds.has(lab.id))
    .map((lab) => ({ title: lab.title, difficulty: lab.difficulty }));
  const lessonMinutes = lessonProgress.reduce((sum, item) => sum + (item.lesson?.estimatedMinutes ?? 0), 0);

  return {
    userName: user?.name || "Студент",
    userLevel: user?.level || "Beginner",
    stats: {
      lessonsCompleted,
      labsCompleted: labSubmissions.length,
      averageScore,
      mentorTips: mentorMessages.length,
      overallProgress,
    },
    activity,
    skillProgress,
    recentLabs: labs.map((lab) => ({
      id: lab.id,
      title: lab.title,
      status: labSubmissions.find((item) => item.labId === lab.id) ? "Отправлено" : "Открыто",
      deadline: lab.deadline,
    })),
    mentorFeedback: mentorMessages.slice(0, 3).map((item) => ({
      ...item,
      previewText: getMentorPlainText(item.content),
    })),
    recommendedStep: buildRecommendedNextStep(skillProgress, pendingLabs),
    timeSpent: buildTimeSpentSummary({
      lessonMinutes,
      submittedLabsCount: labSubmissions.length,
      mentorRepliesCount: mentorMessages.length,
    }),
  };
}

export async function getProgressPageData(userId: string) {
  const [skills, lessons, labs, courseProgress, submittedLabProgress, availableLabs] = await Promise.all([
    prisma.skillProgress.findMany({
      where: { userId },
    }),
    prisma.progress.findMany({
      where: { userId, type: "LESSON" },
      include: { lesson: { include: { course: true } } },
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),
    prisma.submission.findMany({
      where: { userId },
      include: { lab: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.progress.findMany({
      where: { userId, type: "COURSE" },
    }),
    prisma.progress.findMany({
      where: { userId, type: "LAB", completed: true },
      select: { labId: true },
    }),
    prisma.lab.findMany({
      orderBy: { deadline: "asc" },
      take: 4,
      select: { id: true, title: true, difficulty: true },
    }),
  ]);

  const weakTopics = getWeakSkills(skills);
  const submittedLabIds = new Set(submittedLabProgress.flatMap((item) => (item.labId ? [item.labId] : [])));
  const pendingLabs = availableLabs.filter((lab) => !submittedLabIds.has(lab.id));

  return {
    overallProgress: average(courseProgress.map((item) => item.value)),
    skills,
    lessons,
    labs,
    weakTopics,
    activity: buildWeeklyActivity([
      ...courseProgress.map((item) => ({ date: item.updatedAt, weight: 1 })),
      ...lessons.map((item) => ({ date: item.updatedAt, weight: 1 })),
      ...labs.map((item) => ({ date: item.createdAt, weight: 2 })),
    ]),
    nextSteps: buildNextSteps(skills, pendingLabs),
  };
}

export async function getTeacherAnalytics() {
  const [students, submissions, completedLabs, skills, courses, datasets, submissionMetrics] =
    await Promise.all([
      prisma.user.findMany({
        where: { role: UserRole.STUDENT },
        select: { id: true, name: true, email: true, level: true, createdAt: true },
      }),
      prisma.submission.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true } },
          lab: { select: { title: true } },
        },
        take: 10,
      }),
      prisma.progress.count({
        where: { type: "LAB", completed: true },
      }),
      prisma.skillProgress.findMany(),
      prisma.course.findMany({ orderBy: { title: "asc" } }),
      prisma.dataset.findMany({ orderBy: { title: "asc" } }),
      prisma.submission.aggregate({
        _avg: { score: true },
        _count: { _all: true },
      }),
    ]);

  const groupedSkills = skills.reduce<Record<string, number[]>>((acc, item) => {
    acc[item.skill] ||= [];
    acc[item.skill].push(item.value);
    return acc;
  }, {});

  const weakTopics = Object.entries(groupedSkills)
    .map(([skill, values]) => ({ skill, value: average(values) }))
    .filter((item) => item.value < 55)
    .sort((a, b) => a.value - b.value);

  return {
    studentsCount: students.length,
    submissionsCount: submissionMetrics._count._all,
    averageScore: Math.round(submissionMetrics._avg.score ?? 0),
    completedLabs,
    students,
    submissions: submissions.map((submission) => ({
      id: submission.id,
      studentName: submission.user.name,
      labTitle: submission.lab.title,
      score: submission.score,
      status: "Проверено",
      createdAt: submission.createdAt,
    })),
    weakTopics,
    chartData: submissions
      .slice()
      .reverse()
      .map((submission, index) => ({
        name: `Работа ${index + 1}`,
        score: submission.score,
      })),
    courses,
    datasets: datasets.map((dataset) => ({
      ...dataset,
      tags: parseJsonArray(dataset.tags),
    })),
  };
}

export async function getAdminDashboardData() {
  const [students, teachers, submissions, completedLessons, completedLabs] = await Promise.all([
    prisma.user.findMany({
      where: { role: UserRole.STUDENT },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        level: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { role: UserRole.TEACHER },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        level: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.submission.findMany({
      select: {
        userId: true,
        score: true,
      },
    }),
    prisma.progress.findMany({
      where: { type: "LESSON", completed: true },
      select: { userId: true },
    }),
    prisma.progress.count({
      where: { type: "LAB", completed: true },
    }),
  ]);

  const lessonCountByUser = completedLessons.reduce<Record<string, number>>((acc, item) => {
    acc[item.userId] = (acc[item.userId] ?? 0) + 1;
    return acc;
  }, {});

  const submissionsByUser = submissions.reduce<Record<string, number[]>>((acc, item) => {
    acc[item.userId] ||= [];
    acc[item.userId].push(item.score);
    return acc;
  }, {});

  const studentRows = students.map((student) => {
    const studentScores = submissionsByUser[student.id] ?? [];

    return {
      ...student,
      completedLessons: lessonCountByUser[student.id] ?? 0,
      submittedLabs: studentScores.length,
      averageScore: average(studentScores),
    };
  });

  const pendingTeachers = teachers.filter((teacher) => teacher.status === UserStatus.PENDING);
  const approvedTeachersCount = teachers.filter((teacher) => teacher.status === UserStatus.APPROVED).length;

  return {
    stats: {
      studentsCount: studentRows.length,
      approvedTeachersCount,
      pendingTeachersCount: pendingTeachers.length,
      averageScore: average(submissions.map((item) => item.score)),
      completedLessonsCount: completedLessons.length,
      completedLabsCount: completedLabs,
    },
    pendingTeachers,
    studentRows,
    users: [...teachers, ...studentRows].sort(
      (left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
    ),
  };
}

export async function getGlobalSearchResults(userId: string, role: UserRole, q?: string) {
  const query = q?.trim() ?? "";
  if (!query) {
    return {
      query: "",
      courses: [],
      labs: [],
      datasets: [],
    };
  }

  const [courses, labs, datasets] = await Promise.all([
    getCoursesForUser(userId, query),
    getLabs(userId, query),
    getDatasetsForUser(userId, role, query),
  ]);

  return {
    query,
    courses: courses.slice(0, 6),
    labs: labs.slice(0, 6),
    datasets: datasets.slice(0, 6),
  };
}

export async function getNotificationsForUser(userId: string, role: UserRole) {
  if (role === UserRole.ADMIN) {
    const [pendingTeachers, totalStudents] = await Promise.all([
      prisma.user.findMany({
        where: { role: UserRole.TEACHER, status: UserStatus.PENDING },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, email: true },
      }),
      prisma.user.count({ where: { role: UserRole.STUDENT } }),
    ]);

    return [
      {
        id: "admin-students",
        title: "Сводка по обучающимся",
        description: `Сейчас на платформе ${totalStudents} студентов. Полная статистика и управление пользователями доступны в админ-панели.`,
        href: "/admin",
      },
      ...pendingTeachers.map((teacher) => ({
        id: teacher.id,
        title: `Новая заявка преподавателя: ${teacher.name}`,
        description: `${teacher.email} ожидает одобрения администратора.`,
        href: "/admin",
      })),
    ];
  }

  if (role === UserRole.TEACHER) {
    const [recentSubmissions, weakSkills, totalStudents] = await Promise.all([
      prisma.submission.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          user: { select: { name: true } },
          lab: { select: { title: true } },
        },
      }),
      prisma.skillProgress.findMany(),
      prisma.user.count({ where: { role: UserRole.STUDENT } }),
    ]);

    const groupedSkills = weakSkills.reduce<Record<string, number[]>>((acc, item) => {
      acc[item.skill] ||= [];
      acc[item.skill].push(item.value);
      return acc;
    }, {});

    const weakest = Object.entries(groupedSkills)
      .map(([skill, values]) => ({ skill: getSkillLabel(skill), value: average(values) }))
      .filter((item) => item.value < 55)
      .sort((a, b) => a.value - b.value)
      .slice(0, 3);

    return [
      {
        id: "teacher-students",
        title: "Состав группы обновлён",
        description: `Сейчас на платформе ${totalStudents} студентов. Проверьте общую динамику и слабые темы группы.`,
        href: "/teacher",
      },
      ...recentSubmissions.map((submission) => ({
        id: submission.id,
        title: `Новая лабораторная: ${submission.lab.title}`,
        description: `${submission.user.name} отправил(а) решение. Текущий автопроверочный балл: ${submission.score}.`,
        href: "/teacher",
      })),
      ...weakest.map((topic, index) => ({
        id: `weak-topic-${index}`,
        title: `Зона внимания: ${topic.skill}`,
        description: `Среднее освоение по группе — ${topic.value}%. Стоит добавить разбор и практику по этой теме.`,
        href: "/teacher",
      })),
    ];
  }

  const [mentorMessages, upcomingLabs, weakSkills] = await Promise.all([
    prisma.mentorMessage.findMany({
      where: { userId, role: "AI" },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.lab.findMany({
      take: 3,
      orderBy: { deadline: "asc" },
      select: { id: true, title: true, deadline: true },
    }),
    prisma.skillProgress.findMany({
      where: { userId },
      orderBy: { value: "asc" },
      take: 2,
    }),
  ]);

  return [
    ...mentorMessages.map((message) => ({
      id: message.id,
      title: "Совет ИИ-наставника",
      description: getMentorPlainText(message.content),
      href: "/mentor",
    })),
    ...upcomingLabs.map((lab) => ({
      id: lab.id,
      title: `Скоро дедлайн: ${lab.title}`,
      description: `Проверьте лабораторную и отправьте решение до назначенной даты.`,
      href: `/labs/${lab.id}`,
    })),
    ...weakSkills.map((skill, index) => ({
      id: `skill-${index}`,
      title: `Нужно подтянуть: ${getSkillLabel(skill.skill)}`,
      description: `Текущее освоение по этому навыку — ${skill.value}%. Рекомендуется повторить уроки и пройти практику.`,
      href: "/progress",
    })),
  ];
}

function translateLabStatus(status: string, locale: AppLocale) {
  if (locale === "ru") return status;
  if (status === "Открыто") return "Open";
  if (status === "Проверено") return "Reviewed";
  if (status === "Отправлено") return "Submitted";
  return status;
}

function translateStudentDatasetCard(
  item: {
    id: string;
    title: string;
    description: string;
    filename: string;
    rowsCount: number;
    size: string;
    tags: string[];
    downloadHref: string;
    downloadLabel: string;
    secondaryHref?: string;
    secondaryLabel?: string;
    audience: "student" | "teacher";
  },
  locale: AppLocale,
) {
  if (locale === "ru") return item;

  if (item.id === "student-performance") {
    return {
      ...item,
      title: "My performance",
      description:
        "A clear personal report showing which labs are already submitted, what scores were received, and what the current average score is.",
      size: "Excel report",
      tags: ["personal report", "scores", "performance"],
      downloadLabel: "Download Excel",
      secondaryLabel: "Open progress",
    };
  }

  if (item.id === "student-ranking") {
    return {
      ...item,
      title: "My ranking among students",
      description: item.description
        .replace("Сводка по текущей позиции в рейтинге. Сейчас вы занимаете", "Current ranking summary. You are now in")
        .replace("место из", "place out of")
        .replace("средний балл —", "average score is"),
      size: "Excel report",
      tags: ["ranking", "comparison", "group"],
      downloadLabel: "Download Excel",
      secondaryLabel: "Open dashboard",
    };
  }

  if (item.id === "student-level") {
    return {
      ...item,
      title: "My level and skills",
      description: "A personal report with the current learning level and mastery of key data analytics and AI skills.",
      size: "Excel report",
      tags: ["level", "skills", "personal progress"],
      downloadLabel: "Download Excel",
      secondaryLabel: "Open profile",
    };
  }

  return item;
}

export async function getDatasetsForUserLocalized(
  userId: string,
  role: UserRole,
  q?: string,
  locale: AppLocale = "ru",
) {
  const items = await getDatasetsForUser(userId, role, q);

  return items.map((item) => {
    if (role === UserRole.STUDENT) {
      return translateStudentDatasetCard(item, locale);
    }

    if (locale === "ru") return item;

    return {
      ...item,
      downloadLabel: "Download Excel",
      secondaryLabel: item.secondaryLabel ? "Find lab" : item.secondaryLabel,
      size: item.size === "Excel-отчёт" ? "Excel report" : item.size,
    };
  });
}

export async function getLabsLocalized(userId: string, q?: string, locale: AppLocale = "ru") {
  const labs = await getLabs(userId, q);
  return labs.map((lab) => ({
    ...lab,
    status: translateLabStatus(lab.status, locale),
  }));
}

export async function getGlobalSearchResultsLocalized(
  userId: string,
  role: UserRole,
  q?: string,
  locale: AppLocale = "ru",
) {
  const query = q?.trim() ?? "";
  if (!query) {
    return {
      query: "",
      courses: [],
      labs: [],
      datasets: [],
    };
  }

  const [courses, labs, datasets] = await Promise.all([
    getCoursesForUser(userId, query),
    getLabsLocalized(userId, query, locale),
    getDatasetsForUserLocalized(userId, role, query, locale),
  ]);

  return {
    query,
    courses: courses.slice(0, 6),
    labs: labs.slice(0, 6),
    datasets: datasets.slice(0, 6),
  };
}

export async function getDashboardDataLocalized(userId: string, locale: AppLocale = "ru") {
  const [user, skillProgress, courseProgress, lessonProgress, labSubmissions, labs, mentorMessages] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, level: true },
      }),
      prisma.skillProgress.findMany({
        where: { userId },
        orderBy: { skill: "asc" },
      }),
      prisma.progress.findMany({
        where: { userId, type: "COURSE" },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.progress.findMany({
        where: { userId, type: "LESSON", completed: true },
        include: { lesson: true },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.submission.findMany({
        where: { userId },
        include: { lab: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.lab.findMany({
        take: 4,
        orderBy: { deadline: "asc" },
      }),
      prisma.mentorMessage.findMany({
        where: { userId, role: "AI" },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
    ]);

  const lessonsCompleted = lessonProgress.length;
  const averageScore = average(labSubmissions.map((item) => item.score));
  const overallProgress = average(courseProgress.map((item) => item.value));
  const activity = buildDailyActivity(
    [
      ...courseProgress.map((item) => ({ date: item.updatedAt, weight: 1 })),
      ...lessonProgress.map((item) => ({ date: item.updatedAt, weight: 1 })),
      ...labSubmissions.map((item) => ({ date: item.createdAt, weight: 2 })),
      ...mentorMessages.map((item) => ({ date: item.createdAt, weight: 1 })),
    ],
    7,
    locale,
  );
  const submittedLabIds = new Set(labSubmissions.map((item) => item.labId));
  const pendingLabs = labs
    .filter((lab) => !submittedLabIds.has(lab.id))
    .map((lab) => ({ title: lab.title, difficulty: lab.difficulty }));
  const lessonMinutes = lessonProgress.reduce((sum, item) => sum + (item.lesson?.estimatedMinutes ?? 0), 0);

  return {
    userName: user?.name || (locale === "en" ? "Student" : "Студент"),
    userLevel: user?.level || "Beginner",
    stats: {
      lessonsCompleted,
      labsCompleted: labSubmissions.length,
      averageScore,
      mentorTips: mentorMessages.length,
      overallProgress,
    },
    activity,
    skillProgress,
    recentLabs: labs.map((lab) => ({
      id: lab.id,
      title: lab.title,
      status: submittedLabIds.has(lab.id) ? (locale === "en" ? "Submitted" : "Отправлено") : locale === "en" ? "Open" : "Открыто",
      deadline: lab.deadline,
    })),
    mentorFeedback: mentorMessages.slice(0, 3).map((item) => ({
      ...item,
      previewText: getMentorPlainText(item.content),
    })),
    recommendedStep: buildRecommendedNextStep(skillProgress, pendingLabs, locale),
    timeSpent: buildTimeSpentSummary(
      {
        lessonMinutes,
        submittedLabsCount: labSubmissions.length,
        mentorRepliesCount: mentorMessages.length,
      },
      locale,
    ),
  };
}

export async function getProgressPageDataLocalized(userId: string, locale: AppLocale = "ru") {
  const data = await getProgressPageData(userId);
  const translateStep = (step: string) => {
    if (locale === "ru") return step;
    return step
      .replace(/^Повторить тему «/, 'Review the topic "')
      .replace(/^Завершить кейс «/, 'Complete the lab "')
      .replace(/» и закрыть пробелы в теории\.$/, '" and close the theory gaps.')
      .replace(/» и оформить выводы по результатам анализа\.$/, '" and write up the conclusions from your analysis.')
      .replace(
        "Продолжить следующий модуль курса и закрепить материал новой практической работой.",
        "Continue to the next course module and reinforce the material with a new practical task.",
      );
  };

  return {
    ...data,
    activity: buildWeeklyActivity(
      [
        ...data.lessons.map((item) => ({ date: item.updatedAt, weight: 1 })),
        ...data.labs.map((item) => ({ date: item.createdAt, weight: 2 })),
      ],
      5,
      locale,
    ),
    nextSteps: data.nextSteps.map(translateStep),
  };
}

export async function getNotificationsForUserLocalized(
  userId: string,
  role: UserRole,
  locale: AppLocale = "ru",
) {
  const notifications = await getNotificationsForUser(userId, role);

  if (locale === "ru") return notifications;

  return notifications.map((item) => {
    if (item.href === "/admin" && item.id === "admin-students") {
      return {
        ...item,
        title: "Learner summary",
        description: item.description
          .replace("Сейчас на платформе", "There are currently")
          .replace(
            "студентов. Полная статистика и управление пользователями доступны в админ-панели.",
            "students on the platform. Full statistics and user management are available in the admin panel.",
          ),
      };
    }
    if (item.href === "/admin" && item.title.startsWith("Новая заявка преподавателя:")) {
      return {
        ...item,
        title: item.title.replace("Новая заявка преподавателя:", "New teacher request:"),
        description: item.description.replace("ожидает одобрения администратора.", "is waiting for administrator approval."),
      };
    }
    if (item.href === "/mentor" && item.title === "Совет ИИ-наставника") {
      return { ...item, title: "AI mentor tip" };
    }
    if (item.href === "/teacher" && item.id === "teacher-students") {
      return {
        ...item,
        title: "Group roster updated",
        description: item.description.replace("Сейчас на платформе", "There are currently").replace("студентов. Проверьте общую динамику и слабые темы группы.", "students on the platform. Review overall dynamics and weak group topics."),
      };
    }
    if (item.href.startsWith("/labs/") && item.title.startsWith("Скоро дедлайн:")) {
      return {
        ...item,
        title: item.title.replace("Скоро дедлайн:", "Deadline soon:"),
        description: "Check the lab and submit your solution before the due date.",
      };
    }
    if (item.href === "/progress" && item.title.startsWith("Нужно подтянуть:")) {
      return {
        ...item,
        title: item.title.replace("Нужно подтянуть:", "Needs improvement:"),
        description: item.description
          .replace("Текущее освоение по этому навыку —", "Current mastery of this skill is")
          .replace("Рекомендуется повторить уроки и пройти практику.", "It is recommended to review the lessons and complete more practice."),
      };
    }
    return item;
  });
}
