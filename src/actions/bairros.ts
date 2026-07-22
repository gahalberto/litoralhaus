"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { bairroSchema } from "@/types/bairro";
import { requireSession } from "@/lib/session";
import { slugify } from "@/lib/slugify";
import { uniqueBairroSlug } from "@/lib/bairro";

async function requireAdmin() {
  const session = await requireSession();
  if (session.role !== "ADMIN") throw new Error("Acesso restrito a administradores.");
  return session;
}

export type BairroResult = { success: true; id: string } | { success: false; error: string };

function toNum(v?: string): number | undefined {
  if (!v || v.trim() === "") return undefined;
  const n = Number(v);
  return isNaN(n) ? undefined : n;
}

/** Bloqueia ativação de bairro sem os campos mínimos de SEO preenchidos. */
function validarAtivacao(d: {
  slug?: string;
  textoMorar?: string;
  metaDescription?: string;
}): string | null {
  if (!d.slug || d.slug.trim() === "") return "Preencha o slug antes de ativar o bairro.";
  if (!d.textoMorar || d.textoMorar.trim() === "") return "Preencha o texto \"Morar no bairro\" antes de ativar.";
  if (!d.metaDescription || d.metaDescription.trim() === "") return "Preencha a meta description antes de ativar.";
  return null;
}

// ─── Listagem ─────────────────────────────────────────────────────────────────

export async function getBairros(filters?: {
  cidadeId?: string;
  ativo?: boolean;
  criadoAutomaticamente?: boolean;
  q?: string;
}) {
  const q = filters?.q?.trim();
  return prisma.bairro.findMany({
    where: {
      ...(filters?.cidadeId && { cidadeId: filters.cidadeId }),
      ...(filters?.ativo !== undefined && { ativo: filters.ativo }),
      ...(filters?.criadoAutomaticamente !== undefined && {
        criadoAutomaticamente: filters.criadoAutomaticamente,
      }),
      ...(q && { nome: { contains: q, mode: "insensitive" } }),
    },
    orderBy: [{ cidade: { nome: "asc" } }, { nome: "asc" }],
    include: {
      cidade: { select: { id: true, nome: true, slug: true } },
      _count: { select: { properties: true } },
    },
  });
}

export async function getBairroById(id: string) {
  return prisma.bairro.findUnique({
    where: { id },
    include: {
      cidade: { select: { id: true, nome: true, slug: true } },
      bairrosProximos: { select: { id: true, nome: true } },
      _count: { select: { properties: true } },
    },
  });
}

/** Bairros da mesma cidade, para o seletor de "bairros próximos". */
export async function getBairrosParaSelecao(cidadeId: string, excludeId?: string) {
  return prisma.bairro.findMany({
    where: { cidadeId, ...(excludeId && { id: { not: excludeId } }) },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true },
  });
}

// ─── Criar ────────────────────────────────────────────────────────────────────

export async function createBairro(raw: unknown): Promise<BairroResult> {
  await requireAdmin();
  const parsed = bairroSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  const d = parsed.data;

  const baseSlug = slugify(d.slug || d.nome);
  const slug = await uniqueBairroSlug(d.cidadeId, baseSlug);

  if (d.ativo) {
    const erro = validarAtivacao({ slug, textoMorar: d.textoMorar, metaDescription: d.metaDescription });
    if (erro) return { success: false, error: erro };
  }

  try {
    const bairro = await prisma.bairro.create({
      data: {
        cidadeId:              d.cidadeId,
        nome:                  d.nome,
        slug,
        textoMorar:            d.textoMorar || undefined,
        aluguelMedio:          toNum(d.aluguelMedio),
        vendaMedia:            toNum(d.vendaMedia),
        metaTitle:             d.metaTitle || undefined,
        metaDescription:       d.metaDescription || undefined,
        latitude:              toNum(d.latitude),
        longitude:             toNum(d.longitude),
        ativo:                 d.ativo,
        criadoAutomaticamente: false,
        bairrosProximos: d.bairrosProximosIds?.length
          ? { connect: d.bairrosProximosIds.map((id) => ({ id })) }
          : undefined,
      },
    });
    revalidatePath("/admin/bairros");
    revalidatePath("/regioes");
    return { success: true, id: bairro.id };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro ao salvar";
    if (msg.includes("Unique")) return { success: false, error: "Já existe um bairro com esse slug nessa cidade." };
    return { success: false, error: msg };
  }
}

// ─── Editar ───────────────────────────────────────────────────────────────────

export async function updateBairro(id: string, raw: unknown): Promise<BairroResult> {
  await requireAdmin();
  const parsed = bairroSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  const d = parsed.data;

  const baseSlug = slugify(d.slug || d.nome);
  const slug = await uniqueBairroSlug(d.cidadeId, baseSlug, id);

  if (d.ativo) {
    const erro = validarAtivacao({ slug, textoMorar: d.textoMorar, metaDescription: d.metaDescription });
    if (erro) return { success: false, error: erro };
  }

  try {
    await prisma.bairro.update({
      where: { id },
      data: {
        cidadeId:        d.cidadeId,
        nome:            d.nome,
        slug,
        textoMorar:      d.textoMorar || null,
        aluguelMedio:    toNum(d.aluguelMedio) ?? null,
        vendaMedia:      toNum(d.vendaMedia)   ?? null,
        metaTitle:       d.metaTitle || null,
        metaDescription: d.metaDescription || null,
        latitude:        toNum(d.latitude)  ?? null,
        longitude:       toNum(d.longitude) ?? null,
        ativo:           d.ativo,
        bairrosProximos: {
          set: (d.bairrosProximosIds ?? []).map((bid) => ({ id: bid })),
        },
      },
    });
    revalidatePath("/admin/bairros");
    revalidatePath(`/admin/bairros/${id}/edit`);
    revalidatePath("/regioes");
    return { success: true, id };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro ao salvar";
    if (msg.includes("Unique")) return { success: false, error: "Já existe um bairro com esse slug nessa cidade." };
    return { success: false, error: msg };
  }
}

// ─── Excluir ─────────────────────────────────────────────────────────────────

export async function deleteBairro(id: string): Promise<void> {
  await requireAdmin();
  await prisma.bairro.delete({ where: { id } });
  revalidatePath("/admin/bairros");
}
