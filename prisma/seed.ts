import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, LeadStatus, LeadSource, BudgetRange, Region } from "@prisma/client";
import { hashPassword } from "../src/lib/password";
import { slugify } from "../src/lib/slugify";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const leads = [
  {
    name: "Ricardo Mendonça",
    email: "ricardo.mendonca@email.com",
    phone: "11991230001",
    status: LeadStatus.NOVO,
    source: LeadSource.LANDING_PAGE,
    budgetRange: BudgetRange.RANGE_2M_5M,
    regions: [Region.GUARUJA],
    score: 72,
    notes: "Procura apartamento frente mar para uso próprio e aluguel nas temporadas.",
    utmSource: "google",
    utmMedium: "cpc",
    utmCampaign: "guaruja-alto-padrao",
  },
  {
    name: "Fernanda Lopes",
    email: "fernanda.lopes@email.com",
    phone: "11992340002",
    status: LeadStatus.NOVO,
    source: LeadSource.INSTAGRAM,
    budgetRange: BudgetRange.RANGE_1M_2M,
    regions: [Region.GUARUJA, Region.BERTIOGA],
    score: 48,
    notes: "Segunda residência para a família. Prefere condomínio fechado.",
  },
  {
    name: "Eduardo Sartori",
    email: "eduardo.sartori@email.com",
    phone: "11993450003",
    status: LeadStatus.EM_CONTATO,
    source: LeadSource.LANDING_PAGE,
    budgetRange: BudgetRange.ABOVE_5M,
    regions: [Region.GUARUJA],
    score: 91,
    notes: "Investidor. Interesse em cobertura ou penthouse frente mar.",
    utmSource: "google",
    utmMedium: "cpc",
  },
  {
    name: "Mariana Castro",
    email: "mariana.castro@email.com",
    phone: "11994560004",
    status: LeadStatus.EM_CONTATO,
    source: LeadSource.WHATSAPP,
    budgetRange: BudgetRange.RANGE_2M_5M,
    regions: [Region.SANTOS, Region.SAO_VICENTE],
    score: 65,
    notes: "Busca imóvel para aposentadoria. Sem pressa.",
  },
  {
    name: "Thiago Neves",
    email: "thiago.neves@email.com",
    phone: "11995670005",
    status: LeadStatus.QUALIFICADO,
    source: LeadSource.GOOGLE_ADS,
    budgetRange: BudgetRange.RANGE_2M_5M,
    regions: [Region.GUARUJA],
    score: 83,
    notes: "Quer imóvel com doca ou acesso ao canal. Decisão nos próximos 3 meses.",
    utmSource: "google",
    utmMedium: "cpc",
    utmCampaign: "imoveis-canal-guaruja",
  },
  {
    name: "Camila Figueiredo",
    email: "camila.figueiredo@email.com",
    phone: "11996780006",
    status: LeadStatus.QUALIFICADO,
    source: LeadSource.REFERRAL,
    budgetRange: BudgetRange.ABOVE_5M,
    regions: [Region.ILHABELA, Region.UBATUBA],
    score: 95,
    notes: "Indicada por Ricardo Mendonça. Família grande, quer casa com piscina privativa.",
  },
  {
    name: "Paulo Drummond",
    email: "paulo.drummond@email.com",
    phone: "11997890007",
    status: LeadStatus.VISITA_AGENDADA,
    source: LeadSource.LANDING_PAGE,
    budgetRange: BudgetRange.RANGE_1M_2M,
    regions: [Region.GUARUJA, Region.SANTOS],
    score: 78,
    notes: "Visita agendada para sábado. Quer ver ao menos 2 opções no Guarujá.",
  },
  {
    name: "Beatriz Almeida",
    email: "beatriz.almeida@email.com",
    phone: "11998900008",
    status: LeadStatus.PROPOSTA,
    source: LeadSource.LANDING_PAGE,
    budgetRange: BudgetRange.RANGE_2M_5M,
    regions: [Region.GUARUJA],
    score: 88,
    notes: "Proposta enviada para apartamento de 180m² na Enseada. Aguardando resposta.",
  },
  {
    name: "Carlos Henrique Braga",
    email: "carlos.braga@email.com",
    phone: "11991010009",
    status: LeadStatus.FECHADO_GANHO,
    source: LeadSource.GOOGLE_ADS,
    budgetRange: BudgetRange.ABOVE_5M,
    regions: [Region.GUARUJA],
    score: 100,
    notes: "Comprou cobertura duplex frente mar. Excelente cliente. Indicações pendentes.",
    utmSource: "google",
    utmMedium: "cpc",
  },
  {
    name: "Renata Souza",
    email: "renata.souza@email.com",
    phone: "11991110010",
    status: LeadStatus.FECHADO_PERDIDO,
    source: LeadSource.LANDING_PAGE,
    budgetRange: BudgetRange.RANGE_1M_2M,
    regions: [Region.SANTOS],
    score: 30,
    notes: "Optou por imóvel em Florianópolis. Manter para reativação futura.",
  },
];

const HIGHLIGHTS = [
  "Frente mar",
  "Vista para o mar",
  "Vista para o canal",
  "Pé na areia",
  "Varanda gourmet",
  "Varanda frente mar",
  "Pier privativo",
  "Acesso ao canal",
  "Área de lazer completa",
  "Alto padrão de acabamento",
  "Cozinha planejada",
  "Closet",
  "Suíte máster ampla",
  "Cobertura duplex",
  "Penthouse",
  "Andar alto",
  "Posição solar privilegiada",
  "Condomínio de luxo",
  "Segurança 24h",
  "Portaria blindada",
];

const AMENITIES = [
  "Piscina",
  "Piscina privativa",
  "Piscina aquecida",
  "Sauna",
  "Academia",
  "Espaço gourmet",
  "Churrasqueira",
  "Salão de festas",
  "Playground",
  "Quadra poliesportiva",
  "Quadra de tênis",
  "Campo de futebol",
  "Espaço kids",
  "Brinquedoteca",
  "Home theater",
  "Coworking",
  "Lavanderia coletiva",
  "Depósito privativo",
  "Gerador",
  "Pet place",
];

// ─── Cidades / Bairros (páginas "Regiões Atendidas" — SEO) ───────────────────
// Slugs alinhados a REGION_SLUG (src/lib/seo-slugs.ts) para que todo imóvel
// tenha sempre uma Cidade correspondente, independente da região.

const CIDADES: {
  nome: string;
  slug: string;
  ativo: boolean;
  textoIntro?: string;
  metaDescription?: string;
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
  cidadeSlug: string;
  nome: string;
  textoMorar: string;
  metaDescription: string;
  proximosDe?: string[]; // nomes de outros bairros da mesma cidade
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

async function main() {
  console.log("🌱 Iniciando seed...");

  // Usuários padrão
  console.log("\n   Criando usuários padrão...");
  const adminPass    = process.env.ADMIN_PASSWORD ?? "admin123";
  const corretorPass = process.env.CORRETOR_PASSWORD ?? "corretor123";

  await prisma.user.upsert({
    where:  { email: "admin@litoralhaus.com.br" },
    update: {},
    create: {
      name:     "Gabriel Alberto",
      email:    "admin@litoralhaus.com.br",
      password: await hashPassword(adminPass),
      role:     "ADMIN",
      active:   true,
    },
  });
  console.log(`   ✓ admin@litoralhaus.com.br (ADMIN)`);

  await prisma.user.upsert({
    where:  { email: "corretor@litoralhaus.com.br" },
    update: {},
    create: {
      name:     "Corretor Demo",
      email:    "corretor@litoralhaus.com.br",
      password: await hashPassword(corretorPass),
      role:     "CORRETOR",
      active:   true,
    },
  });
  console.log(`   ✓ corretor@litoralhaus.com.br (CORRETOR)`);

  // Leads
  await prisma.lead.deleteMany();
  console.log("   Leads anteriores removidos.");
  for (const lead of leads) {
    await prisma.lead.create({ data: lead });
    console.log(`   ✓ ${lead.name} (${lead.status})`);
  }

  // Catálogos — upsert para não duplicar em re-seeds
  console.log("\n   Populando catálogo de destaques...");
  for (const label of HIGHLIGHTS) {
    await prisma.highlight.upsert({
      where: { label },
      update: {},
      create: { label },
    });
  }
  console.log(`   ✓ ${HIGHLIGHTS.length} destaques`);

  console.log("   Populando catálogo de comodidades...");
  for (const label of AMENITIES) {
    await prisma.amenity.upsert({
      where: { label },
      update: {},
      create: { label },
    });
  }
  console.log(`   ✓ ${AMENITIES.length} comodidades`);

  // Cidades / Bairros (páginas "Regiões Atendidas")
  console.log("\n   Populando cidades...");
  const cidadeIdBySlug = new Map<string, string>();
  for (const c of CIDADES) {
    const cidade = await prisma.cidade.upsert({
      where:  { slug: c.slug },
      update: {},
      create: {
        nome:            c.nome,
        slug:            c.slug,
        ativo:           c.ativo,
        textoIntro:      c.textoIntro,
        metaDescription: c.metaDescription,
      },
    });
    cidadeIdBySlug.set(c.slug, cidade.id);
  }
  console.log(`   ✓ ${CIDADES.length} cidades`);

  console.log("   Populando bairros...");
  const bairroIdByKey = new Map<string, string>(); // `${cidadeSlug}:${nome}` -> id
  for (const b of BAIRROS) {
    const cidadeId = cidadeIdBySlug.get(b.cidadeSlug)!;
    const slug = slugify(b.nome);
    const bairro = await prisma.bairro.upsert({
      where:  { cidadeId_slug: { cidadeId, slug } },
      update: {},
      create: {
        cidadeId,
        nome:                  b.nome,
        slug,
        textoMorar:            b.textoMorar,
        metaDescription:       b.metaDescription,
        ativo:                 true,
        criadoAutomaticamente: false,
      },
    });
    bairroIdByKey.set(`${b.cidadeSlug}:${b.nome}`, bairro.id);
  }
  console.log(`   ✓ ${BAIRROS.length} bairros`);

  console.log("   Linkando bairros próximos...");
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

  console.log(`\n✅ Seed concluído.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
