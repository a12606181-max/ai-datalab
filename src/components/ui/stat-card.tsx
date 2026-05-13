import type { LucideIcon } from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";

export function StatCard({
  title,
  value,
  caption,
  icon: Icon,
}: {
  title: string;
  value: string;
  caption: string;
  icon: LucideIcon;
}) {
  return (
    <GlassCard className="hover-lift min-h-[150px]">
      <div className="mb-8 flex items-center justify-between">
        <span className="text-sm text-white/65">{title}</span>
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/6">
          <Icon className="h-5 w-5 text-fuchsia-300" />
        </span>
      </div>
      <div>
        <p className="text-3xl font-semibold tracking-tight text-white">{value}</p>
        <p className="mt-2 text-sm text-white/50">{caption}</p>
      </div>
    </GlassCard>
  );
}
