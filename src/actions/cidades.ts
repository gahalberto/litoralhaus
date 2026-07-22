"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { cidadeSchema } from "@/types/cidade";
import { requireSession } from "@/lib/session";

async function requireAdmin() {
  const session = await requireSession();
  if (session.role !== "ADMIN") throw new Error("Acesso restrito a administradores.");
  return session;
}

export type CidadeResult = { success: true; id: string } | { success: false; error: string };

function toNum(v?: string): number | undefined {
  if (!v || v.trim() === "") return undefined;
  const n = Number(v);
  return isNaN(n) ? undefined : n;
}

// ─── Listagem ─────────────────────────────────────────────────────────────────

export async function getCidades() {
  return prisma.cidade.findMany({
    orderBy: { nome: "asc" },
    include: { _count: { select: { bairros: true, properties: true } } },
  });
}

export async function getCidadeById(id: string) {
  return prisma.cidade.findUnique({
    where: { id },
    include: { _count: { select: { bairros: true, properties: true } } },
  });
}

// ─── Criar ────────────────────────────────────────────────────────────────────

export async function createCidade(raw: unknown): Promise<CidadeResult> {
  await requireAdmin();
  const parsed = cidadeSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  const d = parsed.data;

  try {
    const cidade = await prisma.cidade.create({
      data: {
        nome:            d.nome,
        slug:            d.slug,
        uf:              d.uf,
        textoIntro:      d.textoIntro || undefined,
        metaDescription: d.metaDescription || undefined,
        latitude:        toNum(d.latitude),
        longitude:       toNum(d.longitude),
        ativo:           d.ativo,
      },
    });
    revalidatePath("/admin/cidades");
    revalidatePath("/regioes");
    return { success: true, id: cidade.id };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro ao salvar";
    if (msg.includes("Unique")) return { success: false, error: "Já existe uma cidade com esse slug." };
    return { success: false, error: msg };
  }
}

// ─── Editar ───────────────────────────────────────────────────────────────────

export async function updateCidade(id: string, raw: unknown): Promise<CidadeResult> {
  await requireAdmin();
  const parsed = cidadeSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  const d = parsed.data;

  try {
    await prisma.cidade.update({
      where: { id },
      data: {
        nome:            d.nome,
        slug:            d.slug,
        uf:              d.uf,
        textoIntro:      d.textoIntro || null,
        metaDescription: d.metaDescription || null,
        latitude:        toNum(d.latitude)  ?? null,
        longitude:       toNum(d.longitude) ?? null,
        ativo:           d.ativo,
      },
    });
    revalidatePath("/admin/cidades");
    revalidatePath(`/admin/cidades/${id}/edit`);
    revalidatePath("/regioes");
    return { success: true, id };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro ao salvar";
    if (msg.includes("Unique")) return { success: false, error: "Já existe uma cidade com esse slug." };
    return { success: false, error: msg };
  }
}

// ─── Excluir ─────────────────────────────────────────────────────────────────

export async function deleteCidade(id: string): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  const cidade = await prisma.cidade.findUnique({
    where: { id },
    include: { _count: { select: { bairros: true } } },
  });
  if (!cidade) return { success: false, error: "Cidade não encontrada." };
  if (cidade._count.bairros > 0) {
    return {
      success: false,
      error: "Esta cidade tem bairros vinculados. Remova ou mova os bairros antes de excluir.",
    };
  }
  await prisma.cidade.delete({ where: { id } });
  revalidatePath("/admin/cidades");
  return { success: true };
}
