import { MentorChat } from "@/components/mentor/mentor-chat";
import { requireUser } from "@/lib/auth";
import { getMentorMessages } from "@/lib/data";
import { getLocale } from "@/lib/locale-server";

export default async function MentorPage() {
  const user = await requireUser();
  const locale = await getLocale();
  const messages = await getMentorMessages(user.id);

  const text =
    locale === "en"
      ? {
          eyebrow: "AI mentor",
          title: "AI mentor",
          description:
            "The mentor answers questions about AIDataLab materials, explains course topics in simple language, recommends suitable lessons, labs, and courses from the platform, and also gives a personal review of your progress across lessons, labs, and skills.",
        }
      : {
          eyebrow: "ИИ-наставник",
          title: "ИИ-наставник",
          description:
            "Наставник отвечает по материалам AI DataLab, объясняет темы курсов простыми словами, рекомендует подходящие уроки, лабораторные и курсы с платформы, а также делает персональный разбор вашего прогресса по урокам, лабораторным и навыкам.",
        };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-fuchsia-300/80">{text.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">{text.title}</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-white/55">{text.description}</p>
      </div>
      <MentorChat messages={messages} locale={locale} />
    </div>
  );
}
