import type { Metadata } from "next";
import { Suspense } from "react";
import { PropertyType, Region } from "@prisma/client";
import {
  getPublicProperties,
  getAvailableRegions,
  getNeighborhoods,
} from "@/lib/public-properties";
import { PRICE_RANGES } from "@/lib/property-config";
import { PropertyCard } from "@/components/property-card";
import { PropertyFilterBar } from "@/components/property-filter-bar";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/sections/Footer";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Imóveis no Litoral de São Paulo | Médio e Alto Padrão",
  description:
    "Encontre apartamentos, casas e coberturas de médio e alto padrão no Guarujá, Santos e litoral paulista. Curadoria Litoral Haus.",
};

export default async function ImoveisPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;

  const typeParam   = sp.type   as PropertyType | undefined;
  const regionParam = sp.region as Region       | undefined;
  const priceParam  = sp.price  ? Number(sp.price) : undefined;
  const bedroomsParam = sp.bedrooms ? Number(sp.bedrooms) : undefined;
  const neighborhood  = sp.neighborhood?.trim() || undefined;

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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <div className="border-b border-border px-6 pt-28 pb-8">
          <div className="mx-auto max-w-6xl">
            <p className="mb-2 font-inter text-[10px] uppercase tracking-[0.3em] text-amber-500/80 dark:text-amber-400/70">
              Portfólio
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <h1 className="font-cormorant text-4xl font-light text-foreground sm:text-5xl">
                Imóveis disponíveis
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
