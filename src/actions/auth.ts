"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { signSession, SESSION_COOKIE } from "@/lib/auth";

export async function login(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const email    = (formData.get("email")    as string)?.trim().toLowerCase();
  const password = (formData.get("password") as string);
  const redirectTo = (formData.get("redirect") as string) || "/admin/leads";

  if (!email || !password) {
    return { error: "E-mail e senha são obrigatórios." };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.active) {
    return { error: "Credenciais inválidas." };
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    return { error: "Credenciais inválidas." };
  }

  const token = await signSession({
    userId: user.id,
    email:  user.email,
    name:   user.name,
    role:   user.role,
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    path:     "/",
    maxAge:   60 * 60 * 24 * 7,
  });

  redirect(redirectTo);
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/login");
}
