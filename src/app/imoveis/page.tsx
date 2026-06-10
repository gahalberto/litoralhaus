import type { Metadata } from "next";
import Link from "next/link";
import { PropertyType, Region } from "@prisma/client";
import { getPublicProperties } from "@/lib/public-properties";
import { PROPERTY_TYPE_LABELS, REGION_LABELS } from "@/lib/property-config";
import { PropertyCard } from "@/components/property-card";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/sections/Footer";

export const metadata: Metadata = {
  title: "Imóveis de Alto Padrão no Litoral de São Paulo",
  description:
    "Encontre apartamentos, casas e coberturas de luxo no Guarujá, Santos e litoral paulista. Curadoria exclusiva Litoral Haus.",
};

const PRICE_RANGES = [
  { label: "Até R$ 500k",      min: 0,        max: 500000   },
  { label: "R$ 500k – R$ 1M",  min: 500000,   max: 1000000  },
  { label: "R$ 1M – R$ 2M",    min: 1000000,  max: 2000000  },
  { label: "R$ 2M – R$ 5M",    min: 2000000,  max: 5000000  },
  { label: "Acima de R$ 5M",   min: 5000000,  max: undefined },
];

export default async function ImoveisPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;

  const q         = sp.q?.trim() || undefined;
  const typeParam = sp.type as PropertyType | undefined;
  const regionParam = sp.region as Region | undefined;
  const priceParam  = sp.price ? Number(sp.price) : undefined;

  const type   = typeParam   && Object.values(PropertyType).includes(typeParam)   ? typeParam   : undefined;
  const region = regionParam && Object.values(Region).includes(regionParam)       ? regionParam : undefined;

  const priceRange = priceParam != null ? PRICE_RANGES[priceParam] : undefined;

  const properties = await getPublicProperties({
    q,
    type,
    region,
    minPrice: priceRange?.min,
    maxPrice: priceRange?.max,
  });

  function href(key: string, val: string | undefined) {
    const p = new URLSearchParams(sp);
    if (!val) p.delete(key);
    else p.set(key, val);
    const qs = p.toString();
    return `/imoveis${qs ? `?${qs}` : ""}`;
  }

  const activeFilters = [type, region, priceParam != null ? String(priceParam) : undefined, q].filter(Boolean).length;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-stone-950">
        {/* Header */}
        <div className="border-b border-stone-800 px-6 pt-28 pb-10">
          <div className="mx-auto max-w-6xl">
            <p className="mb-2 font-inter text-[10px] uppercase tracking-[0.3em] text-amber-400/70">
              Portfólio
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <h1 className="font-cormorant text-4xl font-light text-stone-50 sm:text-5xl">
                Imóveis disponíveis
              </h1>
              <p className="font-inter text-sm text-stone-500">
                {properties.length} {properties.length === 1 ? "imóvel encontrado" : "imóveis encontrados"}
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-6 py-8">
          {/* Search + Filters */}
          <div className="mb-8 space-y-4">
            {/* Search bar */}
            <form method="GET" action="/imoveis" className="relative">
              {/* Preserve other filters */}
              {type   && <input type="hidden" name="type"   value={type}   />}
              {region && <input type="hidden" name="region" value={region} />}
              {priceParam != null && <input type="hidden" name="price" value={priceParam} />}
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Buscar por título, bairro ou cidade…"
                className="w-full rounded-none border border-stone-700 bg-stone-900 px-5 py-3.5 font-inter text-sm text-stone-100 placeholder:text-stone-600 outline-none transition-colors focus:border-amber-400 sm:max-w-md"
              />
            </form>

            {/* Filter pills */}
            <div className="flex flex-wrap gap-4">
              {/* Tipo */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-inter text-[10px] uppercase tracking-widest text-stone-600 mr-1">Tipo</span>
                <FilterPill href={href("type", undefined)} active={!type}>Todos</FilterPill>
                {Object.values(PropertyType).map((t) => (
                  <FilterPill key={t} href={href("type", t)} active={type === t}>
                    {PROPERTY_TYPE_LABELS[t]}
                  </FilterPill>
                ))}
              </div>

              <div className="hidden h-5 w-px bg-stone-800 sm:block self-center" />

              {/* Região */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-inter text-[10px] uppercase tracking-widest text-stone-600 mr-1">Região</span>
                <FilterPill href={href("region", undefined)} active={!region}>Todas</FilterPill>
                {[Region.GUARUJA, Region.SANTOS, Region.BERTIOGA, Region.SAO_VICENTE, Region.UBATUBA, Region.ILHABELA].map((r) => (
                  <FilterPill key={r} href={href("region", r)} active={region === r}>
                    {REGION_LABELS[r]}
                  </FilterPill>
                ))}
              </div>

              <div className="hidden h-5 w-px bg-stone-800 sm:block self-center" />

              {/* Preço */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-inter text-[10px] uppercase tracking-widest text-stone-600 mr-1">Preço</span>
                <FilterPill href={href("price", undefined)} active={priceParam == null}>Todos</FilterPill>
                {PRICE_RANGES.map((range, i) => (
                  <FilterPill key={i} href={href("price", String(i))} active={priceParam === i}>
                    {range.label}
                  </FilterPill>
                ))}
              </div>
            </div>

            {/* Clear filters */}
            {activeFilters > 0 && (
              <Link
                href="/imoveis"
                className="font-inter text-xs text-stone-500 underline underline-offset-2 hover:text-stone-300"
              >
                Limpar filtros ({activeFilters})
              </Link>
            )}
          </div>

          {/* Grid */}
          {properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <p className="font-cormorant text-3xl font-light text-stone-600">
                Nenhum imóvel encontrado
              </p>
              <p className="mt-2 font-inter text-sm text-stone-700">
                Tente ajustar os filtros ou{" "}
                <Link href="/imoveis" className="text-amber-400/70 hover:text-amber-400">
                  ver todos os imóveis
                </Link>
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((p) => (
                <PropertyCard key={p.id} p={p} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

function FilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 font-inter text-[11px] uppercase tracking-wider transition-colors ${
        active
          ? "bg-amber-400 text-stone-950"
          : "border border-stone-700 text-stone-400 hover:border-stone-500 hover:text-stone-200"
      }`}
    >
      {children}
    </Link>
  );
}
