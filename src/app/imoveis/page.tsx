import type { Metadata } from "next";
import { Suspense } from "react";
import { PropertyType, Region } from "@prisma/client";
import {
  getPublicProperties,
  getAvailableRegions,
  getNeighborhoods,
} from "@/lib/public-properties";
import { PRICE_RANGES, REGION_LABELS, PROPERTY_TYPE_PLURAL } from "@/lib/property-config";
import { PropertyCard } from "@/components/property-card";
import { PropertyFilterBar } from "@/components/property-filter-bar";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/sections/Footer";
import Link from "next/link";

// ─── SEO helpers ────────────────────────────────────────────────────────────

const TYPE_PLURAL = PROPERTY_TYPE_PLURAL;

// Locative preposition for each region
const REGION_LOCATIVE: Record<Region, string> = {
  GUARUJA:       "no Guarujá",
  SANTOS:        "em Santos",
  SAO_VICENTE:   "em São Vicente",
  PRAIA_GRANDE:  "na Praia Grande",
  BERTIOGA:      "em Bertioga",
  UBATUBA:       "em Ubatuba",
  CARAGUATATUBA: "em Caraguatatuba",
  SAO_SEBASTIAO: "em São Sebastião",
  ILHABELA:      "em Ilhabela",
};

function buildHeading({
  type,
  region,
  neighborhood,
}: {
  type?:         PropertyType;
  region?:       Region;
  neighborhood?: string;
}): string {
  const typePart   = type ? TYPE_PLURAL[type] : "Imóveis";
  const verb       = type !== "LAND" ? " à venda" : "";

  if (neighborhood && region) {
    return `${typePart}${verb} no ${neighborhood} — ${REGION_LABELS[region]}`;
  }
  if (neighborhood) {
    return `${typePart}${verb} no ${neighborhood}`;
  }
  if (region) {
    return `${typePart}${verb} ${REGION_LOCATIVE[region]}`;
  }
  return `${typePart} no Litoral de São Paulo`;
}

function buildDescription({
  type,
  region,
  neighborhood,
  count,
}: {
  type?:         PropertyType;
  region?:       Region;
  neighborhood?: string;
  count:         number;
}): string {
  const typePart = type ? TYPE_PLURAL[type].toLowerCase() : "imóveis";
  const place = neighborhood && region
    ? `no ${neighborhood}, ${REGION_LABELS[region]}`
    : neighborhood
    ? `no ${neighborhood}`
    : region
    ? REGION_LOCATIVE[region]
    : "no litoral paulista";

  return `${count} ${typePart} disponíveis ${place}. Curadoria de médio e alto padrão no Guarujá, Santos e litoral de São Paulo — Litoral Haus.`;
}

// ─── Dynamic metadata ────────────────────────────────────────────────────────

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}): Promise<Metadata> {
  const sp           = await searchParams;
  const typeParam    = sp.type   as PropertyType | undefined;
  const regionParam  = sp.region as Region       | undefined;
  const neighborhood = sp.neighborhood?.trim() || undefined;

  const type   = typeParam   && Object.values(PropertyType).includes(typeParam)   ? typeParam   : undefined;
  const region = regionParam && Object.values(Region).includes(regionParam)       ? regionParam : undefined;

  const heading     = buildHeading({ type, region, neighborhood });
  const description = buildDescription({ type, region, neighborhood, count: 0 });

  return {
    title:       `${heading} | Litoral Haus`,
    description: description.replace(/^0 /, ""),
  };
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function ImoveisPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;

  const typeParam      = sp.type      as PropertyType | undefined;
  const regionParam    = sp.region    as Region       | undefined;
  const priceParam     = sp.price     ? Number(sp.price)    : undefined;
  const bedroomsParam  = sp.bedrooms  ? Number(sp.bedrooms) : undefined;
  const neighborhood   = sp.neighborhood?.trim() || undefined;

  const type   = typeParam   && Object.values(PropertyType).includes(typeParam)   ? typeParam   : undefined;
  const region = regionParam && Object.values(Region).includes(regionParam)       ? regionParam : undefined;

  const priceRange = priceParam != null ? PRICE_RANGES[priceParam] : undefined;

  const [properties, regions, neighborhoods] = await Promise.all([
    getPublicProperties({
      type,
      region,
      neighborhood,
      bedrooms: bedroomsParam,
      minPrice: priceRange?.min,
      maxPrice: priceRange?.max,
    }),
    getAvailableRegions(),
    getNeighborhoods(region),
  ]);

  const heading = buildHeading({ type, region, neighborhood });
  const hasFilters = !!(type || region || neighborhood || bedroomsParam || priceParam != null);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <div className="border-b border-border px-6 pt-20 pb-6">
          <div className="mx-auto max-w-6xl">
            <p className="mb-2 font-inter text-[10px] uppercase tracking-[0.3em] text-amber-500/80 dark:text-amber-400/70">
              Portfólio
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <h1 className="font-cormorant text-4xl font-light text-foreground sm:text-5xl">
                {hasFilters ? heading : "Imóveis disponíveis"}
              </h1>
              <p className="font-inter text-sm text-muted-foreground">
                {properties.length}{" "}
                {properties.length === 1 ? "imóvel encontrado" : "imóveis encontrados"}
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-6 py-6">
          {/* Filter bar */}
          <div className="mb-8">
            <Suspense>
              <PropertyFilterBar regions={regions} neighborhoods={neighborhoods} />
            </Suspense>
          </div>

          {/* SEO heading — shown when filters active, below the filter bar */}
          {hasFilters && (
            <div className="mb-6">
              <h2 className="font-cormorant text-2xl font-light text-foreground">
                {heading}
              </h2>
              <p className="mt-1 font-inter text-sm text-muted-foreground">
                {buildDescription({ type, region, neighborhood, count: properties.length })}
              </p>
            </div>
          )}

          {/* Grid */}
          {properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <p className="font-cormorant text-3xl font-light text-muted-foreground">
                Nenhum imóvel encontrado
              </p>
              <p className="mt-2 font-inter text-sm text-muted-foreground">
                Tente ajustar os filtros ou{" "}
                <Link
                  href="/imoveis"
                  className="text-amber-600 hover:text-amber-500 dark:text-amber-400 dark:hover:text-amber-300"
                >
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
