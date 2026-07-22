import { Prisma, type Region } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";
import { REGION_TO_SLUG } from "@/lib/seo-slugs";

function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** Resolve a Cidade correspondente a uma Region do imóvel (mapeamento 1:1 via slug). */
export async function getCidadeIdByRegion(region: Region): Promise<string | null> {
  const slug = REGION_TO_SLUG[region];
  if (!slug) return null;
  const cidade = await prisma.cidade.findUnique({ where: { slug }, select: { id: true } });
  return cidade?.id ?? null;
}

export async function uniqueBairroSlug(
  cidadeId: string,
  base: string,
  excludeId?: string
): Promise<string> {
  let slug = base;
  let n = 2;
  for (;;) {
    const existing = await prisma.bairro.findUnique({
      where: { cidadeId_slug: { cidadeId, slug } },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${base}-${n++}`;
  }
}

/**
 * Associa o imóvel a um Bairro existente (comparação por nome normalizado) ou
 * cria um novo Bairro rascunho (ativo: false) vinculado à cidade.
 * Garante que nenhum imóvel fique sem bairro e que novos bairros entrem
 * automaticamente no sistema para revisão no admin.
 */
export async function resolverOuCriarBairro(
  nomeBairro: string,
  cidadeId: string
): Promise<string> {
  const nome = nomeBairro.trim();
  const alvo = normalize(nome);

  const bairros = await prisma.bairro.findMany({
    where: { cidadeId },
    select: { id: true, nome: true },
  });
  const existente = bairros.find((b) => normalize(b.nome) === alvo);
  if (existente) return existente.id;

  const baseSlug = slugify(nome);
  const slug = await uniqueBairroSlug(cidadeId, baseSlug);

  try {
    const criado = await prisma.bairro.create({
      data: { cidadeId, nome, slug, ativo: false, criadoAutomaticamente: true },
    });
    return criado.id;
  } catch (err) {
    // Corrida: outro request criou o mesmo bairro entre o find e o create.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const bairros2 = await prisma.bairro.findMany({
        where: { cidadeId },
        select: { id: true, nome: true },
      });
      const achou = bairros2.find((b) => normalize(b.nome) === alvo);
      if (achou) return achou.id;
    }
    throw err;
  }
}
