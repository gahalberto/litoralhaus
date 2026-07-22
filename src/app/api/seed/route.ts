import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { slugify } from "@/lib/slugify";
import { HIGHLIGHTS, AMENITIES, CIDADES, BAIRROS } from "@/lib/seed-data";

// Rota de seed de produção — protegida por SEED_SECRET
// Use apenas uma vez e depois remova a variável de ambiente para desativar.
// POST /api/seed   Header: x-seed-secret: <SEED_SECRET>
//               ou Query:  ?secret=<SEED_SECRET>

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

  // ── Cidades / Bairros (páginas "Regiões Atendidas") ──────────────────────────
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
        // Rascunho — revisar e ativar no admin (/admin/bairros?status=rascunho)
        ativo: false, criadoAutomaticamente: false,
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
