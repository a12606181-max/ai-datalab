"use client";

import { useState } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export function AppLayout({
  user,
  children,
}: {
  user: {
    name: string;
    email: string;
    role: "STUDENT" | "TEACHER";
  };
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-transparent">
      <Sidebar role={user.role} open={open} onOpen={() => setOpen(true)} onClose={() => setOpen(false)} />
      <div className="min-h-screen md:pl-[272px]">
        <main className="px-4 py-4 md:px-8 md:py-6">
          <Topbar user={user} />
          <div>{children}</div>
        </main>
      </div>
    </div>
  );
}
