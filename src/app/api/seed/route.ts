import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

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
