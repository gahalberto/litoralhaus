import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/sections/Footer";
import { BreadcrumbJsonLd } from "@/components/json-ld";

const BASE = "https://litoralhaus.com.br";

async function getCidade(slug: string) {
  return prisma.cidade.findUnique({
    where: { slug },
    include: {
      bairros: { where: { ativo: true }, orderBy: { nome: "asc" } },
    },
  });
}

export async function generateStaticParams() {
  const cidades = await prisma.cidade.findMany({ where: { ativo: true }, select: { slug: true } });
  return cidades.map((c) => ({ cidade: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cidade: string }>;
}): Promise<Metadata> {
  const { cidade: slug } = await params;
  const cidade = await getCidade(slug);
  if (!cidade || !cidade.ativo) return { title: "Página não encontrada" };

  const title = `Bairros de ${cidade.nome}/${cidade.uf}`;
  const description =
    cidade.metaDescription ||
    `Conheça os bairros de ${cidade.nome}, ${cidade.uf} — como é morar em cada um, preços médios e imóveis disponíveis.`;
  const url = `${BASE}/regioes/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title, description, url, type: "website", locale: "pt_BR",
      ...(cidade.imagemUrl && { images: [{ url: cidade.imagemUrl, width: 1200, height: 630, alt: cidade.nome }] }),
    },
  };
}

export default async function CidadePage({
  params,
}: {
  params: Promise<{ cidade: string }>;
}) {
  const { cidade: slug } = await params;
  const cidade = await getCidade(slug);
  if (!cidade || !cidade.ativo) notFound();

  const pageUrl = `${BASE}/regioes/${slug}`;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Início",  url: BASE },
          { name: "Regiões", url: `${BASE}/regioes` },
          { name: cidade.nome, url: pageUrl },
        ]}
      />
      <Navbar />
      <div className="min-h-screen bg-background text-foreground">
        {/* Hero com foto da cidade */}
        <div className="relative flex min-h-105 items-end overflow-hidden sm:min-h-120">
          {cidade.imagemUrl ? (
            <Image
              src={cidade.imagemUrl}
              alt={cidade.nome}
              fill
              priority
              sizes="100vw"
              quality={85}
              className="object-cover"
            />
          ) : (
            <div
              aria-hidden
              className="absolute inset-0 bg-linear-to-br from-stone-950 via-stone-900 to-amber-950"
            />
          )}
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-stone-950/60" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-linear-to-b from-stone-950/50 via-transparent to-stone-950/85"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(180,140,80,0.15),transparent)]"
          />

          <div className="relative z-10 w-full px-6 pb-10 pt-28">
            <div className="mx-auto max-w-5xl">
              <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 font-inter text-xs text-white/50">
                <Link href="/" className="transition-colors hover:text-white">Início</Link>
                <span>/</span>
                <Link href="/regioes" className="transition-colors hover:text-white">Regiões Atendidas</Link>
                <span>/</span>
                <span className="font-medium text-white">{cidade.nome}</span>
              </nav>
              <p className="mb-2 font-inter text-xs font-medium uppercase tracking-[0.3em] text-amber-400/90">
                {cidade.uf} · Baixada Santista
              </p>
              <h1 className="font-cormorant text-4xl font-light text-stone-50 sm:text-5xl md:text-6xl">
                Bairros de {cidade.nome}
              </h1>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-6 py-12 space-y-12">
          {cidade.textoIntro && (
            <div
              className="article-content max-w-none"
              dangerouslySetInnerHTML={{ __html: cidade.textoIntro }}
            />
          )}

          {cidade.bairros.length === 0 ? (
            <p className="py-12 text-center font-cormorant text-2xl font-light text-muted-foreground">
              Bairros em breve.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cidade.bairros.map((b) => (
                <Link
                  key={b.id}
                  href={`/regioes/${slug}/${b.slug}`}
                  className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-amber-400/50"
                >
                  <h2 className="font-cormorant text-xl font-light text-foreground group-hover:text-amber-600 transition-colors">
                    {b.nome}
                  </h2>
                  <p className="mt-1 font-inter text-xs text-muted-foreground">
                    Como é morar em {b.nome} →
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
