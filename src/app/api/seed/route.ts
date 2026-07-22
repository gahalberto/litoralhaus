import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { slugify } from "@/lib/slugify";

// Rota de seed de produção — protegida por SEED_SECRET
// Use apenas uma vez e depois remova a variável de ambiente para desativar.
// POST /api/seed   Header: x-seed-secret: <SEED_SECRET>
//               ou Query:  ?secret=<SEED_SECRET>

const HIGHLIGHTS = [
  "Frente mar", "Vista para o mar", "Vista para o canal", "Pé na areia",
  "Varanda gourmet", "Varanda frente mar", "Pier privativo", "Acesso ao canal",
  "Área de lazer completa", "Alto padrão de acabamento", "Cozinha planejada",
  "Closet", "Suíte máster ampla", "Cobertura duplex", "Penthouse",
  "Andar alto", "Posição solar privilegiada", "Condomínio de luxo",
  "Segurança 24h", "Portaria blindada",
];

const AMENITIES = [
  "Piscina", "Piscina privativa", "Piscina aquecida", "Sauna", "Academia",
  "Espaço gourmet", "Churrasqueira", "Salão de festas", "Playground",
  "Quadra poliesportiva", "Quadra de tênis", "Campo de futebol",
  "Espaço kids", "Brinquedoteca", "Home theater", "Coworking",
  "Lavanderia coletiva", "Depósito privativo", "Gerador", "Pet place",
];

// ── Cidades / Bairros (páginas "Regiões Atendidas" — SEO) ────────────────────
// Mantido em sincronia com prisma/seed.ts

const CIDADES: {
  nome: string; slug: string; ativo: boolean; textoIntro?: string; metaDescription?: string;
}[] = [
  {
    nome: "Guarujá", slug: "guaruja", ativo: true,
    textoIntro:
      "<p>O Guarujá é o principal destino do litoral paulista para quem busca praia, qualidade de vida e proximidade com São Paulo — cerca de 1h30 de carro da capital. A cidade reúne desde bairros tradicionais e badalados, como Pitangueiras e Astúrias, até regiões mais reservadas e residenciais, como Enseada e Guaiúba.</p><p>Com mais de 15 praias, forte infraestrutura de comércio, gastronomia e serviços, o Guarujá atrai tanto quem procura casa de temporada quanto quem decide morar fixo na cidade.</p>",
    metaDescription: "Conheça os bairros do Guarujá: como é morar em cada região, preços médios e imóveis disponíveis com a LitoralHaus.",
  },
  {
    nome: "Santos", slug: "santos", ativo: true,
    textoIntro:
      "<p>Santos é referência de qualidade de vida na Baixada Santista, com o maior jardim urbano à beira-mar do mundo, infraestrutura completa de saúde, educação e transporte, e bairros bem definidos ao longo da orla, como Gonzaga, Boqueirão e Ponta da Praia.</p><p>A cidade combina a rotina de um centro urbano consolidado com a praia a poucos minutos de casa, o que a torna uma opção tanto para moradia permanente quanto para investimento.</p>",
    metaDescription: "Conheça os bairros de Santos: como é morar em cada região, preços médios e imóveis disponíveis com a LitoralHaus.",
  },
  { nome: "São Vicente",   slug: "sao-vicente",    ativo: false },
  { nome: "Praia Grande",  slug: "praia-grande",   ativo: false },
  { nome: "Bertioga",      slug: "bertioga",       ativo: false },
  { nome: "Ubatuba",       slug: "ubatuba",        ativo: false },
  { nome: "Caraguatatuba", slug: "caraguatatuba",  ativo: false },
  { nome: "São Sebastião", slug: "sao-sebastiao",  ativo: false },
  { nome: "Ilhabela",      slug: "ilhabela",       ativo: false },
];

const BAIRROS: {
  cidadeSlug: string; nome: string; textoMorar: string; metaDescription: string; proximosDe?: string[];
}[] = [
  {
    cidadeSlug: "guaruja", nome: "Enseada",
    textoMorar:
      "<p>A Enseada é o bairro mais extenso do Guarujá e um dos mais procurados por quem quer morar perto da praia com tranquilidade. Tem orla ampla, boa oferta de prédios residenciais de médio e alto padrão, além de comércio, escolas e serviços concentrados ao longo da Avenida Miguel Estefno.</p><p>É uma região que atrai famílias e quem busca sossego sem abrir mão de infraestrutura completa no dia a dia.</p>",
    metaDescription: "Como é morar na Enseada, Guarujá: infraestrutura, praia, perfil do bairro e imóveis disponíveis.",
    proximosDe: ["Pitangueiras", "Guaiúba"],
  },
  {
    cidadeSlug: "guaruja", nome: "Pitangueiras",
    textoMorar:
      "<p>Pitangueiras é o coração turístico e comercial do Guarujá, com a praia mais movimentada da cidade, forte concentração de restaurantes, bares e vida noturna. É a região com maior densidade de prédios e a mais valorizada para quem busca vista mar e proximidade com tudo.</p><p>Ideal para quem gosta de movimento e quer estar a poucos passos da praia e do comércio.</p>",
    metaDescription: "Como é morar em Pitangueiras, Guarujá: praia, vida noturna, comércio e imóveis disponíveis.",
    proximosDe: ["Enseada", "Astúrias"],
  },
  {
    cidadeSlug: "guaruja", nome: "Astúrias",
    textoMorar:
      "<p>Astúrias fica entre Pitangueiras e a região central, com fácil acesso à praia e ao comércio, mas em ruas geralmente mais calmas que as regiões mais turísticas. É um bairro consolidado, com boa oferta de apartamentos de médio padrão.</p><p>Atrai quem quer proximidade com a orla sem pagar o valor das áreas mais nobres da cidade.</p>",
    metaDescription: "Como é morar em Astúrias, Guarujá: localização, infraestrutura e imóveis disponíveis.",
    proximosDe: ["Pitangueiras"],
  },
  {
    cidadeSlug: "guaruja", nome: "Jardim Acapulco",
    textoMorar:
      "<p>O Jardim Acapulco é um dos bairros mais valorizados do Guarujá, conhecido por suas casas e sobrados de alto padrão, ruas arborizadas e proximidade com a Praia da Enseada. É uma região predominantemente residencial e tranquila.</p><p>Costuma ser a escolha de quem busca mais privacidade e um perfil de vizinhança mais exclusivo.</p>",
    metaDescription: "Como é morar no Jardim Acapulco, Guarujá: perfil do bairro, infraestrutura e imóveis disponíveis.",
    proximosDe: ["Enseada"],
  },
  {
    cidadeSlug: "guaruja", nome: "Guaiúba",
    textoMorar:
      "<p>A Guaiúba é uma das regiões mais reservadas do Guarujá, com praia mais calma e menor densidade de construções em relação a Pitangueiras e Astúrias. É procurada por quem valoriza sossego e contato mais próximo com a natureza, sem abrir mão da praia.</p><p>Tem crescido como opção residencial para quem busca qualidade de vida fora do eixo mais turístico da cidade.</p>",
    metaDescription: "Como é morar na Guaiúba, Guarujá: tranquilidade, praia e imóveis disponíveis.",
    proximosDe: ["Enseada"],
  },
  {
    cidadeSlug: "santos", nome: "Gonzaga",
    textoMorar:
      "<p>O Gonzaga é um dos bairros mais valorizados de Santos, no coração da orla, com o Jardim da Orla, boa concentração de comércio, restaurantes e vida noturna. Tem prédios residenciais de médio e alto padrão e é uma das regiões mais procuradas da cidade.</p><p>Combina rotina urbana completa com a praia a poucos minutos de casa.</p>",
    metaDescription: "Como é morar no Gonzaga, Santos: orla, comércio, infraestrutura e imóveis disponíveis.",
    proximosDe: ["Boqueirão", "Embaré"],
  },
  {
    cidadeSlug: "santos", nome: "Boqueirão",
    textoMorar:
      "<p>O Boqueirão é um bairro nobre e tradicional de Santos, conhecido pelas construções de alto padrão de frente para o mar e por sua localização central na orla. É uma região consolidada, com forte presença de famílias e boa infraestrutura de serviços.</p><p>É uma das áreas mais procuradas por quem busca viver perto da praia com toda a estrutura de uma cidade grande.</p>",
    metaDescription: "Como é morar no Boqueirão, Santos: orla, infraestrutura e imóveis disponíveis.",
    proximosDe: ["Gonzaga", "Embaré"],
  },
  {
    cidadeSlug: "santos", nome: "Ponta da Praia",
    textoMorar:
      "<p>A Ponta da Praia fica na extremidade da orla de Santos, próxima ao canal do porto e à Ilha Porchat. É um bairro residencial, com praia mais tranquila que a região central e boa proximidade com a Ponte Pênsil e o Aquário de Santos.</p><p>Atrai quem busca um perfil mais familiar e sossegado, sem se afastar da praia.</p>",
    metaDescription: "Como é morar na Ponta da Praia, Santos: infraestrutura, praia e imóveis disponíveis.",
  },
  {
    cidadeSlug: "santos", nome: "Aparecida",
    textoMorar:
      "<p>A Aparecida é um bairro tradicional de Santos, com forte presença de comércio de rua, serviços e boa oferta de apartamentos de médio padrão. Fica próxima à orla, mas com um perfil mais urbano e menos voltado ao turismo que o Gonzaga ou o Boqueirão.</p><p>É uma boa opção para quem busca custo-benefício sem abrir mão da proximidade com a praia.</p>",
    metaDescription: "Como é morar na Aparecida, Santos: comércio, infraestrutura e imóveis disponíveis.",
  },
  {
    cidadeSlug: "santos", nome: "Embaré",
    textoMorar:
      "<p>O Embaré é um bairro residencial e tranquilo de Santos, conhecido pelas ruas arborizadas e pela proximidade com o Gonzaga e o Boqueirão. Tem um perfil mais familiar, com boa oferta de apartamentos de médio e alto padrão.</p><p>É procurado por quem quer estar perto da orla nobre da cidade em um entorno mais calmo.</p>",
    metaDescription: "Como é morar no Embaré, Santos: tranquilidade, infraestrutura e imóveis disponíveis.",
    proximosDe: ["Gonzaga", "Boqueirão"],
  },
];

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function POST(req: NextRequest) {
  const secret = process.env.SEED_SECRET;

  if (!secret) {
    return NextResponse.json(
      { error: "SEED_SECRET not configured — add it to Vercel env vars." },
      { status: 503 }
    );
  }

  const provided =
    req.nextUrl.searchParams.get("secret") ??
    req.headers.get("x-seed-secret");

  if (provided !== secret) return unauthorized();

  const results: Record<string, unknown> = {};

  // ── Admin user ──────────────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@litoralhaus.com.br";
  const adminPass  = process.env.ADMIN_PASSWORD;

  if (!adminPass) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD not configured in Vercel env vars." },
      { status: 503 }
    );
  }

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (existingAdmin) {
    results.admin = { status: "already_exists", email: adminEmail };
  } else {
    await prisma.user.create({
      data: {
        name:     "Gabriel Alberto",
        email:    adminEmail,
        password: await hashPassword(adminPass),
        role:     "ADMIN",
        active:   true,
      },
    });
    results.admin = { status: "created", email: adminEmail };
  }

  // ── Highlights ──────────────────────────────────────────────────────────────
  let highlightsCreated = 0;
  for (const label of HIGHLIGHTS) {
    const r = await prisma.highlight.upsert({
      where:  { label },
      update: {},
      create: { label },
    });
    if (r) highlightsCreated++;
  }
  results.highlights = { total: HIGHLIGHTS.length, processed: highlightsCreated };

  // ── Amenities ───────────────────────────────────────────────────────────────
  let amenitiesCreated = 0;
  for (const label of AMENITIES) {
    const r = await prisma.amenity.upsert({
      where:  { label },
      update: {},
      create: { label },
    });
    if (r) amenitiesCreated++;
  }
  results.amenities = { total: AMENITIES.length, processed: amenitiesCreated };

  // ── Cidades / Bairros ──────────────────────────────────────────────────────
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
  results.cidades = { total: CIDADES.length };

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
        ativo: true, criadoAutomaticamente: false,
      },
    });
    bairroIdByKey.set(`${b.cidadeSlug}:${b.nome}`, bairro.id);
  }
  results.bairros = { total: BAIRROS.length };

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

  return NextResponse.json({ ok: true, results }, { status: 200 });
}

// GET retorna instruções (nunca executa o seed)
export function GET() {
  return NextResponse.json({
    message: "Use POST /api/seed com o header 'x-seed-secret: <SEED_SECRET>' ou ?secret=<SEED_SECRET>.",
    required_env: ["SEED_SECRET", "ADMIN_PASSWORD"],
    optional_env: ["ADMIN_EMAIL"],
  });
}
