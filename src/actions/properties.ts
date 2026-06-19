"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";
import { propertyFormSchema, type PropertyActionResult } from "@/types/property";
import { PropertyStatus, PropertyType, Region } from "@prisma/client";

function splitLines(raw?: string): string[] {
  if (!raw) return [];
  return raw.split("\n").map((l) => l.trim()).filter(Boolean);
}

function toNum(v?: string): number | undefined {
  if (!v || v.trim() === "") return undefined;
  const n = Number(v);
  return isNaN(n) ? undefined : n;
}

async function uniqueSlug(base: string): Promise<string> {
  const existing = await prisma.property.findUnique({ where: { slug: base } });
  if (!existing) return base;
  const ts = Date.now().toString(36);
  return `${base}-${ts}`;
}

export async function createProperty(
  raw: unknown
): Promise<PropertyActionResult> {
  const parsed = propertyFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const d = parsed.data;
  const slug = await uniqueSlug(d.slug || slugify(d.title));

  try {
    const property = await prisma.property.create({
      data: {
        title:        d.title,
        slug,
        type:         d.type,
        status:       d.status,
        isIsca:       d.isIsca,
        featured:     d.featured,
        region:       d.region,
        cep:          d.cep?.replace(/\D/g, "") || undefined,
        city:         d.city,
        neighborhood: d.neighborhood,
        address:           d.address,
        addressNumber:     d.addressNumber || undefined,
        showAddressNumber: d.showAddressNumber,
        bedrooms:          toNum(d.bedrooms),
        bathrooms:    toNum(d.bathrooms),
        suites:       toNum(d.suites),
        parkingSpots: toNum(d.parkingSpots),
        areaTotal:    toNum(d.areaTotal),
        areaUsable:   toNum(d.areaUsable),
        priceAsk:     toNum(d.priceAsk),
        priceRent:    toNum(d.priceRent),
        condoFee:     toNum(d.condoFee),
        iptu:         toNum(d.iptu),
        description: d.description,
        images:      splitLines(d.imagesRaw),
        highlights: {
          create: (d.highlightIds ?? []).map((highlightId) => ({ highlightId })),
        },
        amenities: {
          create: (d.amenityIds ?? []).map((amenityId) => ({ amenityId })),
        },
        ownerId:    d.ownerId    || undefined,
        ownerName:  d.ownerName  || undefined,
        ownerPhone: d.ownerPhone || undefined,
        seoTitle:     d.seoTitle,
        seoDescription: d.seoDescription,
      },
    });

    revalidatePath("/admin/properties");
    return { success: true, id: property.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    return { success: false, error: msg };
  }
}

export async function updatePropertyStatus(
  id: string,
  status: PropertyStatus
): Promise<void> {
  await prisma.property.update({ where: { id }, data: { status } });
  revalidatePath("/admin/properties");
}

export async function getPropertyById(id: string) {
  return prisma.property.findUnique({
    where: { id },
    include: {
      highlights: { select: { highlightId: true } },
      amenities:  { select: { amenityId:  true } },
      owner: { select: { id: true, name: true, phone: true, email: true, cpf: true } },
    },
  });
}

export async function updateProperty(
  id: string,
  raw: unknown
): Promise<PropertyActionResult> {
  const parsed = propertyFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const d = parsed.data;

  try {
    await prisma.$transaction([
      prisma.propertyHighlight.deleteMany({ where: { propertyId: id } }),
      prisma.propertyAmenity.deleteMany({ where: { propertyId: id } }),
      prisma.property.update({
        where: { id },
        data: {
          title:        d.title,
          slug:         d.slug || slugify(d.title),
          type:         d.type,
          status:       d.status,
          isIsca:       d.isIsca,
          featured:     d.featured,
          region:       d.region,
          cep:          d.cep?.replace(/\D/g, "") || undefined,
          city:         d.city,
          neighborhood: d.neighborhood,
          address:           d.address,
          addressNumber:     d.addressNumber || undefined,
          showAddressNumber: d.showAddressNumber,
          bedrooms:          toNum(d.bedrooms),
          bathrooms:    toNum(d.bathrooms),
          suites:       toNum(d.suites),
          parkingSpots: toNum(d.parkingSpots),
          areaTotal:    toNum(d.areaTotal),
          areaUsable:   toNum(d.areaUsable),
          priceAsk:     toNum(d.priceAsk),
          priceRent:    toNum(d.priceRent),
          condoFee:     toNum(d.condoFee),
          iptu:         toNum(d.iptu),
          description:  d.description,
          images:       splitLines(d.imagesRaw),
          highlights: {
            create: (d.highlightIds ?? []).map((highlightId) => ({ highlightId })),
          },
          amenities: {
            create: (d.amenityIds ?? []).map((amenityId) => ({ amenityId })),
          },
          ownerId:    d.ownerId    || null,
          ownerName:  d.ownerName  || undefined,
          ownerPhone: d.ownerPhone || undefined,
          seoTitle:       d.seoTitle,
          seoDescription: d.seoDescription,
        },
      }),
    ]);

    revalidatePath("/admin/properties");
    revalidatePath(`/admin/properties/${id}/edit`);
    return { success: true, id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    return { success: false, error: msg };
  }
}

export async function deleteProperty(id: string): Promise<void> {
  await prisma.property.delete({ where: { id } });
  revalidatePath("/admin/properties");
}

// Leitura para o listing — não é Server Action mas fica no mesmo arquivo por conveniência
export type PropertyRow = {
  id: string;
  title: string;
  type: PropertyType;
  status: PropertyStatus;
  city: string;
  neighborhood: string;
  priceAsk: string | null;
  isIsca: boolean;
  featured: boolean;
  region: Region;
  createdAt: Date;
  _count: { interests: number };
};

export async function getProperties(filters?: {
  status?: PropertyStatus;
  type?: PropertyType;
  isIsca?: boolean;
  region?: Region;
}): Promise<PropertyRow[]> {
  return prisma.property.findMany({
    where: {
      ...(filters?.status  && { status:  filters.status  }),
      ...(filters?.type    && { type:    filters.type    }),
      ...(filters?.region  && { region:  filters.region  }),
      ...(filters?.isIsca !== undefined && { isIsca: filters.isIsca }),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, title: true, type: true, status: true,
      city: true, neighborhood: true, region: true,
      priceAsk: true, isIsca: true, featured: true, createdAt: true,
      _count: { select: { interests: true } },
    },
  }) as unknown as PropertyRow[];
}
