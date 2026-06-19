"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { userFormSchema } from "@/types/user";
import { UserRole } from "@prisma/client";

export type UserSummary = {
  id:     string;
  name:   string;
  email:  string;
  role:   string;
  avatar: string | null;
};

export async function searchUsers(query: string): Promise<UserSummary[]> {
  if (!query || query.trim().length < 1) {
    return prisma.user.findMany({
      where:   { active: true },
      orderBy: { name: "asc" },
      take:    30,
      select:  { id: true, name: true, email: true, role: true, avatar: true },
    });
  }

  return prisma.user.findMany({
    where: {
      active: true,
      OR: [
        { name:  { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { name: "asc" },
    take:    20,
    select:  { id: true, name: true, email: true, role: true, avatar: true },
  });
}

export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: Date;
  _count: { assignedLeads: number };
};

export async function getUsers(): Promise<UserRow[]> {
  return prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: {
      id: true, name: true, email: true,
      role: true, active: true, createdAt: true,
      _count: { select: { assignedLeads: true } },
    },
  }) as unknown as UserRow[];
}

export async function createUser(
  raw: unknown
): Promise<{ success: true } | { success: false; error: string }> {
  const parsed = userFormSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const { name, email, password, role, active } = parsed.data;

  if (!password) return { success: false, error: "Senha obrigatória para novo usuário." };

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { success: false, error: "E-mail já cadastrado." };

  await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      password: await hashPassword(password),
      role: role as UserRole,
      active,
    },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function updateUser(
  id: string,
  raw: unknown
): Promise<{ success: true } | { success: false; error: string }> {
  const parsed = userFormSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const { name, email, password, role, active } = parsed.data;

  await prisma.user.update({
    where: { id },
    data: {
      name,
      email: email.toLowerCase(),
      role: role as UserRole,
      active,
      ...(password ? { password: await hashPassword(password) } : {}),
    },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function toggleUserActive(id: string, active: boolean): Promise<void> {
  await prisma.user.update({ where: { id }, data: { active } });
  revalidatePath("/admin/users");
}
