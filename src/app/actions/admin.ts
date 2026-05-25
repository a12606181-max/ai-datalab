"use server";

import { UserRole, UserStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getTargetTeacher(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      status: true,
    },
  });
}

export async function approveTeacherAction(formData: FormData) {
  await requireAdmin();

  const userId = String(formData.get("userId") ?? "");
  if (!userId) return;

  const teacher = await getTargetTeacher(userId);
  if (!teacher || teacher.role !== UserRole.TEACHER) return;

  await prisma.user.update({
    where: { id: teacher.id },
    data: { status: UserStatus.APPROVED },
  });

  revalidatePath("/admin");
  revalidatePath("/notifications");
}

export async function rejectTeacherAction(formData: FormData) {
  await requireAdmin();

  const userId = String(formData.get("userId") ?? "");
  if (!userId) return;

  const teacher = await getTargetTeacher(userId);
  if (!teacher || teacher.role !== UserRole.TEACHER) return;

  await prisma.user.update({
    where: { id: teacher.id },
    data: { status: UserStatus.REJECTED },
  });

  revalidatePath("/admin");
  revalidatePath("/notifications");
}

export async function deleteUserAction(formData: FormData) {
  const admin = await requireAdmin();

  const userId = String(formData.get("userId") ?? "");
  if (!userId || userId === admin.id) return;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
    },
  });

  if (!user || user.role === UserRole.ADMIN) return;

  await prisma.user.delete({
    where: { id: user.id },
  });

  revalidatePath("/admin");
  revalidatePath("/notifications");
}
