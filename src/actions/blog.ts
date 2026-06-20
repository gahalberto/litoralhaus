"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";
import { requireSession } from "@/lib/session";
import { postFormSchema, type PostActionResult } from "@/types/blog";

export type { PostFormData, PostActionResult } from "@/types/blog";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const existing = await prisma.post.findFirst({
    where: { slug: base, ...(excludeId && { id: { not: excludeId } }) },
  });
  if (!existing) return base;
  return `${base}-${Date.now().toString(36)}`;
}

function parseTags(raw?: string): string[] {
  if (!raw) return [];
  return raw.split(",").map((t) => t.trim()).filter(Boolean);
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createPost(raw: unknown): Promise<PostActionResult> {
  await requireSession();

  const parsed = postFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const d = parsed.data;
  const slug = await uniqueSlug(d.slug || slugify(d.title));

  try {
    const post = await prisma.post.create({
      data: {
        title:       d.title,
        slug,
        excerpt:     d.excerpt,
        content:     d.content,
        coverImage:  d.coverImage || null,
        published:   d.published,
        publishedAt: d.published
          ? (d.publishedAt ? new Date(d.publishedAt) : new Date())
          : null,
        authorName:  d.authorName,
        region:      d.region ?? null,
        city:        d.city || null,
        neighborhood: d.neighborhood || null,
        tags:        parseTags(d.tagsRaw),
        seoTitle:    d.seoTitle || null,
        seoDescription: d.seoDescription || null,
      },
    });

    revalidatePath("/blog");
    revalidatePath("/admin/blog");
    return { success: true, id: post.id };
  } catch {
    return { success: false, error: "Erro ao criar post. Verifique se o slug já está em uso." };
  }
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updatePost(raw: unknown): Promise<PostActionResult> {
  await requireSession();

  const parsed = postFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const d = parsed.data;
  if (!d.id) return { success: false, error: "ID do post não informado" };

  const slug = await uniqueSlug(d.slug || slugify(d.title), d.id);

  try {
    await prisma.post.update({
      where: { id: d.id },
      data: {
        title:       d.title,
        slug,
        excerpt:     d.excerpt,
        content:     d.content,
        coverImage:  d.coverImage || null,
        published:   d.published,
        publishedAt: d.published
          ? (d.publishedAt ? new Date(d.publishedAt) : new Date())
          : null,
        authorName:  d.authorName,
        region:      d.region ?? null,
        city:        d.city || null,
        neighborhood: d.neighborhood || null,
        tags:        parseTags(d.tagsRaw),
        seoTitle:    d.seoTitle || null,
        seoDescription: d.seoDescription || null,
      },
    });

    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
    revalidatePath("/admin/blog");
    return { success: true, id: d.id };
  } catch {
    return { success: false, error: "Erro ao salvar post. Verifique se o slug já está em uso." };
  }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deletePost(id: string): Promise<void> {
  await requireSession();
  const post = await prisma.post.findUnique({ where: { id }, select: { slug: true } });
  await prisma.post.delete({ where: { id } });
  if (post) {
    revalidatePath(`/blog/${post.slug}`);
    revalidatePath("/blog");
  }
  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}

// ─── Queries admin ────────────────────────────────────────────────────────────

export async function getAdminPosts() {
  return prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, title: true, slug: true,
      published: true, publishedAt: true,
      region: true, neighborhood: true,
      tags: true, updatedAt: true,
    },
  });
}

export async function getAdminPostById(id: string) {
  return prisma.post.findUnique({
    where: { id },
    select: {
      id: true, title: true, slug: true, excerpt: true, content: true,
      coverImage: true, published: true, publishedAt: true, authorName: true,
      region: true, city: true, neighborhood: true,
      tags: true, seoTitle: true, seoDescription: true,
    },
  });
}
