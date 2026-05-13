import Link from "next/link";

import { cn } from "@/lib/utils";

const baseClassName =
  "inline-flex items-center justify-center rounded-2xl border border-fuchsia-400/20 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(242,56,255,0.35)] transition duration-200 hover:scale-[1.01] hover:shadow-[0_14px_42px_rgba(242,56,255,0.45)] focus:outline-none focus:ring-2 focus:ring-fuchsia-300/60 disabled:cursor-not-allowed disabled:opacity-60";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: never;
};

type LinkProps = {
  href: string;
  className?: string;
  children: React.ReactNode;
};

export function GradientButton(props: ButtonProps | LinkProps) {
  if ("href" in props && typeof props.href === "string") {
    return (
      <Link href={props.href} className={cn(baseClassName, props.className)}>
        {props.children}
      </Link>
    );
  }

  const { className, children, ...buttonProps } = props;

  return (
    <button {...buttonProps} className={cn(baseClassName, className)}>
      {children}
    </button>
  );
}

export const ghostButtonClassName =
  "inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/90 transition hover:border-fuchsia-400/30 hover:bg-white/8 hover:text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-300/40";
