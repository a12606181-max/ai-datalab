import { EmptyState } from "@/components/ui/empty-state";
import { ProgressBar } from "@/components/ui/progress-bar";
import { AppLocale } from "@/lib/locale";
import { getSkillLabel } from "@/lib/labels";

export function SkillMap({
  skills,
  locale = "ru",
}: {
  skills: Array<{ skill: string; value: number }>;
  locale?: AppLocale;
}) {
  if (!skills.length) {
    return (
      <EmptyState
        title={locale === "en" ? "Skills are not accumulated yet" : "Навыки пока не накоплены"}
        description={
          locale === "en"
            ? "Complete your first lesson or lab, and the growth map for key competencies will appear here."
            : "Завершите первый урок или лабораторную, и здесь появится карта роста по ключевым компетенциям."
        }
      />
    );
  }

  return (
    <div className="space-y-5">
      {skills.map((item) => (
        <ProgressBar key={item.skill} label={getSkillLabel(item.skill, locale)} value={item.value} />
      ))}
    </div>
  );
}
