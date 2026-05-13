"use client";

import { useFormStatus } from "react-dom";

import { GradientButton } from "@/components/ui/gradient-button";

export function FormSubmitButton({
  label,
  loadingLabel,
  className,
  children,
}: {
  label: string;
  loadingLabel?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const { pending } = useFormStatus();

  return (
    <GradientButton type="submit" disabled={pending} className={className}>
      {children}
      {pending ? loadingLabel || "Сохранение..." : label}
    </GradientButton>
  );
}
