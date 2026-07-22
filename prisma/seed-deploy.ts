import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";
import { slugify } from "../src/lib/slugify";
import { HIGHLIGHTS, AMENITIES, CIDADES, BAIRROS } from "../src/lib/seed-data";

/**
 * Seed idempotente rodado a cada build de produção (Vercel).
 * Só faz upserts — nunca apaga dados (ao contrário de prisma/seed.ts, que é
 * só para ambiente local e recria os leads de demonstração a cada execução).
 * Precisa rodar antes de `next build` porque /regioes/[cidade]/[bairro] usa
 * generateStaticParams, que consulta Cidade/Bairro em build time.
 */

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seed de deploy...");

  // Admin — best-effort, não falha o build se as envs não estiverem configuradas
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@litoralhaus.com.br";
  const adminPass  = process.env.ADMIN_PASSWORD;
  if (adminPass) {
    await prisma.user.upsert({
      where:  { email: adminEmail },
      update: {},
      create: {
        name: "Gabriel Alberto", email: adminEmail,
        password: await hashPassword(adminPass), role: "ADMIN", active: true,
      },
    });
    console.log(`   ✓ admin (${adminEmail})`);
  } else {
    console.log("   ⏭  ADMIN_PASSWORD não configurado — pulando criação de admin.");
  }

  for (const label of HIGHLIGHTS) {
    await prisma.highlight.upsert({ where: { label }, update: {}, create: { label } });
  }
  console.log(`   ✓ ${HIGHLIGHTS.length} destaques`);

  for (const label of AMENITIES) {
    await prisma.amenity.upsert({ where: { label }, update: {}, create: { label } });
  }
  console.log(`   ✓ ${AMENITIES.length} comodidades`);

  const cidadeIdBySlug = new Map<string, string>();
  for (const c of CIDADES) {
    const cidade = await prisma.cidade.upsert({
      where:  { slug: c.slug },
      update: {},
      create: {
        nome: c.nome, slug: c.slug, ativo: c.ativo,
        textoIntro: c.textoIntro, metaDescription: c.metaDescription,
      },
    });
    cidadeIdBySlug.set(c.slug, cidade.id);
  }
  console.log(`   ✓ ${CIDADES.length} cidades`);

  const bairroIdByKey = new Map<string, string>();
  for (const b of BAIRROS) {
    const cidadeId = cidadeIdBySlug.get(b.cidadeSlug)!;
    const slug = slugify(b.nome);
    const bairro = await prisma.bairro.upsert({
      where:  { cidadeId_slug: { cidadeId, slug } },
      update: {},
      create: {
        cidadeId, nome: b.nome, slug,
        textoMorar: b.textoMorar, metaDescription: b.metaDescription,
        ativo: false, criadoAutomaticamente: false,
      },
    });
    bairroIdByKey.set(`${b.cidadeSlug}:${b.nome}`, bairro.id);
  }
  console.log(`   ✓ ${BAIRROS.length} bairros (rascunho)`);

  for (const b of BAIRROS) {
    if (!b.proximosDe?.length) continue;
    const id = bairroIdByKey.get(`${b.cidadeSlug}:${b.nome}`)!;
    const proximosIds = b.proximosDe
      .map((nome) => bairroIdByKey.get(`${b.cidadeSlug}:${nome}`))
      .filter((v): v is string => !!v);
    if (proximosIds.length === 0) continue;
    await prisma.bairro.update({
      where: { id },
      data:  { bairrosProximos: { connect: proximosIds.map((pid) => ({ id: pid })) } },
    });
  }

  console.log("✅ Seed de deploy concluído.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
