import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getPublicProperties } from "@/lib/public-properties";
import { formatPrice } from "@/lib/property-config";
import { PropertyCard } from "@/components/property-card";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/sections/Footer";
import { BreadcrumbJsonLd, PlaceJsonLd } from "@/components/json-ld";

const BASE = "https://litoralhaus.com.br";
const PAGE_SIZE = 9;
const WA_PHONE = "5513955422935";

async function getBairro(cidadeSlug: string, bairroSlug: string) {
  const cidade = await prisma.cidade.findUnique({ where: { slug: cidadeSlug } });
  if (!cidade) return null;
  const bairro = await prisma.bairro.findUnique({
    where: { cidadeId_slug: { cidadeId: cidade.id, slug: bairroSlug } },
    include: { bairrosProximos: { where: { ativo: true }, select: { nome: true, slug: true } } },
  });
  if (!bairro) return null;
  return { cidade, bairro };
}

export async function generateStaticParams() {
  const bairros = await prisma.bairro.findMany({
    where: { ativo: true, cidade: { ativo: true } },
    select: { slug: true, cidade: { select: { slug: true } } },
  });
  return bairros.map((b) => ({ cidade: b.cidade.slug, bairro: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cidade: string; bairro: string }>;
}): Promise<Metadata> {
  const { cidade: cidadeSlug, bairro: bairroSlug } = await params;
  const found = await getBairro(cidadeSlug, bairroSlug);
  if (!found || !found.bairro.ativo || !found.cidade.ativo) return { title: "Página não encontrada" };

  const { cidade, bairro } = found;
  const title = `${bairro.nome}, ${cidade.nome}/SP - Como é morar no bairro?`;
  const description =
    bairro.metaDescription ||
    `Como é morar em ${bairro.nome}, ${cidade.nome}: infraestrutura, perfil do bairro, preços médios e imóveis disponíveis.`;
  const url = `${BASE}/regioes/${cidadeSlug}/${bairroSlug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title, description, url, type: "website", locale: "pt_BR",
      ...(found.cidade.imagemUrl && { images: [{ url: found.cidade.imagemUrl, width: 1200, height: 630, alt: bairro.nome }] }),
    },
  };
}

export default async function BairroPage({
  params,
  searchParams,
}: {
  params: Promise<{ cidade: string; bairro: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const { cidade: cidadeSlug, bairro: bairroSlug } = await params;
  const sp = await searchParams;
  const found = await getBairro(cidadeSlug, bairroSlug);
  if (!found || !found.bairro.ativo || !found.cidade.ativo) notFound();

  const { cidade, bairro } = found;
  const pageUrl = `${BASE}/regioes/${cidadeSlug}/${bairroSlug}`;
  const waHref = `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(
    `Olá! Quero saber mais sobre imóveis no bairro ${bairro.nome}, ${cidade.nome} — ${pageUrl}`
  )}`;

  const imoveisNoBairro = await getPublicProperties({ neighborhood: bairro.nome });
  const pagina = Math.max(1, Number(sp.pagina) || 1);
  const totalPaginas = Math.max(1, Math.ceil(imoveisNoBairro.length / PAGE_SIZE));
  const imoveis = imoveisNoBairro.slice((pagina - 1) * PAGE_SIZE, pagina * PAGE_SIZE);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Início",  url: BASE },
          { name: "Regiões", url: `${BASE}/regioes` },
          { name: cidade.nome, url: `${BASE}/regioes/${cidadeSlug}` },
          { name: bairro.nome, url: pageUrl },
        ]}
      />
      <PlaceJsonLd
        name={`${bairro.nome}, ${cidade.nome}`}
        addressLocality={cidade.nome}
        url={pageUrl}
        description={bairro.metaDescription ?? undefined}
        image={cidade.imagemUrl}
        latitude={bairro.latitude != null ? Number(bairro.latitude) : null}
        longitude={bairro.longitude != null ? Number(bairro.longitude) : null}
      />
      <Navbar />
      <div className="min-h-screen bg-background text-foreground">
        {/* Hero */}
        <div className="relative flex min-h-105 items-center overflow-hidden sm:min-h-130">
          {cidade.imagemUrl ? (
            <Image
              src={cidade.imagemUrl}
              alt=""
              fill
              priority
              sizes="100vw"
              quality={85}
              className="object-cover"
              aria-hidden
            />
          ) : (
            <div
              aria-hidden
              className="absolute inset-0 bg-linear-to-br from-stone-950 via-stone-900 to-amber-950"
            />
          )}
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-stone-950/75" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-linear-to-b from-stone-950/40 via-stone-950/60 to-stone-950/90"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_20%_20%,rgba(217,159,60,0.25),transparent)]"
          />

          <div className="relative z-10 w-full px-6 pb-12 pt-28">
            <div className="mx-auto max-w-5xl">
              <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 font-inter text-xs text-white/50">
                <Link href="/" className="transition-colors hover:text-white">Início</Link>
                <span>/</span>
                <Link href="/regioes" className="transition-colors hover:text-white">Regiões Atendidas</Link>
                <span>/</span>
                <Link href={`/regioes/${cidadeSlug}`} className="transition-colors hover:text-white">{cidade.nome}</Link>
                <span>/</span>
                <span className="font-medium text-white">{bairro.nome}</span>
              </nav>

              <h1 className="font-cormorant text-5xl font-light leading-[1.05] text-stone-50 sm:text-6xl md:text-7xl">
                Como é morar em{" "}
                <em className="font-light not-italic text-amber-300">{bairro.nome}</em>
              </h1>
              <p className="mt-4 font-inter text-lg font-medium text-stone-300 sm:text-xl">
                {cidade.nome}, São Paulo
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <a
                  href="#morar"
                  className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 font-inter text-sm font-semibold text-stone-950 shadow-lg shadow-amber-950/30 transition hover:bg-amber-300"
                >
                  Conhecer o bairro
                </a>
                <a
                  href="#imoveis"
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3 font-inter text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  Imóveis no bairro
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-6 py-12 space-y-14">
          {/* Morar no bairro */}
          {bairro.textoMorar && (
            <section id="morar" className="scroll-mt-24">
              <h2 className="mb-4 font-inter text-[11px] uppercase tracking-widest text-muted-foreground">
                Morar em {bairro.nome}
              </h2>
              <div
                className="article-content max-w-none"
                dangerouslySetInnerHTML={{ __html: bairro.textoMorar }}
              />
            </section>
          )}

          {/* Quanto custa */}
          {(bairro.aluguelMedio || bairro.vendaMedia) && (
            <section>
              <h2 className="mb-4 font-inter text-[11px] uppercase tracking-widest text-muted-foreground">
                Quanto custa morar em {bairro.nome}
              </h2>
              <div className="flex flex-wrap gap-8">
                {bairro.aluguelMedio && (
                  <div>
                    <p className="font-cormorant text-3xl font-light text-foreground">
                      {formatPrice(bairro.aluguelMedio.toString())}
                      <span className="ml-1 font-inter text-sm text-muted-foreground">/mês</span>
                    </p>
                    <p className="font-inter text-xs uppercase tracking-wide text-muted-foreground">Aluguel médio</p>
                  </div>
                )}
                {bairro.vendaMedia && (
                  <div>
                    <p className="font-cormorant text-3xl font-light text-foreground">
                      {formatPrice(bairro.vendaMedia.toString())}
                    </p>
                    <p className="font-inter text-xs uppercase tracking-wide text-muted-foreground">Venda média</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Imóveis no bairro */}
          <section id="imoveis" className="scroll-mt-24">
            <div className="mb-6 flex items-baseline justify-between gap-4">
              <h2 className="font-inter text-[11px] uppercase tracking-widest text-muted-foreground">
                Imóveis em {bairro.nome}
              </h2>
              <span className="font-inter text-xs text-muted-foreground">
                {imoveisNoBairro.length} {imoveisNoBairro.length === 1 ? "imóvel" : "imóveis"}
              </span>
            </div>
            {imoveis.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border py-16 text-center font-cormorant text-xl font-light text-muted-foreground">
                Nenhum imóvel disponível em {bairro.nome} no momento.
              </p>
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {imoveis.map((p) => (
                    <PropertyCard key={p.id} p={p} />
                  ))}
                </div>
                {totalPaginas > 1 && (
                  <div className="mt-8 flex justify-center gap-2">
                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                      <Link
                        key={n}
                        href={`${pageUrl}${n > 1 ? `?pagina=${n}` : ""}`}
                        className={`rounded-full border px-3.5 py-1.5 font-inter text-xs transition-colors ${
                          n === pagina
                            ? "border-amber-400 bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-400"
                            : "border-border text-muted-foreground hover:border-amber-300"
                        }`}
                      >
                        {n}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>

          {/* Bairros próximos */}
          {bairro.bairrosProximos.length > 0 && (
            <section>
              <h2 className="mb-4 font-inter text-[11px] uppercase tracking-widest text-muted-foreground">
                Bairros próximos
              </h2>
              <div className="flex flex-wrap gap-2">
                {bairro.bairrosProximos.map((b) => (
                  <Link
                    key={b.slug}
                    href={`/regioes/${cidadeSlug}/${b.slug}`}
                    className="rounded-full border border-border px-3.5 py-1.5 font-inter text-xs text-foreground transition-colors hover:border-amber-400 hover:text-amber-600"
                  >
                    {b.nome}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="rounded-2xl border border-amber-400/30 bg-amber-50/50 p-8 text-center dark:bg-amber-400/5">
            <h2 className="font-cormorant text-2xl font-light text-foreground">
              Quer morar em {bairro.nome}?
            </h2>
            <p className="mx-auto mt-2 max-w-md font-inter text-sm text-muted-foreground">
              Fale com a LitoralHaus e encontre o imóvel ideal em {bairro.nome}, {cidade.nome}.
            </p>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-6 py-3 font-inter text-sm font-medium text-white transition hover:bg-[#20b958]"
            >
              Falar com a LitoralHaus
            </a>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
