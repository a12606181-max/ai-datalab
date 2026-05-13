import { forwardRef } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type FormInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: LucideIcon;
  hint?: string;
};

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(function FormInput(
  { label, icon: Icon, hint, className, ...props },
  ref,
) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-white/90">{label}</span>
      <span
        className={cn(
          "flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition focus-within:border-fuchsia-400/40 focus-within:bg-white/[0.07]",
          className,
        )}
      >
        {Icon ? <Icon className="h-4 w-4 text-fuchsia-300" /> : null}
        <input
          ref={ref}
          {...props}
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
        />
      </span>
      {hint ? <span className="mt-2 block text-xs text-white/40">{hint}</span> : null}
    </label>
  );
});
