import { MentorChat } from "@/components/mentor/mentor-chat";
import { requireUser } from "@/lib/auth";
import { getMentorMessages } from "@/lib/data";

export default async function MentorPage() {
  const user = await requireUser();
  const messages = await getMentorMessages(user.id);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-fuchsia-300/80">ИИ-наставник</p>
        <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">ИИ-наставник</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-white/55">
          Наставник объясняет термины, подсказывает направление анализа и помогает улучшать лабораторные работы без внешних API-ключей.
        </p>
      </div>
      <MentorChat messages={messages} />
    </div>
  );
}
