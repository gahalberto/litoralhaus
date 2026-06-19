"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres").max(60),
});

export type CategoryResult = { success: true; id: string } | { success: false; error: string };

export async function getPropertyCategories() {
  return prisma.propertyCategory.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { properties: true } } },
  });
}

export async function createPropertyCategory(raw: unknown): Promise<CategoryResult> {
  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  try {
    const cat = await prisma.propertyCategory.create({ data: { name: parsed.data.name.trim() } });
    revalidatePath("/admin/property-types");
    return { success: true, id: cat.id };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro ao salvar";
    if (msg.includes("Unique")) return { success: false, error: "Já existe uma categoria com esse nome." };
    return { success: false, error: msg };
  }
}

export async function updatePropertyCategory(id: string, raw: unknown): Promise<CategoryResult> {
  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  try {
    await prisma.propertyCategory.update({ where: { id }, data: { name: parsed.data.name.trim() } });
    revalidatePath("/admin/property-types");
    return { success: true, id };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro ao salvar";
    if (msg.includes("Unique")) return { success: false, error: "Já existe uma categoria com esse nome." };
    return { success: false, error: msg };
  }
}

export async function deletePropertyCategory(id: string): Promise<void> {
  await prisma.propertyCategory.delete({ where: { id } });
  revalidatePath("/admin/property-types");
}
