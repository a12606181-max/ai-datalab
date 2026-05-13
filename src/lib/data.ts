import { UserRole } from "@prisma/client";
import { readFile } from "node:fs/promises";
import path from "node:path";
import * as XLSX from "xlsx";

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

  const progress = await prisma.progress.findFirst({
    where: {
      userId,
      lessonId,
      type: "LESSON",
      completed: true,
    },
  });

  return {
    ...lesson,
    theorySections: lesson.content.split("\n\n").filter(Boolean),
    quizzes: lesson.quizzes.map((quiz) => ({
      ...quiz,
      options: parseJsonArray(quiz.options),
    })),
    completed: Boolean(progress),
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
  if (role === UserRole.TEACHER) {
    const dataset = await prisma.dataset.findUnique({ where: { id: datasetId } });
    if (!dataset) return null;

    const filePath = path.join(process.cwd(), "public", "datasets", dataset.filename);
    const content = await readFile(filePath, "utf8");
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

  const filePath = path.join(process.cwd(), "public", "datasets", dataset.filename);
  const content = await readFile(filePath, "utf8");

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
  const [
    user,
    courseProgress,
    lessonsCompleted,
    labSubmissions,
    skillProgress,
    mentorMessages,
    labs,
    activityProgress,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, role: true, level: true },
    }),
    prisma.progress.findMany({
      where: { userId, type: "COURSE" },
    }),
    prisma.progress.count({
      where: { userId, type: "LESSON", completed: true },
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
      take: 3,
    }),
    prisma.lab.findMany({
      take: 4,
      orderBy: { deadline: "asc" },
      include: { dataset: true },
    }),
    prisma.progress.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 7,
    }),
  ]);

  const averageScore = average(labSubmissions.map((item) => item.score));
  const overallProgress = average(courseProgress.map((item) => item.value)) || 68;

  const activity = Array.from({ length: 7 }).map((_, index) => {
    const item = activityProgress[index];
    return {
      name: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"][index],
      value: item?.value ?? 24 + index * 7,
    };
  });

  return {
    userName: user?.name || "Студент",
    userLevel: user?.level || "Beginner",
    stats: {
      lessonsCompleted,
      labsCompleted: labSubmissions.length,
      averageScore,
      mentorTips: mentorMessages.length * 12 || 36,
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
    mentorFeedback: mentorMessages,
    recommendedStep:
      skillProgress.find((item) => item.skill === "Machine Learning")?.value &&
      skillProgress.find((item) => item.skill === "Machine Learning")!.value < 50
        ? "Повторите тему признаков и попробуйте ещё раз лабораторную по прогнозу академической задолженности."
        : "Продолжайте курс по визуализации и добавляйте более точные выводы к каждому графику.",
    timeSpent: [
      { label: "Уроки по Python", hours: "4 ч 20 мин", progress: 76 },
      { label: "Анализ успеваемости", hours: "3 ч 10 мин", progress: 58 },
      { label: "Практика по ИИ", hours: "2 ч 40 мин", progress: 41 },
    ],
  };
}

export async function getProgressPageData(userId: string) {
  const [skills, lessons, labs, courseProgress] = await Promise.all([
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
  ]);

  const weakTopics = skills.filter((item) => item.value < 50);

  return {
    overallProgress: average(courseProgress.map((item) => item.value)) || 0,
    skills,
    lessons,
    labs,
    weakTopics,
    activity: [
      { week: "Неделя 1", value: 22 },
      { week: "Неделя 2", value: 35 },
      { week: "Неделя 3", value: 49 },
      { week: "Неделя 4", value: 63 },
      { week: "Неделя 5", value: 70 },
    ],
    nextSteps: [
      "Повторить тему признаков и предобработки данных.",
      "Завершить лабораторную по визуализации данных.",
      "Сравнить два подхода к итоговому ML-кейсу.",
    ],
  };
}

export async function getTeacherAnalytics() {
  const [students, submissions, completedLabs, skills, courses, datasets] = await Promise.all([
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
    submissionsCount: submissions.length,
    averageScore: average(submissions.map((item) => item.score)),
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
      description: message.content,
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
