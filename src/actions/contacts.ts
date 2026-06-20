"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export const contactFormSchema = z.object({
  name:    z.string().min(2, "Nome obrigatório"),
  email:   z.string().email("E-mail inválido"),
  phone:   z.string().optional(),
  subject: z.string().min(3, "Assunto obrigatório"),
  message: z.string().min(10, "Mensagem muito curta"),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
export type ContactActionResult = { success: true } | { success: false; error: string };

export async function submitContact(raw: unknown): Promise<ContactActionResult> {
  const parsed = contactFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }
  const d = parsed.data;
  try {
    await prisma.contact.create({
      data: {
        name:    d.name,
        email:   d.email,
        phone:   d.phone || undefined,
        subject: d.subject,
        message: d.message,
      },
    });
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao enviar mensagem. Tente novamente." };
  }
}

export async function getContacts(onlyUnread?: boolean) {
  await requireSession();
  return prisma.contact.findMany({
    where: onlyUnread ? { read: false } : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

export async function markContactRead(id: string, read = true) {
  await requireSession();
  await prisma.contact.update({ where: { id }, data: { read } });
  revalidatePath("/admin/contacts");
}

export async function deleteContact(id: string) {
  await requireSession();
  await prisma.contact.delete({ where: { id } });
  revalidatePath("/admin/contacts");
}
