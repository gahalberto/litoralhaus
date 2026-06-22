import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Bots comuns que não devem incrementar views
const BOT_UA = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|discord|preview/i;

export async function POST(req: NextRequest) {
  // Ignora bots
  const ua = req.headers.get("user-agent") ?? "";
  if (BOT_UA.test(ua)) {
    return NextResponse.json({ ok: true });
  }

  let body: { type: string; slug: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const { type, slug } = body;
  if (!type || !slug) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  try {
    if (type === "blog") {
      await prisma.post.updateMany({
        where: { slug, published: true },
        data:  { viewCount: { increment: 1 } },
      });
    } else if (type === "property") {
      await prisma.property.updateMany({
        where: { slug, status: "DISPONIVEL" },
        data:  { viewCount: { increment: 1 }, lastViewedAt: new Date() },
      });
    } else {
      return NextResponse.json({ error: "unknown type" }, { status: 400 });
    }
  } catch {
    // Falha silenciosa — view não é crítico
  }

  return NextResponse.json({ ok: true });
}
