/**
 * Landing page programática por cidade + tipo de imóvel.
 * URL: /comprar/guaruja/apartamentos → "Apartamentos à venda no Guarujá"
 * URL: /comprar/santos/casas         → "Casas à venda em Santos"
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getPublicProperties, getAvailableRegions, getNeighborhoods } from "@/lib/public-properties";
import { REGION_LABELS } from "@/lib/property-config";
import { REGION_SLUG, TYPE_SLUG, REGION_TO_SLUG, TYPE_TO_SLUG, TYPE_LABEL_PLURAL } from "@/lib/seo-slugs";
import { PropertyCard } from "@/components/property-card";
import { FeaturedPropertyCard } from "@/components/featured-property-card";
import { PropertyFilterBar } from "@/components/property-filter-bar";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/sections/Footer";
import { PropertyType, Region } from "@prisma/client";

const BASE = "https://litoralhaus.com.br";

// ─── Paths estáticos ──────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const regions = await getAvailableRegions();
  const combos: { regiao: string; tipo: string }[] = [];

  for (const r of regions) {
    const rSlug = REGION_TO_SLUG[r];
    for (const tSlug of Object.keys(TYPE_SLUG)) {
      combos.push({ regiao: rSlug, tipo: tSlug });
    }
  }
  return combos;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ regiao: string; tipo: string }>;
}): Promise<Metadata> {
  const { regiao, tipo } = await params;
  const region = REGION_SLUG[regiao];
  const type   = TYPE_SLUG[tipo];
  if (!region || !type) return { title: "Página não encontrada" };

  const cidade      = REGION_LABELS[region];
  const tipoPluralL = TYPE_LABEL_PLURAL[type].toLowerCase();
  const loc         = cidade === "Guarujá" ? "no" : "em";
  const title       = `${TYPE_LABEL_PLURAL[type]} à venda ${loc} ${cidade} | Litoral Haus`;
  const description = `${properties_count_placeholder(tipo)} ${tipoPluralL} de médio e alto padrão à venda ${loc} ${cidade}. Curadoria Litoral Haus — litoral de São Paulo.`;
  const url         = `${BASE}/comprar/${regiao}/${tipo}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph:  { title, description, url, locale: "pt_BR", type: "website" },
  };
}

function properties_count_placeholder(_tipo: string) { return ""; }

// ─── Página ───────────────────────────────────────────────────────────────────

export default async function ComprarRegiaoTipoPage({
  params,
}: {
  params: Promise<{ regiao: string; tipo: string }>;
}) {
  const { regiao, tipo } = await params;
  const region = REGION_SLUG[regiao];
  const type   = TYPE_SLUG[tipo];
  if (!region || !type) notFound();

  const cidade      = REGION_LABELS[region];
  const loc         = cidade === "Guarujá" ? "no" : "em";
  const tipoPlural  = TYPE_LABEL_PLURAL[type];

  const [properties, regions, neighborhoods] = await Promise.all([
    getPublicProperties({ region, type }),
    getAvailableRegions(),
    getNeighborhoods(region),
  ]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background text-foreground">
        <div className="border-b border-border px-6 pt-20 pb-6">
          <div className="mx-auto max-w-6xl">
            <p className="mb-2 font-inter text-[10px] uppercase tracking-[0.3em] text-amber-500/80">
              {cidade} · {tipoPlural}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <h1 className="font-cormorant text-4xl font-light sm:text-5xl">
                {tipoPlural} à venda {loc} {cidade}
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
