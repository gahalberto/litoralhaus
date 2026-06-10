import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicPropertyBySlug } from "@/lib/public-properties";
import { PROPERTY_TYPE_LABELS, REGION_LABELS, formatPrice } from "@/lib/property-config";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/sections/Footer";
import { PropertyGallery } from "@/components/property-gallery";
import { InterestForm } from "@/components/interest-form";
import { PropertyJsonLd } from "@/components/json-ld";

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

  // Título otimizado: tipo + bairro + cidade
  const title =
    p.seoTitle ||
    `${PROPERTY_TYPE_LABELS[p.type]} ${p.neighborhood} ${REGION_LABELS[p.region]} | Litoral Haus`;

  // Descrição: primeiro parágrafo real da descrição ou gerada
  const rawDesc =
    p.seoDescription ||
    (p.description ? p.description.split("\n")[0].slice(0, 155) : null) ||
    `${PROPERTY_TYPE_LABELS[p.type]} à venda em ${p.neighborhood}, ${p.city}. ${
      p.bedrooms ? `${p.bedrooms} dormitórios. ` : ""
    }${p.areaTotal ? `${Number(p.areaTotal).toLocaleString("pt-BR")} m². ` : ""}${
      p.priceAsk ? formatPrice(p.priceAsk) + "." : ""
    } Litoral Haus.`;

  const description = rawDesc.length > 160 ? rawDesc.slice(0, 157) + "…" : rawDesc;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type:        "website",
      locale:      "pt_BR",
      url:          canonicalUrl,
      siteName:    "Litoral Haus",
      title,
      description,
      images: p.images[0]
        ? [{ url: p.images[0], width: 1200, height: 900, alt: p.title }]
        : [],
    },
    twitter: {
      card:        "summary_large_image",
      title,
      description,
      images:       p.images[0] ? [p.images[0]] : [],
    },
    robots: {
      index:  true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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

  const specs = [
    { label: "Dormitórios", value: p.bedrooms,     unit: "" },
    { label: "Banheiros",   value: p.bathrooms,    unit: "" },
    { label: "Suítes",      value: p.suites,       unit: "" },
    { label: "Vagas",       value: p.parkingSpots, unit: "" },
    { label: "Área total",  value: p.areaTotal ? Number(p.areaTotal).toLocaleString("pt-BR") : null, unit: " m²" },
    { label: "Área útil",   value: p.areaUsable  ? Number(p.areaUsable).toLocaleString("pt-BR")  : null, unit: " m²" },
  ].filter((s) => s.value != null);

  return (
    <>
      <PropertyJsonLd
        slug={p.slug}
        title={p.title}
        description={p.description}
        type={p.type}
        city={p.city}
        neighborhood={p.neighborhood}
        region={p.region}
        priceAsk={p.priceAsk ? String(p.priceAsk) : null}
        priceRent={p.priceRent ? String(p.priceRent) : null}
        bedrooms={p.bedrooms}
        bathrooms={p.bathrooms}
        areaTotal={p.areaTotal ? String(p.areaTotal) : null}
        images={p.images}
      />

      <Navbar />
      <div className="min-h-screen bg-background text-foreground">
        {/* Breadcrumb */}
        <div className="border-b border-border px-6 pt-20 pb-4">
          <div className="mx-auto max-w-6xl">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-inter text-xs text-muted-foreground">
              <Link href="/" className="hover:text-foreground">Home</Link>
              <span aria-hidden>/</span>
              <Link href="/imoveis" className="hover:text-foreground">Imóveis</Link>
              <span aria-hidden>/</span>
              <span className="truncate max-w-64 text-foreground/70">{p.title}</span>
            </nav>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
            {/* Coluna principal — min-w-0 impede que o grid 1fr estoure o viewport */}
            <div className="min-w-0 space-y-10">
              {/* Galeria */}
              <PropertyGallery images={p.images} title={p.title} />

              {/* Título e localização */}
              <div>
                <p className="mb-2 font-inter text-[10px] uppercase tracking-[0.25em] text-amber-600/80 dark:text-amber-400/70">
                  {PROPERTY_TYPE_LABELS[p.type]} · {REGION_LABELS[p.region]}
                </p>
                <h1 className="font-cormorant text-3xl font-light leading-snug text-foreground sm:text-4xl">
                  {p.title}
                </h1>
                <p className="mt-2 font-inter text-sm text-muted-foreground">
                  {[p.address, p.neighborhood, p.city].filter(Boolean).join(", ")}
                </p>
              </div>

              {/* Características */}
              {specs.length > 0 && (
                <div>
                  <h2 className="mb-5 font-inter text-[10px] uppercase tracking-widest text-muted-foreground">
                    Características
                  </h2>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {specs.map((s) => (
                      <div key={s.label} className="border border-border p-4">
                        <p className="font-cormorant text-2xl font-light text-foreground">
                          {s.value}{s.unit}
                        </p>
                        <p className="mt-0.5 font-inter text-[10px] uppercase tracking-widest text-muted-foreground">
                          {s.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Descrição */}
              {p.description && (
                <div>
                  <h2 className="mb-4 font-inter text-[10px] uppercase tracking-widest text-muted-foreground">
                    Sobre o imóvel
                  </h2>
                  <div className="space-y-3 font-inter text-sm font-light leading-relaxed text-foreground/70 whitespace-pre-line">
                    {p.description}
                  </div>
                </div>
              )}

              {/* Diferenciais */}
              {p.highlights.length > 0 && (
                <div>
                  <h2 className="mb-4 font-inter text-[10px] uppercase tracking-widest text-muted-foreground">
                    Diferenciais
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {p.highlights.map((h) => (
                      <span key={h.highlight.label} className="border border-border px-3 py-1.5 font-inter text-xs text-muted-foreground">
                        {h.highlight.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Comodidades */}
              {p.amenities.length > 0 && (
                <div>
                  <h2 className="mb-4 font-inter text-[10px] uppercase tracking-widest text-muted-foreground">
                    Comodidades
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {p.amenities.map((a) => (
                      <span key={a.amenity.label} className="border border-border px-3 py-1.5 font-inter text-xs text-muted-foreground">
                        {a.amenity.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Financeiro */}
              {(p.condoFee || p.iptu) && (
                <div>
                  <h2 className="mb-4 font-inter text-[10px] uppercase tracking-widest text-muted-foreground">
                    Custos mensais
                  </h2>
                  <div className="flex gap-8">
                    {p.condoFee && (
                      <div>
                        <p className="font-cormorant text-xl font-light text-foreground">{formatPrice(p.condoFee)}</p>
                        <p className="font-inter text-[10px] uppercase tracking-widest text-muted-foreground">Condomínio/mês</p>
                      </div>
                    )}
                    {p.iptu && (
                      <div>
                        <p className="font-cormorant text-xl font-light text-foreground">{formatPrice(p.iptu)}</p>
                        <p className="font-inter text-[10px] uppercase tracking-widest text-muted-foreground">IPTU/ano</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar sticky */}
            <div>
              <div className="sticky top-24 space-y-6 border border-border bg-card p-6">
                <div>
                  {p.priceAsk && (
                    <>
                      <p className="font-inter text-[10px] uppercase tracking-widest text-muted-foreground">Preço de venda</p>
                      <p className="mt-1 font-cormorant text-4xl font-light text-foreground">
                        {formatPrice(p.priceAsk)}
                      </p>
                    </>
                  )}
                  {p.priceRent && (
                    <p className={`font-inter text-sm text-muted-foreground ${p.priceAsk ? "mt-1" : "mt-0"}`}>
                      Locação: {formatPrice(p.priceRent)}/mês
                    </p>
                  )}
                  {!p.priceAsk && !p.priceRent && (
                    <p className="font-inter text-sm text-muted-foreground">Consulte o preço</p>
                  )}
                </div>

                <div className="h-px bg-border" />

                <div>
                  <p className="mb-4 font-inter text-xs uppercase tracking-widest text-muted-foreground">
                    Tenho interesse
                  </p>
                  <InterestForm propertyId={p.id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
