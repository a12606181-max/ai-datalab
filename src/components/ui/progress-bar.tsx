import { formatPercent } from "@/lib/utils";

export function ProgressBar({
  value,
  label,
}: {
  value: number;
  label?: string;
}) {
  return (
    <div className="space-y-2">
      {label ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/85">{label}</span>
          <span className="text-white/55">{formatPercent(value)}</span>
        </div>
      ) : null}
      <div className="h-2.5 rounded-full bg-white/8">
        <div
          className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500 shadow-[0_0_18px_rgba(242,56,255,0.42)]"
          style={{ width: `${Math.max(6, value)}%` }}
        />
      </div>
    </div>
  );
}
