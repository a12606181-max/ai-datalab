export const LOCALE_COOKIE = "aidatalab_locale";
export const SUPPORTED_LOCALES = ["ru", "en"] as const;

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export function isSupportedLocale(value: string): value is AppLocale {
  return SUPPORTED_LOCALES.includes(value as AppLocale);
}

export function getLocaleMessages(locale: AppLocale) {
  if (locale === "en") {
    return {
      common: {
        appSubtitle: "Educational platform",
        student: "Student",
        teacher: "Teacher",
        beginner: "Beginner",
        intermediate: "Intermediate",
        advanced: "Advanced",
        expert: "Expert",
        open: "Open",
      },
      nav: {
        dashboard: "Dashboard",
        courses: "Courses",
        labs: "Labs",
        datasets: "Datasets",
        mentor: "AI Mentor",
        progress: "Progress",
        profile: "Profile",
        settings: "Settings",
        teacher: "Teacher Panel",
        admin: "Admin Panel",
      },
      topbar: {
        filterSearchPlaceholder: "Find a course, lab, or dataset...",
        globalSearchPlaceholder: "Find a lesson, course, lab, or dataset...",
        notificationsLabel: "Open notifications",
        notificationsTitle: "Notifications",
        logoutLabel: "Log out",
        searchLabel: "Search",
      },
      settings: {
        eyebrow: "Settings",
        title: "Settings",
        description: "Manage notifications, learning difficulty, and account preferences.",
        notifications: [
          "Notifications about new labs",
          "Deadline reminders",
          "AI mentor recommendations after submission review",
        ],
        difficultyTitle: "Learning difficulty",
        difficultyOptions: ["Adaptive", "Basic", "Intermediate", "Advanced"],
        languageTitle: "Interface language",
        languageOptions: {
          ru: "Russian",
          en: "English",
        },
        logout: "Log out of account",
        deleteAccount: "Delete account",
      },
      coursesPage: {
        eyebrow: "Courses",
        title: "Learning courses",
        description:
          "Choose a module for your level and move from basic data analytics to machine learning and AI in education.",
        emptyTitle: "No courses found",
        emptyDescription:
          "Try changing your search query or come back later when the instructor adds new modules.",
      },
      courseCard: {
        lessons: "lessons",
        progress: "Progress",
        openCourse: "Open course",
      },
      course: {
        eyebrow: "Course",
        continue: "Continue learning",
        emptyTitle: "Course is being prepared for publishing",
        emptyDescription:
          "The description is already available, but lessons have not been added yet. The continue button will appear here after the content is filled in.",
        statsTitle: "Course mini-stats",
        progressLabel: "Course progress",
        lessonsLabel: "Lessons",
        difficultyLabel: "Difficulty",
        lessonListTitle: "Lesson list",
        relatedLabsTitle: "Related labs",
        relatedLabsEmptyTitle: "Practice for this course has not been assigned yet",
        relatedLabsEmptyDescription:
          "When the instructor links labs, practice cases for this topic will appear here.",
      },
    };
  }

  return {
    common: {
      appSubtitle: "\u041e\u0431\u0440\u0430\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c\u043d\u0430\u044f \u043f\u043b\u0430\u0442\u0444\u043e\u0440\u043c\u0430",
      student: "\u0421\u0442\u0443\u0434\u0435\u043d\u0442",
      teacher: "\u041f\u0440\u0435\u043f\u043e\u0434\u0430\u0432\u0430\u0442\u0435\u043b\u044c",
      beginner: "\u0411\u0430\u0437\u043e\u0432\u044b\u0439",
      intermediate: "\u0421\u0440\u0435\u0434\u043d\u0438\u0439",
      advanced: "\u041f\u0440\u043e\u0434\u0432\u0438\u043d\u0443\u0442\u044b\u0439",
      expert: "\u042d\u043a\u0441\u043f\u0435\u0440\u0442",
      open: "\u041e\u0442\u043a\u0440\u044b\u0442\u043e",
    },
    nav: {
      dashboard: "\u041f\u0430\u043d\u0435\u043b\u044c",
      courses: "\u041a\u0443\u0440\u0441\u044b",
      labs: "\u041b\u0430\u0431\u043e\u0440\u0430\u0442\u043e\u0440\u043d\u044b\u0435",
      datasets: "\u0414\u0430\u0442\u0430\u0441\u0435\u0442\u044b",
      mentor: "\u0418\u0418-\u043d\u0430\u0441\u0442\u0430\u0432\u043d\u0438\u043a",
      progress: "\u041f\u0440\u043e\u0433\u0440\u0435\u0441\u0441",
      profile: "\u041f\u0440\u043e\u0444\u0438\u043b\u044c",
      settings: "\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438",
      teacher: "\u041f\u0430\u043d\u0435\u043b\u044c \u043f\u0440\u0435\u043f\u043e\u0434\u0430\u0432\u0430\u0442\u0435\u043b\u044f",
      admin: "\u041f\u0430\u043d\u0435\u043b\u044c \u0430\u0434\u043c\u0438\u043d\u0430",
    },
    topbar: {
      filterSearchPlaceholder:
        "\u041d\u0430\u0439\u0442\u0438 \u043a\u0443\u0440\u0441, \u043b\u0430\u0431\u043e\u0440\u0430\u0442\u043e\u0440\u043d\u0443\u044e \u0438\u043b\u0438 \u0434\u0430\u0442\u0430\u0441\u0435\u0442...",
      globalSearchPlaceholder:
        "\u041d\u0430\u0439\u0442\u0438 \u0443\u0440\u043e\u043a, \u043a\u0443\u0440\u0441, \u043b\u0430\u0431\u043e\u0440\u0430\u0442\u043e\u0440\u043d\u0443\u044e \u0438\u043b\u0438 \u043d\u0430\u0431\u043e\u0440 \u0434\u0430\u043d\u043d\u044b\u0445...",
      notificationsLabel: "\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u0443\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u044f",
      notificationsTitle: "\u0423\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u044f",
      logoutLabel: "\u0412\u044b\u0439\u0442\u0438",
      searchLabel: "\u041f\u043e\u0438\u0441\u043a",
    },
    settings: {
      eyebrow: "\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438",
      title: "\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438",
      description:
        "\u0423\u043f\u0440\u0430\u0432\u043b\u044f\u0439\u0442\u0435 \u0443\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u044f\u043c\u0438, \u0443\u0440\u043e\u0432\u043d\u0435\u043c \u0441\u043b\u043e\u0436\u043d\u043e\u0441\u0442\u0438 \u043e\u0431\u0443\u0447\u0435\u043d\u0438\u044f \u0438 \u043f\u0430\u0440\u0430\u043c\u0435\u0442\u0440\u0430\u043c\u0438 \u043a\u0430\u0431\u0438\u043d\u0435\u0442\u0430.",
      notifications: [
        "\u0423\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u044f \u043e \u043d\u043e\u0432\u044b\u0445 \u043b\u0430\u0431\u043e\u0440\u0430\u0442\u043e\u0440\u043d\u044b\u0445",
        "\u041d\u0430\u043f\u043e\u043c\u0438\u043d\u0430\u043d\u0438\u044f \u043e \u0434\u0435\u0434\u043b\u0430\u0439\u043d\u0430\u0445",
        "\u0420\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u0430\u0446\u0438\u0438 \u0418\u0418-\u043d\u0430\u0441\u0442\u0430\u0432\u043d\u0438\u043a\u0430 \u043f\u043e\u0441\u043b\u0435 \u043e\u0442\u043f\u0440\u0430\u0432\u043a\u0438 \u0440\u0435\u0448\u0435\u043d\u0438\u044f",
      ],
      difficultyTitle: "\u0421\u043b\u043e\u0436\u043d\u043e\u0441\u0442\u044c \u043e\u0431\u0443\u0447\u0435\u043d\u0438\u044f",
      difficultyOptions: [
        "\u0410\u0434\u0430\u043f\u0442\u0438\u0432\u043d\u0430\u044f",
        "\u0411\u0430\u0437\u043e\u0432\u0430\u044f",
        "\u0421\u0440\u0435\u0434\u043d\u044f\u044f",
        "\u041f\u0440\u043e\u0434\u0432\u0438\u043d\u0443\u0442\u0430\u044f",
      ],
      languageTitle: "\u042f\u0437\u044b\u043a \u0438\u043d\u0442\u0435\u0440\u0444\u0435\u0439\u0441\u0430",
      languageOptions: {
        ru: "\u0420\u0443\u0441\u0441\u043a\u0438\u0439",
        en: "\u0410\u043d\u0433\u043b\u0438\u0439\u0441\u043a\u0438\u0439",
      },
      logout: "\u0412\u044b\u0439\u0442\u0438 \u0438\u0437 \u0430\u043a\u043a\u0430\u0443\u043d\u0442\u0430",
      deleteAccount: "\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u0430\u043a\u043a\u0430\u0443\u043d\u0442",
    },
    coursesPage: {
      eyebrow: "\u041a\u0443\u0440\u0441\u044b",
      title: "\u0423\u0447\u0435\u0431\u043d\u044b\u0435 \u043a\u0443\u0440\u0441\u044b",
      description:
        "\u041f\u043e\u0434\u0431\u0435\u0440\u0438\u0442\u0435 \u043c\u043e\u0434\u0443\u043b\u044c \u043f\u043e\u0434 \u0441\u0432\u043e\u0439 \u0443\u0440\u043e\u0432\u0435\u043d\u044c \u0438 \u043f\u0435\u0440\u0435\u0445\u043e\u0434\u0438\u0442\u0435 \u043e\u0442 \u0431\u0430\u0437\u043e\u0432\u043e\u0439 \u0430\u043d\u0430\u043b\u0438\u0442\u0438\u043a\u0438 \u0434\u0430\u043d\u043d\u044b\u0445 \u043a \u043c\u0430\u0448\u0438\u043d\u043d\u043e\u043c\u0443 \u043e\u0431\u0443\u0447\u0435\u043d\u0438\u044e \u0438 AI \u0432 \u043e\u0431\u0440\u0430\u0437\u043e\u0432\u0430\u043d\u0438\u0438.",
      emptyTitle: "\u041a\u0443\u0440\u0441\u044b \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u044b",
      emptyDescription:
        "\u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0438\u0437\u043c\u0435\u043d\u0438\u0442\u044c \u043f\u043e\u0438\u0441\u043a\u043e\u0432\u044b\u0439 \u0437\u0430\u043f\u0440\u043e\u0441 \u0438\u043b\u0438 \u0432\u0435\u0440\u043d\u0438\u0442\u0435\u0441\u044c \u043f\u043e\u0437\u0436\u0435, \u043a\u043e\u0433\u0434\u0430 \u043f\u0440\u0435\u043f\u043e\u0434\u0430\u0432\u0430\u0442\u0435\u043b\u044c \u0434\u043e\u0431\u0430\u0432\u0438\u0442 \u043d\u043e\u0432\u044b\u0435 \u043c\u043e\u0434\u0443\u043b\u0438.",
    },
    courseCard: {
      lessons: "\u0443\u0440\u043e\u043a\u043e\u0432",
      progress: "\u041f\u0440\u043e\u0433\u0440\u0435\u0441\u0441",
      openCourse: "\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u043a\u0443\u0440\u0441",
    },
    course: {
      eyebrow: "\u041a\u0443\u0440\u0441",
      continue: "\u041f\u0440\u043e\u0434\u043e\u043b\u0436\u0438\u0442\u044c \u043e\u0431\u0443\u0447\u0435\u043d\u0438\u0435",
      emptyTitle: "\u041a\u0443\u0440\u0441 \u0433\u043e\u0442\u043e\u0432\u0438\u0442\u0441\u044f \u043a \u043f\u0443\u0431\u043b\u0438\u043a\u0430\u0446\u0438\u0438",
      emptyDescription:
        "\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435 \u0443\u0436\u0435 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u043e, \u043d\u043e \u0443\u0440\u043e\u043a\u0438 \u0435\u0449\u0451 \u043d\u0435 \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u044b. \u041f\u043e\u0441\u043b\u0435 \u043d\u0430\u043f\u043e\u043b\u043d\u0435\u043d\u0438\u044f \u0437\u0434\u0435\u0441\u044c \u043f\u043e\u044f\u0432\u0438\u0442\u0441\u044f \u043a\u043d\u043e\u043f\u043a\u0430 \u043f\u0440\u043e\u0434\u043e\u043b\u0436\u0435\u043d\u0438\u044f.",
      statsTitle: "\u041c\u0438\u043d\u0438-\u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043a\u0430 \u043a\u0443\u0440\u0441\u0430",
      progressLabel: "\u041f\u0440\u043e\u0433\u0440\u0435\u0441\u0441 \u043a\u0443\u0440\u0441\u0430",
      lessonsLabel: "\u0423\u0440\u043e\u043a\u043e\u0432",
      difficultyLabel: "\u0421\u043b\u043e\u0436\u043d\u043e\u0441\u0442\u044c",
      lessonListTitle: "\u0421\u043f\u0438\u0441\u043e\u043a \u0443\u0440\u043e\u043a\u043e\u0432",
      relatedLabsTitle: "\u0421\u0432\u044f\u0437\u0430\u043d\u043d\u044b\u0435 \u043b\u0430\u0431\u043e\u0440\u0430\u0442\u043e\u0440\u043d\u044b\u0435",
      relatedLabsEmptyTitle: "\u041f\u0440\u0430\u043a\u0442\u0438\u043a\u0430 \u0434\u043b\u044f \u043a\u0443\u0440\u0441\u0430 \u043f\u043e\u043a\u0430 \u043d\u0435 \u043d\u0430\u0437\u043d\u0430\u0447\u0435\u043d\u0430",
      relatedLabsEmptyDescription:
        "\u041a\u043e\u0433\u0434\u0430 \u043f\u0440\u0435\u043f\u043e\u0434\u0430\u0432\u0430\u0442\u0435\u043b\u044c \u043f\u0440\u0438\u0432\u044f\u0436\u0435\u0442 \u043b\u0430\u0431\u043e\u0440\u0430\u0442\u043e\u0440\u043d\u044b\u0435, \u0437\u0434\u0435\u0441\u044c \u043f\u043e\u044f\u0432\u044f\u0442\u0441\u044f \u043a\u0435\u0439\u0441\u044b \u0434\u043b\u044f \u0437\u0430\u043a\u0440\u0435\u043f\u043b\u0435\u043d\u0438\u044f \u0442\u0435\u043c\u044b.",
    },
  };
}
