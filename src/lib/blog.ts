import { prisma } from "@/lib/prisma";
import type { Region } from "@prisma/client";

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type PostCard = {
  id:          string;
  slug:        string;
  title:       string;
  excerpt:     string;
  coverImage:  string | null;
  publishedAt: Date | null;
  authorName:  string;
  region:      Region | null;
  city:        string | null;
  neighborhood: string | null;
  tags:        string[];
};

export type PostDetail = PostCard & {
  content:       string;
  seoTitle:      string | null;
  seoDescription: string | null;
  updatedAt:     Date;
  relatedProperties: {
    property: {
      id:          string;
      slug:        string;
      title:       string;
      type:        string;
      region:      Region;
      city:        string;
      neighborhood: string;
      bedrooms:    number | null;
      areaTotal:   string | null;
      priceAsk:    string | null;
      images:      string[];
    };
  }[];
};

const POST_CARD_SELECT = {
  id: true, slug: true, title: true, excerpt: true,
  coverImage: true, publishedAt: true, authorName: true,
  region: true, city: true, neighborhood: true, tags: true,
} as const;

// ─── Queries públicas ──────────────────────────────────────────────────────────

export async function getPublishedPosts(): Promise<PostCard[]> {
  return prisma.post.findMany({
    where:   { published: true },
    orderBy: { publishedAt: "desc" },
    select:  POST_CARD_SELECT,
  }) as unknown as PostCard[];
}

export async function getLatestPosts(take = 3): Promise<PostCard[]> {
  return prisma.post.findMany({
    where:   { published: true },
    orderBy: { publishedAt: "desc" },
    take,
    select:  POST_CARD_SELECT,
  }) as unknown as PostCard[];
}

export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  return prisma.post.findUnique({
    where:  { slug, published: true },
    select: {
      ...POST_CARD_SELECT,
      content: true,
      seoTitle: true,
      seoDescription: true,
      updatedAt: true,
      relatedProperties: {
        select: {
          property: {
            select: {
              id: true, slug: true, title: true, type: true,
              region: true, city: true, neighborhood: true,
              bedrooms: true, areaTotal: true, priceAsk: true,
              images: true,
            },
          },
        },
      },
    },
  }) as unknown as PostDetail | null;
}

export async function getAllPostSlugs(): Promise<string[]> {
  const posts = await prisma.post.findMany({
    where:  { published: true },
    select: { slug: true },
  });
  return posts.map((p) => p.slug);
}

// ─── Imóveis para o PropertyShowcase ──────────────────────────────────────────

export async function getPropertiesByRegion(region: Region, take = 3) {
  return prisma.property.findMany({
    where:   { region, status: "DISPONIVEL", active: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take,
    select: {
      id: true, slug: true, title: true, type: true,
      region: true, city: true, neighborhood: true,
      bedrooms: true, areaTotal: true, priceAsk: true, priceRent: true,
      images: true,
    },
  });
}

export async function getPropertiesByNeighborhood(neighborhood: string, take = 3) {
  return prisma.property.findMany({
    where: {
      neighborhood: { contains: neighborhood, mode: "insensitive" },
      status: "DISPONIVEL",
      active: true,
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take,
    select: {
      id: true, slug: true, title: true, type: true,
      region: true, city: true, neighborhood: true,
      bedrooms: true, areaTotal: true, priceAsk: true, priceRent: true,
      images: true,
    },
  });
}

// ─── Helper — leitura estimada ─────────────────────────────────────────────────

export function estimateReadingTime(content: string): number {
  const words = content.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
