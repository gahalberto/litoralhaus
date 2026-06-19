"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ownerSchema } from "@/types/owner";
export type { OwnerFormData } from "@/types/owner";

export type OwnerResult = { success: true; id: string } | { success: false; error: string };

// ─── Listagem ─────────────────────────────────────────────────────────────────

export async function getOwners(q?: string) {
  return prisma.owner.findMany({
    where: q
      ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }] }
      : undefined,
    orderBy: { name: "asc" },
    select: {
      id: true, name: true, phone: true, email: true, createdAt: true,
      _count: { select: { properties: true } },
    },
  });
}

// ─── Detalhe ──────────────────────────────────────────────────────────────────

export async function getOwnerById(id: string) {
  return prisma.owner.findUnique({
    where: { id },
    include: {
      properties: {
        select: {
          id: true, title: true, slug: true, status: true, type: true,
          city: true, neighborhood: true, priceAsk: true,
        },
        orderBy: { createdAt: "desc" },
      },
      history: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });
}

// ─── Criar ────────────────────────────────────────────────────────────────────

export async function createOwner(raw: unknown): Promise<OwnerResult> {
  const parsed = ownerSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  const d = parsed.data;
  try {
    const owner = await prisma.owner.create({
      data: {
        name:  d.name,
        phone: d.phone,
        email: d.email || undefined,
        cpf:   d.cpf   || undefined,
        notes: d.notes || undefined,
      },
    });
    revalidatePath("/admin/owners");
    return { success: true, id: owner.id };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Erro ao salvar" };
  }
}

// ─── Editar com audit log ─────────────────────────────────────────────────────

const FIELD_LABELS: Record<string, string> = {
  name: "Nome", phone: "Telefone", email: "E-mail", cpf: "CPF", notes: "Observações",
};

export async function updateOwner(id: string, raw: unknown): Promise<OwnerResult> {
  const parsed = ownerSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  const d = parsed.data;

  try {
    const current = await prisma.owner.findUnique({ where: { id } });
    if (!current) return { success: false, error: "Proprietário não encontrado" };

    // Detecta quais campos mudaram e gera histórico
    const fields = ["name", "phone", "email", "cpf", "notes"] as const;
    const historyEntries = fields
      .filter((f) => {
        const oldVal = (current[f] ?? "") as string;
        const newVal = (d[f] ?? "") as string;
        return oldVal !== newVal;
      })
      .map((f) => ({
        ownerId:   id,
        field:     FIELD_LABELS[f] ?? f,
        oldValue:  (current[f] ?? null) as string | null,
        newValue:  (d[f] ?? null) as string | null,
        changedBy: "Admin",
      }));

    await prisma.$transaction([
      prisma.owner.update({
        where: { id },
        data: {
          name:  d.name,
          phone: d.phone,
          email: d.email || null,
          cpf:   d.cpf   || null,
          notes: d.notes || null,
        },
      }),
      ...(historyEntries.length > 0
        ? [prisma.ownerHistory.createMany({ data: historyEntries })]
        : []),
    ]);

    revalidatePath("/admin/owners");
    revalidatePath(`/admin/owners/${id}/edit`);
    return { success: true, id };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Erro ao salvar" };
  }
}

// ─── Excluir ─────────────────────────────────────────────────────────────────

export async function deleteOwner(id: string): Promise<void> {
  await prisma.owner.delete({ where: { id } });
  revalidatePath("/admin/owners");
}
