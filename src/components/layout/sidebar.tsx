"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  BrainCircuit,
  Database,
  GraduationCap,
  LayoutDashboard,
  Settings,
  UserRound,
  X,
  ChartNoAxesCombined,
  Shield,
  Menu,
} from "lucide-react";

import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const baseItems = [
  { href: "/dashboard", label: "Панель", icon: LayoutDashboard },
  { href: "/courses", label: "Курсы", icon: BookOpen },
  { href: "/labs", label: "Лабораторные", icon: GraduationCap },
  { href: "/datasets", label: "Мои данные", icon: Database },
  { href: "/mentor", label: "ИИ-наставник", icon: BrainCircuit },
  { href: "/progress", label: "Прогресс", icon: ChartNoAxesCombined },
  { href: "/profile", label: "Профиль", icon: UserRound },
  { href: "/settings", label: "Настройки", icon: Settings },
];

export function Sidebar({
  role,
  open,
  onClose,
  onOpen,
}: {
  role: "STUDENT" | "TEACHER";
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
}) {
  const pathname = usePathname();

  const navItems =
    role === "TEACHER"
      ? [
          { href: "/dashboard", label: "Панель", icon: LayoutDashboard },
          { href: "/courses", label: "Курсы", icon: BookOpen },
          { href: "/labs", label: "Лабораторные", icon: GraduationCap },
          { href: "/datasets", label: "Датасеты", icon: Database },
          { href: "/mentor", label: "ИИ-наставник", icon: BrainCircuit },
          { href: "/progress", label: "Прогресс", icon: ChartNoAxesCombined },
          { href: "/teacher", label: "Панель преподавателя", icon: Shield },
          { href: "/profile", label: "Профиль", icon: UserRound },
          { href: "/settings", label: "Настройки", icon: Settings },
        ]
      : baseItems;

  return (
    <>
      <button
        onClick={onOpen}
        className="fixed top-4 left-4 z-50 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[#120f1d]/90 text-white shadow-lg md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
      {open ? (
        <button
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          aria-label="Закрыть меню"
        />
      ) : null}
      <aside
        className={cn(
          "glass-card thin-scrollbar fixed top-0 left-0 z-40 flex h-screen w-[86vw] max-w-[320px] flex-col overflow-y-auto border-r px-5 py-6 transition duration-300 md:w-[252px] md:max-w-none md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-500 font-bold shadow-[0_0_26px_rgba(242,56,255,0.35)]">
              AI
            </span>
            <div>
              <p className="text-lg font-semibold text-white">{APP_NAME}</p>
              <p className="text-xs text-white/45">Образовательная платформа</p>
            </div>
          </Link>
          <button onClick={onClose} className="md:hidden">
            <X className="h-5 w-5 text-white/70" />
          </button>
        </div>

        <div className="space-y-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                  active
                    ? "bg-gradient-to-r from-fuchsia-500 via-pink-500 to-violet-500 text-white shadow-[0_12px_34px_rgba(242,56,255,0.35)]"
                    : "text-white/60 hover:bg-white/6 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </div>
      </aside>
    </>
  );
}
