import { cn } from "@/lib/utils";

export function GlassCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("glass-card panel-glow rounded-[24px] border p-5", className)}>
      {children}
    </div>
  );
}
