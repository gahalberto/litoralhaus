/**
 * Dados de seed compartilhados entre prisma/seed.ts (local), prisma/seed-deploy.ts
 * (roda no build da Vercel) e src/app/api/seed/route.ts (gatilho manual em prod).
 */

export const HIGHLIGHTS = [
  "Frente mar", "Vista para o mar", "Vista para o canal", "Pé na areia",
  "Varanda gourmet", "Varanda frente mar", "Pier privativo", "Acesso ao canal",
  "Área de lazer completa", "Alto padrão de acabamento", "Cozinha planejada",
  "Closet", "Suíte máster ampla", "Cobertura duplex", "Penthouse",
  "Andar alto", "Posição solar privilegiada", "Condomínio de luxo",
  "Segurança 24h", "Portaria blindada",
];

export const AMENITIES = [
  "Piscina", "Piscina privativa", "Piscina aquecida", "Sauna", "Academia",
  "Espaço gourmet", "Churrasqueira", "Salão de festas", "Playground",
  "Quadra poliesportiva", "Quadra de tênis", "Campo de futebol",
  "Espaço kids", "Brinquedoteca", "Home theater", "Coworking",
  "Lavanderia coletiva", "Depósito privativo", "Gerador", "Pet place",
];

// ─── Cidades / Bairros (páginas "Regiões Atendidas" — SEO) ────────────────────
// Baixada Santista. Slugs de Guarujá/Santos/São Vicente/Praia Grande/Bertioga
// alinhados a REGION_SLUG (src/lib/seo-slugs.ts) — essas 5 já existem como
// enum Region e por isso recebem vínculo automático de imóvel → bairro.
// Cubatão, Mongaguá, Itanhaém e Peruíbe ainda não existem no enum Region;
// entram só como página de cidade (sem vínculo automático de imóvel por ora).

export type CidadeSeed = {
  nome: string;
  slug: string;
  ativo: boolean;
  textoIntro?: string;
  metaDescription?: string;
};

export const CIDADES: CidadeSeed[] = [
  {
    nome: "Guarujá", slug: "guaruja", ativo: true,
    textoIntro:
      "<p>O Guarujá é o principal destino do litoral paulista para quem busca praia, qualidade de vida e proximidade com São Paulo — cerca de 1h30 de carro da capital. A cidade reúne desde bairros tradicionais e badalados, como Pitangueiras e Astúrias, até regiões mais reservadas e residenciais, como a Enseada.</p><p>Com mais de 15 praias, forte infraestrutura de comércio, gastronomia e serviços, o Guarujá atrai tanto quem procura casa de temporada quanto quem decide morar fixo na cidade.</p>",
    metaDescription: "Conheça os bairros do Guarujá: como é morar em cada região, preços médios e imóveis disponíveis com a LitoralHaus.",
  },
  {
    nome: "Santos", slug: "santos", ativo: true,
    textoIntro:
      "<p>Santos é referência de qualidade de vida na Baixada Santista, com o maior jardim urbano à beira-mar do mundo, infraestrutura completa de saúde, educação e transporte, e bairros bem definidos ao longo da orla, como Gonzaga, Boqueirão e Ponta da Praia.</p><p>A cidade combina a rotina de um centro urbano consolidado com a praia a poucos minutos de casa, o que a torna uma opção tanto para moradia permanente quanto para investimento.</p>",
    metaDescription: "Conheça os bairros de Santos: como é morar em cada região, preços médios e imóveis disponíveis com a LitoralHaus.",
  },
  { nome: "São Vicente",  slug: "sao-vicente",   ativo: false },
  { nome: "Praia Grande", slug: "praia-grande",  ativo: false },
  { nome: "Bertioga",     slug: "bertioga",      ativo: false },
  { nome: "Cubatão",      slug: "cubatao",       ativo: false },
  { nome: "Mongaguá",     slug: "mongagua",      ativo: false },
  { nome: "Itanhaém",     slug: "itanhaem",      ativo: false },
  { nome: "Peruíbe",      slug: "peruibe",       ativo: false },
];

export type BairroSeed = {
  cidadeSlug: string;
  nome: string;
  textoMorar: string;
  metaDescription?: string;
  proximosDe?: string[]; // nomes de outros bairros da mesma cidade
};

function placeholderTexto(nome: string): string {
  return `<p>[Rascunho] Descreva aqui como é morar em ${nome}: infraestrutura, perfil de quem mora, proximidade da praia, comércio e mobilidade. Este texto foi gerado como placeholder e precisa ser revisado e ativado no admin antes de aparecer no site.</p>`;
}

// Bairros ficam ativo:false (rascunho) de propósito — revisar e ativar no admin.
export const BAIRROS: BairroSeed[] = [
  { cidadeSlug: "guaruja", nome: "Astúrias",            textoMorar: placeholderTexto("Astúrias"),            proximosDe: ["Pitangueiras"] },
  { cidadeSlug: "guaruja", nome: "Enseada",              textoMorar: placeholderTexto("Enseada"),              proximosDe: ["Praia da Enseada"] },
  { cidadeSlug: "guaruja", nome: "Pitangueiras",         textoMorar: placeholderTexto("Pitangueiras"),         proximosDe: ["Astúrias"] },
  { cidadeSlug: "guaruja", nome: "Jardim Três Marias",   textoMorar: placeholderTexto("Jardim Três Marias") },
  { cidadeSlug: "guaruja", nome: "Praia da Enseada",     textoMorar: placeholderTexto("Praia da Enseada"),     proximosDe: ["Enseada"] },

  { cidadeSlug: "santos", nome: "Gonzaga",               textoMorar: placeholderTexto("Gonzaga"),              proximosDe: ["Boqueirão", "Embaré"] },
  { cidadeSlug: "santos", nome: "Ponta da Praia",        textoMorar: placeholderTexto("Ponta da Praia") },
  { cidadeSlug: "santos", nome: "Boqueirão",             textoMorar: placeholderTexto("Boqueirão"),            proximosDe: ["Gonzaga", "Embaré"] },
  { cidadeSlug: "santos", nome: "Aparecida",             textoMorar: placeholderTexto("Aparecida") },
  { cidadeSlug: "santos", nome: "Embaré",                textoMorar: placeholderTexto("Embaré"),               proximosDe: ["Gonzaga", "Boqueirão"] },
];
