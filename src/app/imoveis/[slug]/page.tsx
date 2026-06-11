import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Bed, Bath, Maximize, Car, MapPin } from "lucide-react";
import { getPublicPropertyBySlug } from "@/lib/public-properties";
import { PROPERTY_TYPE_LABELS, REGION_LABELS, formatPrice } from "@/lib/property-config";
import { PropertyJsonLd } from "@/components/json-ld";
import { PropertyGalleryWide } from "@/components/property-gallery-wide";
import { PropertyMediaTabs } from "@/components/property-media-tabs";
import { PropertyPricingCard } from "@/components/property-pricing-card";
import { Footer } from "@/components/sections/Footer";

const BASE = "https://litoralhaus.com.br";

// ─── Metadata dinâmica ────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPublicPropertyBySlug(slug);
  if (!p) return { title: "Imóvel não encontrado" };

  const canonicalUrl = `${BASE}/imoveis/${slug}`;
  const title =
    p.seoTitle ||
    `${PROPERTY_TYPE_LABELS[p.type]} ${p.neighborhood} ${REGION_LABELS[p.region]} | Litoral Haus`;

  const rawDesc =
    p.seoDescription ||
    (p.description ? p.description.split("\n")[0].slice(0, 155) : null) ||
    `${PROPERTY_TYPE_LABELS[p.type]} à venda em ${p.neighborhood}, ${p.city}.${
      p.bedrooms ? ` ${p.bedrooms} dormitórios.` : ""
    }${p.areaTotal ? ` ${Number(p.areaTotal).toLocaleString("pt-BR")} m².` : ""}${
      p.priceAsk ? " " + formatPrice(p.priceAsk) + "." : ""
    } Litoral Haus.`;

  const description = rawDesc.length > 160 ? rawDesc.slice(0, 157) + "…" : rawDesc;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "website", locale: "pt_BR", url: canonicalUrl,
      siteName: "Litoral Haus", title, description,
      images: p.images[0] ? [{ url: p.images[0], width: 1200, height: 630, alt: p.title }] : [],
    },
    twitter: { card: "summary_large_image", title, description, images: p.images[0] ? [p.images[0]] : [] },
    robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  };
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await getPublicPropertyBySlug(slug);
  if (!p) notFound();

  const canonicalUrl = `${BASE}/imoveis/${slug}`;
  const whatsappHref = `https://wa.me/5513000000000?text=${encodeURIComponent(
    `Olá! Tenho interesse no imóvel: ${p.title} — ${canonicalUrl}`
  )}`;

  // H1 dinâmico estilo portal
  const h1Parts = [
    PROPERTY_TYPE_LABELS[p.type],
    "à venda",
    p.areaTotal ? `com ${Number(p.areaTotal).toLocaleString("pt-BR")}m²` : null,
    p.bedrooms != null ? `${p.bedrooms} ${p.bedrooms === 1 ? "quarto" : "quartos"}` : null,
    p.parkingSpots != null
      ? p.parkingSpots === 0 ? "sem vaga" : `${p.parkingSpots} ${p.parkingSpots === 1 ? "vaga" : "vagas"}`
      : null,
  ].filter(Boolean).join(", ");

  const specs = [
    { icon: <Maximize size={18} className="text-amber-500" />, value: p.areaTotal ? `${Number(p.areaTotal).toLocaleString("pt-BR")} m²` : "—", label: "Área total" },
    { icon: <Bed       size={18} className="text-amber-500" />, value: p.bedrooms  != null ? `${p.bedrooms}`  : "—", label: "Dormitórios" },
    { icon: <Car       size={18} className="text-amber-500" />, value: p.parkingSpots != null ? `${p.parkingSpots}` : "—", label: "Vagas" },
    { icon: <Bath      size={18} className="text-amber-500" />, value: p.bathrooms != null ? `${p.bathrooms}` : "—", label: "Banheiros" },
  ];

  return (
    <>
      <PropertyJsonLd
        slug={p.slug} title={p.title} description={p.description} type={p.type}
        city={p.city} neighborhood={p.neighborhood} region={p.region}
        priceAsk={p.priceAsk ? String(p.priceAsk) : null}
        priceRent={p.priceRent ? String(p.priceRent) : null}
        bedrooms={p.bedrooms} bathrooms={p.bathrooms}
        areaTotal={p.areaTotal ? String(p.areaTotal) : null}
        images={p.images}
      />

      {/* ── Header escuro ──────────────────────────────────────────────────── */}
      <header className="bg-zinc-950">
        {/* Navegação */}
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="font-cormorant text-xl font-light tracking-wider text-white">
            Litoral Haus
          </Link>
          <nav className="hidden items-center gap-8 sm:flex">
            <Link href="/imoveis" className="font-inter text-xs uppercase tracking-widest text-white/60 transition hover:text-white">
              Imóveis
            </Link>
            <Link href="/comprar/guaruja" className="font-inter text-xs uppercase tracking-widest text-white/60 transition hover:text-white">
              Guarujá
            </Link>
            <Link href="/comprar/santos" className="font-inter text-xs uppercase tracking-widest text-white/60 transition hover:text-white">
              Santos
            </Link>
          </nav>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-white/20 px-4 py-2 font-inter text-xs font-medium text-white transition hover:border-amber-400 hover:text-amber-400"
          >
            Fale com a gente
          </a>
        </div>

        {/* Breadcrumb */}
        <div className="border-t border-white/5">
          <nav aria-label="Breadcrumb" className="mx-auto flex max-w-6xl items-center gap-1.5 overflow-x-auto px-6 py-3 font-inter text-xs text-white/40 whitespace-nowrap">
            <Link href="/" className="transition hover:text-white">Litoral Haus</Link>
            <span>/</span>
            <Link href="/imoveis" className="transition hover:text-white">{PROPERTY_TYPE_LABELS[p.type]}s</Link>
            <span>/</span>
            <Link href={`/imoveis?region=${p.region}`} className="transition hover:text-white">{REGION_LABELS[p.region]}</Link>
            <span>/</span>
            <Link href={`/imoveis?region=${p.region}&neighborhood=${encodeURIComponent(p.neighborhood)}`} className="transition hover:text-white">{p.neighborhood}</Link>
            <span>/</span>
            <span className="text-white/60 truncate max-w-52">{p.title}</span>
          </nav>
        </div>
      </header>

      {/* ── Galeria hero ───────────────────────────────────────────────────── */}
      <PropertyGalleryWide images={p.images} title={p.title} />

      {/* ── Grid principal ─────────────────────────────────────────────────── */}
      <main className="bg-gray-50 pb-20">
        <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-3">

            {/* ── Coluna esquerda (2/3) ──────────────────────────────────── */}
            <div className="min-w-0 space-y-8 lg:col-span-2">

              {/* Abas + compartilhar */}
              <div className="bg-white shadow-sm">
                <PropertyMediaTabs whatsappHref={whatsappHref} pageUrl={canonicalUrl} />
              </div>

              {/* Título + endereço */}
              <div className="bg-white p-6 shadow-sm">
                <p className="mb-2 font-inter text-[10px] uppercase tracking-widest text-amber-600">
                  {PROPERTY_TYPE_LABELS[p.type]} · {REGION_LABELS[p.region]}
                </p>
                <h1 className="font-inter text-2xl font-bold leading-snug text-gray-900 sm:text-3xl">
                  {h1Parts}
                </h1>
                <div className="mt-3 flex items-center gap-1.5 text-gray-500">
                  <MapPin size={14} className="shrink-0 text-amber-500" />
                  <span className="font-inter text-sm">
                    {[p.address, p.neighborhood, p.city, "SP"].filter(Boolean).join(", ")}
                  </span>
                </div>
              </div>

              {/* Características */}
              <div className="bg-white p-6 shadow-sm">
                <h2 className="mb-5 font-inter text-[11px] uppercase tracking-widest text-gray-400">
                  Características
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {specs.map((s) => (
                    <div key={s.label} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                      {s.icon}
                      <div>
                        <p className="font-inter text-base font-bold text-gray-900">{s.value}</p>
                        <p className="font-inter text-[10px] uppercase tracking-wide text-gray-400">{s.label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Extras: suítes, área útil */}
                {(p.suites || p.areaUsable) && (
                  <div className="mt-3 flex flex-wrap gap-3">
                    {p.suites != null && (
                      <span className="rounded-full bg-amber-50 px-3 py-1 font-inter text-xs text-amber-700">
                        {p.suites} suíte{p.suites !== 1 ? "s" : ""}
                      </span>
                    )}
                    {p.areaUsable && (
                      <span className="rounded-full bg-amber-50 px-3 py-1 font-inter text-xs text-amber-700">
                        {Number(p.areaUsable).toLocaleString("pt-BR")} m² úteis
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Descrição */}
              {p.description && (
                <div className="bg-white p-6 shadow-sm">
                  <h2 className="mb-4 font-inter text-[11px] uppercase tracking-widest text-gray-400">
                    Sobre o imóvel
                  </h2>
                  <div className="space-y-3 font-inter text-sm leading-relaxed text-gray-600 whitespace-pre-line">
                    {p.description}
                  </div>
                </div>
              )}

              {/* Diferenciais + Comodidades */}
              {(p.highlights.length > 0 || p.amenities.length > 0) && (
                <div className="bg-white p-6 shadow-sm">
                  {p.highlights.length > 0 && (
                    <div className="mb-6">
                      <h2 className="mb-4 font-inter text-[11px] uppercase tracking-widest text-gray-400">
                        Diferenciais
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {p.highlights.map((h) => (
                          <span key={h.highlight.label} className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 font-inter text-xs text-amber-700">
                            {h.highlight.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {p.amenities.length > 0 && (
                    <div>
                      <h2 className="mb-4 font-inter text-[11px] uppercase tracking-widest text-gray-400">
                        Comodidades
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {p.amenities.map((a) => (
                          <span key={a.amenity.label} className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 font-inter text-xs text-gray-600">
                            {a.amenity.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Custos */}
              {(p.condoFee || p.iptu) && (
                <div className="bg-white p-6 shadow-sm">
                  <h2 className="mb-4 font-inter text-[11px] uppercase tracking-widest text-gray-400">
                    Custos mensais
                  </h2>
                  <div className="flex flex-wrap gap-6">
                    {p.condoFee && (
                      <div>
                        <p className="font-inter text-xl font-bold text-gray-900">{formatPrice(p.condoFee)}</p>
                        <p className="font-inter text-[11px] uppercase tracking-wide text-gray-400">Condomínio/mês</p>
                      </div>
                    )}
                    {p.iptu && (
                      <div>
                        <p className="font-inter text-xl font-bold text-gray-900">{formatPrice(p.iptu)}</p>
                        <p className="font-inter text-[11px] uppercase tracking-wide text-gray-400">IPTU/ano</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* ── Coluna direita sticky (1/3) ────────────────────────────── */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <PropertyPricingCard
                  type={p.type}
                  priceAsk={p.priceAsk ? String(p.priceAsk) : null}
                  priceRent={p.priceRent ? String(p.priceRent) : null}
                  city={p.city}
                  neighborhood={p.neighborhood}
                  whatsappHref={whatsappHref}
                />

                {/* CTA secundário mobile — visível só em mobile, abaixo do card */}
                <div className="mt-4 rounded-xl border border-border bg-background p-4 text-center lg:hidden">
                  <p className="font-inter text-xs text-muted-foreground">
                    Dúvidas? Nossa equipe responde em minutos.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
