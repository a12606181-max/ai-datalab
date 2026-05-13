import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/forms/register-form";
import { getCurrentUser } from "@/lib/auth";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(242,56,255,0.35),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.2),transparent_30%)]" />
      <div className="relative z-10 w-full">
        <AuthCard
          title="Регистрация в AI DataLab"
          description="Создайте аккаунт студента или преподавателя и войдите в образовательную платформу по аналитике данных и искусственному интеллекту."
          footer="После регистрации вы сразу попадёте в рабочий кабинет и сможете открыть курсы, лабораторные и ИИ-наставника."
        >
          <RegisterForm />
        </AuthCard>
      </div>
    </div>
  );
}
