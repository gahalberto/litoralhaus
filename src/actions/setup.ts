"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { signSession, SESSION_COOKIE } from "@/lib/auth";
import { cookies } from "next/headers";

export async function createFirstAdmin(formData: FormData) {
  // Garante que só funciona com banco vazio
  const count = await prisma.user.count();
  if (count > 0) redirect("/login");

  const name     = (formData.get("name")     as string)?.trim();
  const email    = (formData.get("email")    as string)?.trim().toLowerCase();
  const password = (formData.get("password") as string);
  const confirm  = (formData.get("confirm")  as string);

  if (!name || !email || !password || password !== confirm || password.length < 8) {
    redirect("/setup?error=1");
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: await hashPassword(password),
      role:     "ADMIN",
      active:   true,
    },
  });

  // Loga automaticamente após criar
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

  redirect("/admin");
}
