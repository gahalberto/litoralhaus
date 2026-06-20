import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Bed, Bath, Maximize, Car, MapPin } from "lucide-react";
import { getPublicPropertyBySlug } from "@/lib/public-properties";
import { PROPERTY_TYPE_LABELS, PROPERTY_TYPE_PLURAL, REGION_LABELS, formatPrice } from "@/lib/property-config";
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
  const whatsappHref = `https://wa.me/5513955422935?text=${encodeURIComponent(
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
            <Link href="/" className="transition-colors hover:text-white">Litoral Haus</Link>
            <span className="select-none">/</span>
            <Link href={`/imoveis?type=${p.type}`} className="transition-colors hover:text-white">{PROPERTY_TYPE_PLURAL[p.type]}</Link>
            <span className="select-none">/</span>
            <Link href={`/imoveis?type=${p.type}&region=${p.region}`} className="transition-colors hover:text-white">{REGION_LABELS[p.region]}</Link>
            <span className="select-none">/</span>
            <Link href={`/imoveis?type=${p.type}&region=${p.region}&neighborhood=${encodeURIComponent(p.neighborhood)}`} className="transition-colors hover:text-white">{p.neighborhood}</Link>
            <span className="select-none">/</span>
            <span className="max-w-52 truncate text-white/60">{p.title}</span>
          </nav>
        </div>
      </header>

      {/* ── Galeria hero ───────────────────────────────────────────────────── */}
      <PropertyGalleryWide images={p.images} title={p.title} />

      {/* ── Grid principal ─────────────────────────────────────────────────── */}
      <main className="bg-gray-50 pb-28 lg:pb-20">
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
                    {[
                      p.address,
                      p.showAddressNumber && p.addressNumber ? p.addressNumber : null,
                      p.neighborhood,
                      p.city,
                      "SP",
                    ].filter(Boolean).join(", ")}
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
                  acceptsFinancing={p.acceptsFinancing}
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

      {/* ── Botão flutuante WhatsApp — só mobile ───────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 lg:hidden">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#25D366] py-4 font-inter text-base font-bold text-white shadow-2xl shadow-green-900/40 transition hover:bg-[#20b958] active:scale-[0.98]"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Tenho interesse — falar agora
        </a>
      </div>
    </>
  );
}
