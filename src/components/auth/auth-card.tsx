import Link from "next/link";

import { APP_NAME } from "@/lib/constants";
import { GlassCard } from "@/components/ui/glass-card";

export function AuthCard({
  title,
  description,
  footer,
  children,
}: {
  title: string;
  description: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <GlassCard className="mx-auto w-full max-w-xl rounded-[32px] px-6 py-8 md:px-8">
      <Link href="/" className="inline-flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-500 font-bold text-white shadow-[0_0_24px_rgba(242,56,255,0.35)]">
          AI
        </span>
        <div>
          <p className="text-lg font-semibold text-white">{APP_NAME}</p>
          <p className="text-sm text-white/45">Интеллектуальная LMS-платформа</p>
        </div>
      </Link>
      <div className="mt-8">
        <h1 className="text-3xl font-semibold tracking-tight text-white">{title}</h1>
        <p className="mt-3 max-w-lg text-sm leading-6 text-white/55">{description}</p>
      </div>
      <div className="mt-8">{children}</div>
      <div className="mt-6 text-sm text-white/55">{footer}</div>
    </GlassCard>
  );
}
