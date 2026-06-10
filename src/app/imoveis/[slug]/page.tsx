import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicPropertyBySlug } from "@/lib/public-properties";
import { PROPERTY_TYPE_LABELS, REGION_LABELS, formatPrice } from "@/lib/property-config";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/sections/Footer";
import { PropertyGallery } from "@/components/property-gallery";
import { InterestForm } from "@/components/interest-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPublicPropertyBySlug(slug);
  if (!p) return { title: "Imóvel não encontrado" };

  return {
    title: p.seoTitle || p.title,
    description: p.seoDescription || p.description?.slice(0, 160) || undefined,
    openGraph: {
      title: p.seoTitle || p.title,
      description: p.seoDescription || undefined,
      images: p.images[0] ? [{ url: p.images[0] }] : undefined,
    },
  };
}

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
      <Navbar />
      <div className="min-h-screen bg-stone-950">
        {/* Breadcrumb */}
        <div className="border-b border-stone-800 px-6 pt-20 pb-4">
          <div className="mx-auto max-w-6xl">
            <nav className="flex items-center gap-2 font-inter text-xs text-stone-500">
              <Link href="/" className="hover:text-stone-300">Home</Link>
              <span>/</span>
              <Link href="/imoveis" className="hover:text-stone-300">Imóveis</Link>
              <span>/</span>
              <span className="truncate max-w-64 text-stone-400">{p.title}</span>
            </nav>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
            {/* Coluna principal */}
            <div className="space-y-10">
              {/* Galeria */}
              <PropertyGallery images={p.images} title={p.title} />

              {/* Título e localização */}
              <div>
                <p className="mb-2 font-inter text-[10px] uppercase tracking-[0.25em] text-amber-400/70">
                  {PROPERTY_TYPE_LABELS[p.type]} · {REGION_LABELS[p.region]}
                </p>
                <h1 className="font-cormorant text-3xl font-light leading-snug text-stone-50 sm:text-4xl">
                  {p.title}
                </h1>
                <p className="mt-2 font-inter text-sm text-stone-500">
                  {[p.address, p.neighborhood, p.city].filter(Boolean).join(", ")}
                </p>
              </div>

              {/* Características */}
              {specs.length > 0 && (
                <div>
                  <h2 className="mb-5 font-inter text-[10px] uppercase tracking-widest text-stone-500">
                    Características
                  </h2>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {specs.map((s) => (
                      <div key={s.label} className="border border-stone-800 p-4">
                        <p className="font-cormorant text-2xl font-light text-stone-100">
                          {s.value}{s.unit}
                        </p>
                        <p className="mt-0.5 font-inter text-[10px] uppercase tracking-widest text-stone-600">
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
                  <h2 className="mb-4 font-inter text-[10px] uppercase tracking-widest text-stone-500">
                    Sobre o imóvel
                  </h2>
                  <div className="space-y-3 font-inter text-sm font-light leading-relaxed text-stone-400 whitespace-pre-line">
                    {p.description}
                  </div>
                </div>
              )}

              {/* Diferenciais */}
              {p.highlights.length > 0 && (
                <div>
                  <h2 className="mb-4 font-inter text-[10px] uppercase tracking-widest text-stone-500">
                    Diferenciais
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {p.highlights.map((h) => (
                      <span key={h.highlight.label} className="border border-stone-700 px-3 py-1.5 font-inter text-xs text-stone-400">
                        {h.highlight.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Comodidades */}
              {p.amenities.length > 0 && (
                <div>
                  <h2 className="mb-4 font-inter text-[10px] uppercase tracking-widest text-stone-500">
                    Comodidades
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {p.amenities.map((a) => (
                      <span key={a.amenity.label} className="border border-stone-700 px-3 py-1.5 font-inter text-xs text-stone-400">
                        {a.amenity.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Financeiro */}
              {(p.condoFee || p.iptu) && (
                <div>
                  <h2 className="mb-4 font-inter text-[10px] uppercase tracking-widest text-stone-500">
                    Custos mensais
                  </h2>
                  <div className="flex gap-8">
                    {p.condoFee && (
                      <div>
                        <p className="font-cormorant text-xl font-light text-stone-100">{formatPrice(p.condoFee)}</p>
                        <p className="font-inter text-[10px] uppercase tracking-widest text-stone-600">Condomínio/mês</p>
                      </div>
                    )}
                    {p.iptu && (
                      <div>
                        <p className="font-cormorant text-xl font-light text-stone-100">{formatPrice(p.iptu)}</p>
                        <p className="font-inter text-[10px] uppercase tracking-widest text-stone-600">IPTU/ano</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar sticky */}
            <div>
              <div className="sticky top-24 space-y-6 border border-stone-800 p-6">
                {/* Preço */}
                <div>
                  {p.priceAsk && (
                    <>
                      <p className="font-inter text-[10px] uppercase tracking-widest text-stone-600">Preço de venda</p>
                      <p className="mt-1 font-cormorant text-4xl font-light text-stone-50">
                        {formatPrice(p.priceAsk)}
                      </p>
                    </>
                  )}
                  {p.priceRent && (
                    <p className={`font-inter text-sm text-stone-400 ${p.priceAsk ? "mt-1" : "mt-0"}`}>
                      Locação: {formatPrice(p.priceRent)}/mês
                    </p>
                  )}
                  {!p.priceAsk && !p.priceRent && (
                    <p className="font-inter text-sm text-stone-600">Consulte o preço</p>
                  )}
                </div>

                <div className="h-px bg-stone-800" />

                {/* Formulário de interesse */}
                <div>
                  <p className="mb-4 font-inter text-xs uppercase tracking-widest text-stone-500">
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
