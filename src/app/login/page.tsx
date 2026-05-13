import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/forms/login-form";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(242,56,255,0.35),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.2),transparent_30%)]" />
      <div className="relative z-10 w-full">
        <AuthCard
          title="Вход в AI DataLab"
          description="Откройте рабочий кабинет студента или преподавателя, чтобы продолжить обучение, проверку лабораторных и анализ прогресса."
          footer={
            <>
              Демо-вход для студента: <span className="text-fuchsia-200">student@aidatalab.ru / Student123</span>
            </>
          }
        >
          <LoginForm />
        </AuthCard>
      </div>
    </div>
  );
}
