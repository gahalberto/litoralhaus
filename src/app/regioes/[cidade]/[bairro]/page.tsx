import type { Metadata } from "next";
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
    openGraph: { title, description, url, type: "website", locale: "pt_BR" },
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
        latitude={bairro.latitude != null ? Number(bairro.latitude) : null}
        longitude={bairro.longitude != null ? Number(bairro.longitude) : null}
      />
      <Navbar />
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <div className="border-b border-border px-6 pt-28 pb-10">
          <div className="mx-auto max-w-5xl">
            <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1.5 font-inter text-xs text-muted-foreground">
              <Link href="/" className="hover:text-foreground">Início</Link>
              <span>/</span>
              <Link href="/regioes" className="hover:text-foreground">Regiões</Link>
              <span>/</span>
              <Link href={`/regioes/${cidadeSlug}`} className="hover:text-foreground">{cidade.nome}</Link>
              <span>/</span>
              <span className="text-foreground">{bairro.nome}</span>
            </nav>
            <p className="mb-2 font-inter text-[10px] uppercase tracking-[0.3em] text-amber-500/80">
              {cidade.nome}, São Paulo
            </p>
            <h1 className="font-cormorant text-4xl font-light sm:text-5xl">
              Como é morar em {bairro.nome}
            </h1>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-6 py-12 space-y-14">
          {/* Morar no bairro */}
          {bairro.textoMorar && (
            <section>
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
          <section>
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
