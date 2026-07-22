/**
 * Landing page programática por cidade.
 * URL: /comprar/guaruja → "Imóveis à venda no Guarujá"
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getPublicProperties, getAvailableRegions, getNeighborhoods } from "@/lib/public-properties";
import { REGION_LABELS } from "@/lib/property-config";
import { REGION_SLUG, REGION_TO_SLUG } from "@/lib/seo-slugs";
import { PropertyCard } from "@/components/property-card";
import { FeaturedPropertyCard } from "@/components/featured-property-card";
import { PropertyFilterBar } from "@/components/property-filter-bar";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/sections/Footer";
import { ItemListJsonLd } from "@/components/json-ld";

const BASE = "https://litoralhaus.com.br";

// ─── Gera os paths estáticos em build time ────────────────────────────────────

export async function generateStaticParams() {
  const regions = await getAvailableRegions();
  return regions.map((r) => ({ regiao: REGION_TO_SLUG[r] }));
}

// ─── Metadata dinâmica ────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ regiao: string }>;
}): Promise<Metadata> {
  const { regiao } = await params;
  const region = REGION_SLUG[regiao];
  if (!region) return { title: "Página não encontrada" };

  const cidade = REGION_LABELS[region];
  const title       = `Imóveis à venda ${cidade === "Guarujá" ? "no" : "em"} ${cidade}`;
  const description = `Apartamentos, casas e coberturas de médio e alto padrão à venda ${cidade === "Guarujá" ? "no" : "em"} ${cidade}. Curadoria Litoral Haus — litoral de São Paulo.`;
  const url = `${BASE}/comprar/${regiao}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph:  { title, description, url, locale: "pt_BR", type: "website" },
  };
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default async function ComprarRegiaoPage({
  params,
}: {
  params: Promise<{ regiao: string }>;
}) {
  const { regiao } = await params;
  const region = REGION_SLUG[regiao];
  if (!region) notFound();

  const cidade = REGION_LABELS[region];
  const locativo = cidade === "Guarujá" || cidade === "Santos" ? `no ${cidade}` : `em ${cidade}`;

  const [properties, regions, neighborhoods] = await Promise.all([
    getPublicProperties({ region }),
    getAvailableRegions(),
    getNeighborhoods(region),
  ]);

  const pageUrl = `${BASE}/comprar/${regiao}`;

  return (
    <>
      <ItemListJsonLd
        name={`Imóveis à venda ${locativo}`}
        url={pageUrl}
        description={`Apartamentos, casas e coberturas de médio e alto padrão à venda ${locativo}. Curadoria Litoral Haus — litoral de São Paulo.`}
        items={properties.slice(0, 20).map((p, i) => ({
          position: i + 1,
          name:     p.title,
          url:      `${BASE}/imoveis/${p.slug}`,
          image:    p.images[0],
        }))}
      />
      <Navbar />
      <div className="min-h-screen bg-background text-foreground">
        <div className="border-b border-border px-6 pt-20 pb-6">
          <div className="mx-auto max-w-6xl">
            <p className="mb-2 font-inter text-[10px] uppercase tracking-[0.3em] text-amber-500/80">
              {cidade}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <h1 className="font-cormorant text-4xl font-light sm:text-5xl">
                Imóveis à venda {locativo}
              </h1>
              <p className="font-inter text-sm text-muted-foreground">
                {properties.length} {properties.length === 1 ? "imóvel" : "imóveis"}
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-6 py-6">
          <div className="mb-8">
            <Suspense>
              <PropertyFilterBar regions={regions} neighborhoods={neighborhoods} />
            </Suspense>
          </div>

          {properties.length === 0 ? (
            <p className="py-32 text-center font-cormorant text-3xl font-light text-muted-foreground">
              Nenhum imóvel disponível no momento.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((p) =>
                p.featured ? (
                  <FeaturedPropertyCard key={p.id} p={p} />
                ) : (
                  <PropertyCard key={p.id} p={p} />
                )
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
