/**
 * Landing pages programáticas de segundo nível.
 * /comprar/guaruja/apartamentos  → PropertyType filtrando por APARTMENT + GUARUJA
 * /comprar/guaruja/jardim-enseada → Bairro "Jardim Enseada" no Guarujá
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getPublicProperties, getAvailableRegions, getNeighborhoods } from "@/lib/public-properties";
import { REGION_LABELS } from "@/lib/property-config";
import {
  REGION_SLUG,
  REGION_TO_SLUG,
  TYPE_SLUG,
  TYPE_TO_SLUG,
  TYPE_LABEL_PLURAL,
  slugifyNeighborhood,
} from "@/lib/seo-slugs";
import { PropertyCard } from "@/components/property-card";
import { FeaturedPropertyCard } from "@/components/featured-property-card";
import { PropertyFilterBar } from "@/components/property-filter-bar";
import { ItemListJsonLd } from "@/components/json-ld";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/sections/Footer";
import type { PropertyType, Region } from "@prisma/client";

const BASE = "https://litoralhaus.com.br";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function locative(cidade: string) {
  return cidade === "Guarujá" || cidade === "Santos" ? `no ${cidade}` : `em ${cidade}`;
}

type PageMode =
  | { kind: "type";         type: PropertyType; region: Region; cidade: string }
  | { kind: "neighborhood"; neighborhood: string; region: Region; cidade: string };

async function resolveMode(regiao: string, segmento: string): Promise<PageMode | null> {
  const region = REGION_SLUG[regiao];
  if (!region) return null;

  const cidade = REGION_LABELS[region];

  // Preferência: tipo antes de bairro (evita conflito de slugs)
  if (TYPE_SLUG[segmento]) {
    return { kind: "type", type: TYPE_SLUG[segmento], region, cidade };
  }

  // Busca bairro cujo slug gerado corresponde ao segmento
  const rows = await prisma.property.findMany({
    where:  { status: "DISPONIVEL", region },
    select: { neighborhood: true },
    distinct: ["neighborhood"],
  });
  const match = rows.find((r) => slugifyNeighborhood(r.neighborhood) === segmento);
  if (!match) return null;

  return { kind: "neighborhood", neighborhood: match.neighborhood, region, cidade };
}

// ─── Static params ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const regions = await getAvailableRegions();

  // Tipo × Região
  const typeParams = regions.flatMap((r) =>
    Object.keys(TYPE_SLUG).map((typeSlug) => ({
      regiao:   REGION_TO_SLUG[r],
      segmento: typeSlug,
    }))
  );

  // Bairro × Região
  const rows = await prisma.property.findMany({
    where:    { status: "DISPONIVEL" },
    select:   { region: true, neighborhood: true },
    distinct: ["region", "neighborhood"],
    orderBy:  { neighborhood: "asc" },
  });
  const neighborhoodParams = rows
    .filter((r) => r.neighborhood)
    .map((r) => ({
      regiao:   REGION_TO_SLUG[r.region],
      segmento: slugifyNeighborhood(r.neighborhood),
    }));

  return [...typeParams, ...neighborhoodParams];
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ regiao: string; segmento: string }>;
}): Promise<Metadata> {
  const { regiao, segmento } = await params;
  const mode = await resolveMode(regiao, segmento);
  if (!mode) return { title: "Página não encontrada" };

  let title: string;
  let description: string;
  const url = `${BASE}/comprar/${regiao}/${segmento}`;

  if (mode.kind === "type") {
    const label = TYPE_LABEL_PLURAL[mode.type];
    const loc   = locative(mode.cidade);
    title       = `${label} à venda ${loc}`;
    description = `${label} de médio e alto padrão à venda ${loc}. Confira o portfólio curado da Litoral Haus no litoral paulista.`;
  } else {
    title       = `Imóveis à venda no ${mode.neighborhood}, ${mode.cidade}`;
    description = `Apartamentos, casas e imóveis à venda no bairro ${mode.neighborhood} em ${mode.cidade}. Curadoria Litoral Haus — litoral de São Paulo.`;
  }

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph:  { title, description, url, locale: "pt_BR", type: "website", siteName: "Litoral Haus" },
    robots:     { index: true, follow: true },
  };
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default async function ComprarSegmentoPage({
  params,
}: {
  params: Promise<{ regiao: string; segmento: string }>;
}) {
  const { regiao, segmento } = await params;
  const mode = await resolveMode(regiao, segmento);
  if (!mode) notFound();

  const filters =
    mode.kind === "type"
      ? { region: mode.region, type: mode.type }
      : { region: mode.region, neighborhood: mode.neighborhood };

  const [properties, regions, neighborhoods] = await Promise.all([
    getPublicProperties(filters),
    getAvailableRegions(),
    getNeighborhoods(mode.region),
  ]);

  const heading =
    mode.kind === "type"
      ? `${TYPE_LABEL_PLURAL[mode.type]} à venda ${locative(mode.cidade)}`
      : `Imóveis à venda no ${mode.neighborhood}`;

  const subheading =
    mode.kind === "type"
      ? mode.cidade
      : `${mode.neighborhood} — ${mode.cidade}`;

  const canonicalUrl = `${BASE}/comprar/${regiao}/${segmento}`;

  // Navegação por tipo dentro da mesma região
  const typeLinks = (Object.entries(TYPE_SLUG) as [string, PropertyType][]).map(
    ([slug, type]) => ({ slug, label: TYPE_LABEL_PLURAL[type] })
  );

  return (
    <>
      <ItemListJsonLd
        name={heading}
        url={canonicalUrl}
        description={
          mode.kind === "type"
            ? `${TYPE_LABEL_PLURAL[mode.type]} de médio e alto padrão à venda ${locative(mode.cidade)}. Curadoria Litoral Haus.`
            : `Imóveis à venda no bairro ${mode.neighborhood} em ${mode.cidade}. Curadoria Litoral Haus.`
        }
        items={properties.slice(0, 20).map((p, i) => ({
          position: i + 1,
          name:     p.title,
          url:      `${BASE}/imoveis/${p.slug}`,
          image:    p.images[0],
        }))}
      />
      <Navbar />
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <div className="border-b border-border px-6 pt-20 pb-6">
          <div className="mx-auto max-w-6xl">
            <p className="mb-2 font-inter text-[10px] uppercase tracking-[0.3em] text-amber-500/80">
              <Link href={`/comprar/${regiao}`} className="hover:text-amber-400 transition-colors">
                {mode.cidade}
              </Link>
              {mode.kind === "neighborhood" && (
                <> / {mode.neighborhood}</>
              )}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="font-cormorant text-4xl font-light sm:text-5xl">{heading}</h1>
                <p className="mt-1 font-inter text-xs text-muted-foreground">{subheading}</p>
              </div>
              <p className="font-inter text-sm text-muted-foreground">
                {properties.length} {properties.length === 1 ? "imóvel" : "imóveis"}
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-6 py-6">
          {/* Filtros de tipo rápidos */}
          <div className="mb-6 flex flex-wrap gap-2">
            <Link
              href={`/comprar/${regiao}`}
              className="rounded-full border border-border px-3 py-1 font-inter text-xs text-muted-foreground transition-colors hover:border-amber-500 hover:text-amber-500"
            >
              Todos
            </Link>
            {typeLinks.map(({ slug, label }) => (
              <Link
                key={slug}
                href={`/comprar/${regiao}/${slug}`}
                className={`rounded-full border px-3 py-1 font-inter text-xs transition-colors ${
                  mode.kind === "type" && TYPE_TO_SLUG[mode.type] === slug
                    ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    : "border-border text-muted-foreground hover:border-amber-500 hover:text-amber-500"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Filter bar (bairros etc.) */}
          <div className="mb-8">
            <Suspense>
              <PropertyFilterBar regions={regions} neighborhoods={neighborhoods} />
            </Suspense>
          </div>

          {/* SEO structured content for neighborhood pages */}
          {mode.kind === "neighborhood" && (
            <div className="mb-8 rounded-lg border border-border bg-muted/30 px-5 py-4">
              <h2 className="font-cormorant text-xl font-light">
                Imóveis no bairro {mode.neighborhood}, {mode.cidade}
              </h2>
              <p className="mt-1 font-inter text-sm text-muted-foreground">
                {properties.length > 0
                  ? `Encontramos ${properties.length} ${properties.length === 1 ? "imóvel disponível" : "imóveis disponíveis"} no ${mode.neighborhood}. Conheça o portfólio curado pela Litoral Haus.`
                  : `No momento não há imóveis disponíveis no ${mode.neighborhood}. Confira outras opções ${locative(mode.cidade)}.`}
              </p>
            </div>
          )}

          {/* Grid */}
          {properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <p className="font-cormorant text-3xl font-light text-muted-foreground">
                Nenhum imóvel encontrado
              </p>
              <p className="mt-3 font-inter text-sm text-muted-foreground">
                <Link
                  href={`/comprar/${regiao}`}
                  className="text-amber-600 hover:text-amber-500 dark:text-amber-400"
                >
                  Ver todos os imóveis {locative(mode.cidade)}
                </Link>
              </p>
            </div>
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

          {/* Canonical link hint para SEO */}
          <div className="mt-12 border-t border-border pt-6">
            <p className="font-inter text-xs text-muted-foreground">
              Veja também:{" "}
              <Link
                href={`/comprar/${regiao}`}
                className="text-amber-600 hover:text-amber-500 dark:text-amber-400"
              >
                Todos os imóveis {locative(mode.cidade)}
              </Link>
              {" · "}
              <Link
                href="/imoveis"
                className="text-amber-600 hover:text-amber-500 dark:text-amber-400"
              >
                Portfólio completo
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
