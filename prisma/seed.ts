import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, LeadStatus, LeadSource, BudgetRange, Region } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

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

  console.log(`\n✅ Seed concluído.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
