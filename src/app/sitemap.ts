import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { REGION_LABELS } from "@/lib/property-config";
import type { Region } from "@prisma/client";

const BASE = "https://litoralhaus.com.br";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const properties = await prisma.property.findMany({
    where:   { status: "DISPONIVEL" },
    select:  { slug: true, updatedAt: true, region: true, type: true },
    orderBy: { updatedAt: "desc" },
  });

  // URLs estáticas
  const staticUrls: MetadataRoute.Sitemap = [
    { url: BASE,              lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE}/imoveis`, lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/contato`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  // Páginas de listagem por região (para SEO programático)
  const regions = [...new Set(properties.map((p) => p.region))];
  const regionUrls: MetadataRoute.Sitemap = regions.map((r) => ({
    url:             `${BASE}/imoveis?region=${r}`,
    lastModified:    new Date(),
    changeFrequency: "daily" as const,
    priority:        0.8,
  }));

  // Páginas individuais de imóveis
  const propertyUrls: MetadataRoute.Sitemap = properties.map((p) => ({
    url:             `${BASE}/imoveis/${p.slug}`,
    lastModified:    p.updatedAt,
    changeFrequency: "weekly" as const,
    priority:        0.7,
  }));

  return [...staticUrls, ...regionUrls, ...propertyUrls];
}
