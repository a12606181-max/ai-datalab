import { ProgressBar } from "@/components/ui/progress-bar";
import { getSkillLabel } from "@/lib/labels";

export function SkillMap({
  skills,
}: {
  skills: Array<{ skill: string; value: number }>;
}) {
  return (
    <div className="space-y-5">
      {skills.map((item) => (
        <ProgressBar key={item.skill} label={getSkillLabel(item.skill)} value={item.value} />
      ))}
    </div>
  );
}
