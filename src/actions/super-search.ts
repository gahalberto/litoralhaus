"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export type SearchResultItem = {
  id:       string;
  label:    string;
  sublabel: string;
  badge?:   string;
  href:     string;
  category: "imovel" | "blog" | "proprietario";
};

export type SuperSearchResult = {
  imoveis:       SearchResultItem[];
  blog:          SearchResultItem[];
  proprietarios: SearchResultItem[];
  total:         number;
};

export async function superSearch(query: string): Promise<SuperSearchResult> {
  await requireSession();

  const q = query.trim();
  if (q.length < 2) return { imoveis: [], blog: [], proprietarios: [], total: 0 };

  const [properties, posts, owners] = await Promise.all([
    prisma.property.findMany({
      where: {
        OR: [
          { refCode:      { contains: q, mode: "insensitive" } },
          { title:        { contains: q, mode: "insensitive" } },
          { address:      { contains: q, mode: "insensitive" } },
          { neighborhood: { contains: q, mode: "insensitive" } },
          { city:         { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, title: true, refCode: true, neighborhood: true, city: true, status: true },
      take: 6,
      orderBy: { updatedAt: "desc" },
    }),

    prisma.post.findMany({
      where: { title: { contains: q, mode: "insensitive" } },
      select: { id: true, title: true, published: true, publishedAt: true },
      take: 4,
      orderBy: { createdAt: "desc" },
    }),

    prisma.owner.findMany({
      where: {
        OR: [
          { name:  { contains: q, mode: "insensitive" } },
          { phone: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, phone: true, email: true },
      take: 4,
      orderBy: { name: "asc" },
    }),
  ]);

  const imoveis: SearchResultItem[] = properties.map((p) => ({
    id:       p.id,
    label:    p.title,
    sublabel: [p.neighborhood, p.city].filter(Boolean).join(", "),
    badge:    p.refCode ?? undefined,
    href:     `/admin/properties/${p.id}/edit`,
    category: "imovel",
  }));

  const blog: SearchResultItem[] = posts.map((p) => ({
    id:       p.id,
    label:    p.title,
    sublabel: p.published ? "Publicado" : "Rascunho",
    href:     `/admin/blog/${p.id}`,
    category: "blog",
  }));

  const proprietarios: SearchResultItem[] = owners.map((o) => ({
    id:       o.id,
    label:    o.name,
    sublabel: [o.phone, o.email].filter(Boolean).join(" · "),
    href:     `/admin/owners/${o.id}/edit`,
    category: "proprietario",
  }));

  return {
    imoveis,
    blog,
    proprietarios,
    total: imoveis.length + blog.length + proprietarios.length,
  };
}
