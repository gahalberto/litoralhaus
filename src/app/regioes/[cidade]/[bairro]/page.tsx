import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Home, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getBairroCarouselProperties } from "@/lib/public-properties";
import { formatPrice } from "@/lib/property-config";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/sections/Footer";
import { BreadcrumbJsonLd, PlaceJsonLd } from "@/components/json-ld";
import { BairroNav } from "@/components/regioes/BairroNav";
import { ImoveisCarousel } from "@/components/regioes/ImoveisCarousel";

const BASE = "https://litoralhaus.com.br";
const WA_PHONE = "5513955422935";

const CARD_COLORS = [
  "bg-amber-100 text-amber-900 dark:bg-amber-400/15 dark:text-amber-300",
  "bg-stone-100 text-stone-900 dark:bg-stone-800 dark:text-stone-200",
  "bg-emerald-100 text-emerald-900 dark:bg-emerald-400/15 dark:text-emerald-300",
];

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
}: {
  params: Promise<{ cidade: string; bairro: string }>;
}) {
  const { cidade: cidadeSlug, bairro: bairroSlug } = await params;
  const found = await getBairro(cidadeSlug, bairroSlug);
  if (!found || !found.bairro.ativo || !found.cidade.ativo) notFound();

  const { cidade, bairro } = found;
  const pageUrl = `${BASE}/regioes/${cidadeSlug}/${bairroSlug}`;
  const waHref = `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(
    `Olá! Quero saber mais sobre imóveis no bairro ${bairro.nome}, ${cidade.nome} — ${pageUrl}`
  )}`;

  const imoveis = await getBairroCarouselProperties(bairro.nome);

  const precosAluguel = imoveis.filter((p) => p.priceRent).map((p) => Number(p.priceRent));
  const precosVenda   = imoveis.filter((p) => p.priceAsk).map((p) => Number(p.priceAsk));
  const aluguelDestaque = bairro.aluguelMedio != null
    ? Number(bairro.aluguelMedio)
    : precosAluguel.length > 0
    ? precosAluguel.reduce((a, b) => a + b, 0) / precosAluguel.length
    : null;
  const vendaDestaque = bairro.vendaMedia != null
    ? Number(bairro.vendaMedia)
    : precosVenda.length > 0
    ? precosVenda.reduce((a, b) => a + b, 0) / precosVenda.length
    : null;
  const aluguelMin = precosAluguel.length ? Math.min(...precosAluguel) : null;
  const aluguelMax = precosAluguel.length ? Math.max(...precosAluguel) : null;

  const nomesProximos = bairro.bairrosProximos.map((b) => b.nome).join(", ");

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

        {/* Navegação sticky */}
        <BairroNav />

        <div className="mx-auto max-w-5xl px-6 py-14 space-y-20">
          {/* Morar */}
          <section id="morar" className="scroll-mt-32">
            <div className="grid gap-10 md:grid-cols-2 md:items-center">
              <div>
                <span className="mb-3 inline-flex items-center gap-2 font-inter text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                  <Home size={14} />
                  Morar
                </span>
                <h2 className="font-inter text-3xl font-bold text-foreground sm:text-4xl">
                  Morar em {bairro.nome}
                </h2>
                {nomesProximos && (
                  <p className="mt-4 font-inter text-base leading-relaxed text-muted-foreground">
                    O bairro {bairro.nome} fica localizado em {cidade.nome}, próximo aos bairros {nomesProximos}. Confira mais informações abaixo!
                  </p>
                )}
                {bairro.textoMorar && (
                  <div
                    className="article-content mt-4 max-w-none"
                    dangerouslySetInnerHTML={{ __html: bairro.textoMorar }}
                  />
                )}
              </div>

              <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-muted">
                {cidade.imagemUrl ? (
                  <Image
                    src={cidade.imagemUrl}
                    alt={`${bairro.nome}, ${cidade.nome}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-amber-100 to-amber-300 dark:from-stone-800 dark:to-stone-900">
                    <Home size={64} className="text-amber-600/40 dark:text-amber-400/30" />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Custo & Valores */}
          <section id="custo" className="scroll-mt-32">
            <h2 className="mb-6 font-inter text-3xl font-bold text-foreground sm:text-4xl">
              Quanto custa morar em {bairro.nome}?
            </h2>

            {!aluguelDestaque && !vendaDestaque ? (
              <p className="font-inter text-sm text-muted-foreground">
                Ainda não temos dados de preço para {bairro.nome}. Fale com a gente para saber mais.
              </p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {aluguelDestaque && (
                  <div className="rounded-2xl border border-amber-400/30 bg-amber-50/60 p-8 dark:bg-amber-400/5">
                    <p className="font-cormorant text-5xl font-bold text-foreground">
                      {formatPrice(aluguelDestaque)}
                    </p>
                    <p className="mt-2 font-inter text-sm text-muted-foreground">
                      É o valor médio para alugar em {bairro.nome}
                    </p>
                    {aluguelMin != null && aluguelMax != null && aluguelMin !== aluguelMax && (
                      <p className="mt-3 font-inter text-xs text-muted-foreground/70">
                        Valores variam entre {formatPrice(aluguelMin)} e {formatPrice(aluguelMax)}
                      </p>
                    )}
                  </div>
                )}
                {vendaDestaque && (
                  <div className="rounded-2xl border border-border bg-card p-8">
                    <p className="font-cormorant text-4xl font-bold text-foreground">
                      {formatPrice(vendaDestaque)}
                    </p>
                    <p className="mt-2 font-inter text-sm text-muted-foreground">
                      É o valor médio para comprar em {bairro.nome}
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Imóveis mais desejados */}
          <section id="imoveis" className="scroll-mt-32">
            <div className="mb-6 flex items-baseline justify-between gap-4">
              <h2 className="font-inter text-3xl font-bold text-foreground sm:text-4xl">
                Imóveis mais desejados em {bairro.nome}
              </h2>
            </div>

            {imoveis.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border py-16 text-center font-cormorant text-xl font-light text-muted-foreground">
                Nenhum imóvel disponível em {bairro.nome} no momento.
              </p>
            ) : (
              <>
                <ImoveisCarousel properties={imoveis} />
                <Link
                  href={`/imoveis?neighborhood=${encodeURIComponent(bairro.nome)}`}
                  className="mt-6 inline-flex items-center gap-1.5 font-inter text-sm font-medium text-amber-600 transition-colors hover:text-amber-500"
                >
                  Ver todos os imóveis em {bairro.nome}
                  <ArrowRight size={14} />
                </Link>
              </>
            )}
          </section>

          {/* Bairros próximos */}
          <section id="proximos" className="scroll-mt-32">
            <h2 className="font-inter text-3xl font-bold text-foreground sm:text-4xl">
              Quais são os bairros próximos de {bairro.nome}?
            </h2>
            {bairro.bairrosProximos.length === 0 ? (
              <p className="mt-4 font-inter text-sm text-muted-foreground">
                Em breve mais bairros vizinhos por aqui.
              </p>
            ) : (
              <>
                <p className="mt-3 font-inter text-base text-muted-foreground">
                  {bairro.nome} fica perto de {nomesProximos}.
                </p>
                <div className="mt-6 flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible">
                  {bairro.bairrosProximos.map((b, i) => (
                    <Link
                      key={b.slug}
                      href={`/regioes/${cidadeSlug}/${b.slug}`}
                      className={`group flex w-48 shrink-0 items-center justify-between gap-3 rounded-2xl p-6 transition-transform hover:-translate-y-0.5 sm:w-auto ${CARD_COLORS[i % CARD_COLORS.length]}`}
                    >
                      <span className="font-cormorant text-xl font-semibold">{b.nome}</span>
                      <ArrowRight size={18} className="shrink-0 transition-transform group-hover:translate-x-1" />
                    </Link>
                  ))}
                </div>
              </>
            )}
          </section>

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
