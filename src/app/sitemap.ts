import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { REGION_TO_SLUG, TYPE_TO_SLUG, slugifyNeighborhood } from "@/lib/seo-slugs";
import { getAllPostSlugs } from "@/lib/blog";

const BASE = "https://litoralhaus.com.br";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const properties = await prisma.property.findMany({
    where:   { status: "DISPONIVEL" },
    select:  { slug: true, updatedAt: true, region: true, type: true, neighborhood: true },
    orderBy: { updatedAt: "desc" },
  });

  // URLs estáticas
  const staticUrls: MetadataRoute.Sitemap = [
    { url: BASE,              lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE}/imoveis`, lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/blog`,    lastModified: new Date(), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE}/contato`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  // /comprar/[regiao] — uma por cidade
  const regionSet = [...new Set(properties.map((p) => p.region))];
  const regionUrls: MetadataRoute.Sitemap = regionSet.map((r) => ({
    url:             `${BASE}/comprar/${REGION_TO_SLUG[r]}`,
    lastModified:    new Date(),
    changeFrequency: "daily" as const,
    priority:        0.85,
  }));

  // /comprar/[regiao]/[tipo] — combinações tipo × cidade
  const typeRegionPairs = new Set<string>();
  for (const p of properties) {
    const rSlug = REGION_TO_SLUG[p.region];
    const tSlug = TYPE_TO_SLUG[p.type];
    if (rSlug && tSlug) typeRegionPairs.add(`${rSlug}/${tSlug}`);
  }
  const typeUrls: MetadataRoute.Sitemap = [...typeRegionPairs].map((pair) => ({
    url:             `${BASE}/comprar/${pair}`,
    lastModified:    new Date(),
    changeFrequency: "daily" as const,
    priority:        0.8,
  }));

  // /comprar/[regiao]/[bairro] — combinações bairro × cidade
  const neighborhoodPairs = new Set<string>();
  for (const p of properties) {
    if (!p.neighborhood) continue;
    const rSlug = REGION_TO_SLUG[p.region];
    const bSlug = slugifyNeighborhood(p.neighborhood);
    if (rSlug && bSlug) neighborhoodPairs.add(`${rSlug}/${bSlug}`);
  }
  const neighborhoodUrls: MetadataRoute.Sitemap = [...neighborhoodPairs].map((pair) => ({
    url:             `${BASE}/comprar/${pair}`,
    lastModified:    new Date(),
    changeFrequency: "weekly" as const,
    priority:        0.75,
  }));

  // Páginas individuais de imóveis
  const propertyUrls: MetadataRoute.Sitemap = properties.map((p) => ({
    url:             `${BASE}/imoveis/${p.slug}`,
    lastModified:    p.updatedAt,
    changeFrequency: "weekly" as const,
    priority:        0.7,
  }));

  // Posts do blog
  const postSlugs = await getAllPostSlugs();
  const blogUrls: MetadataRoute.Sitemap = postSlugs.map((slug) => ({
    url:             `${BASE}/blog/${slug}`,
    lastModified:    new Date(),
    changeFrequency: "monthly" as const,
    priority:        0.75,
  }));

  return [...staticUrls, ...regionUrls, ...typeUrls, ...neighborhoodUrls, ...propertyUrls, ...blogUrls];
}
