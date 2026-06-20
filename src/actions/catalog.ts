"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type CatalogItem = { id: string; label: string };

export async function getHighlights(): Promise<CatalogItem[]> {
  return prisma.highlight.findMany({ orderBy: { label: "asc" } });
}

export async function getAmenities(): Promise<CatalogItem[]> {
  return prisma.amenity.findMany({ orderBy: { label: "asc" } });
}

export async function getProximities(): Promise<CatalogItem[]> {
  return prisma.proximity.findMany({ orderBy: { label: "asc" } });
}

export async function createHighlight(
  label: string
): Promise<{ success: boolean; item?: CatalogItem; error?: string }> {
  const clean = label.trim();
  if (!clean || clean.length < 2) return { success: false, error: "Mínimo 2 caracteres." };

  try {
    const item = await prisma.highlight.create({ data: { label: clean } });
    revalidatePath("/admin/properties/new");
    return { success: true, item };
  } catch {
    return { success: false, error: "Destaque já existe." };
  }
}

export async function createAmenity(
  label: string
): Promise<{ success: boolean; item?: CatalogItem; error?: string }> {
  const clean = label.trim();
  if (!clean || clean.length < 2) return { success: false, error: "Mínimo 2 caracteres." };

  try {
    const item = await prisma.amenity.create({ data: { label: clean } });
    revalidatePath("/admin/properties/new");
    return { success: true, item };
  } catch {
    return { success: false, error: "Comodidade já existe." };
  }
}

export async function createProximity(
  label: string
): Promise<{ success: boolean; item?: CatalogItem; error?: string }> {
  const clean = label.trim();
  if (!clean || clean.length < 2) return { success: false, error: "Mínimo 2 caracteres." };

  try {
    const item = await prisma.proximity.create({ data: { label: clean } });
    revalidatePath("/admin/properties/new");
    return { success: true, item };
  } catch {
    return { success: false, error: "Proximidade já existe." };
  }
}
