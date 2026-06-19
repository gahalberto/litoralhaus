"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";
import { propertyFormSchema, type PropertyActionResult } from "@/types/property";
import { PropertyStatus, PropertyType, Region } from "@prisma/client";
import { requireSession } from "@/lib/session";

function calcNextReview(intervalDays: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + intervalDays);
  return d;
}

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

function nameInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

async function generateRefCode(prefix: string): Promise<string> {
  const count = await prisma.property.count();
  let n = count + 1;
  for (;;) {
    const code = `${prefix}${String(n).padStart(4, "0")}`;
    const exists = await prisma.property.findUnique({ where: { refCode: code } });
    if (!exists) return code;
    n++;
  }
}

// ─── Create ────────────────────────────────────────────────────────────────────

export async function createProperty(
  raw: unknown
): Promise<PropertyActionResult> {
  const parsed = propertyFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const session = await requireSession();
  const d = parsed.data;
  const slug = await uniqueSlug(d.slug || slugify(d.title));

  let prefixName = session.name;
  if (d.agentId) {
    const agent = await prisma.user.findUnique({ where: { id: d.agentId }, select: { name: true } });
    if (agent) prefixName = agent.name;
  }
  const refCode = await generateRefCode(nameInitials(prefixName));

  try {
    const property = await prisma.property.create({
      data: {
        refCode,
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
        bedrooms:     toNum(d.bedrooms),
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
        ownerId:    d.ownerId    || undefined,
        purposes:   d.purposes,
        categoryId: d.categoryId || undefined,
        reviewIntervalDays: toNum(d.reviewIntervalDays) ?? 90,
        nextReviewAt: calcNextReview(toNum(d.reviewIntervalDays) ?? 90),
        ownerName:  d.ownerName  || undefined,
        ownerPhone: d.ownerPhone || undefined,
        seoTitle:       d.seoTitle,
        seoDescription: d.seoDescription,
        // Responsáveis
        createdById: session.userId,
        agentId:     d.agentId || session.userId,
        // Log de criação
        logs: {
          create: {
            userId:   session.userId,
            userName: session.name,
            action:   "CREATED",
          },
        },
      },
    });

    revalidatePath("/admin/properties");
    return { success: true, id: property.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    return { success: false, error: msg };
  }
}

// ─── Status ────────────────────────────────────────────────────────────────────

export async function updatePropertyStatus(
  id: string,
  status: PropertyStatus
): Promise<void> {
  const session = await requireSession();
  const old = await prisma.property.findUnique({ where: { id }, select: { status: true } });

  await prisma.$transaction([
    prisma.property.update({ where: { id }, data: { status } }),
    prisma.propertyLog.create({
      data: {
        propertyId: id,
        userId:     session.userId,
        userName:   session.name,
        action:     "UPDATED",
        field:      "status",
        oldValue:   old?.status ?? null,
        newValue:   status,
      },
    }),
  ]);

  revalidatePath("/admin/properties");
}

// ─── Read ──────────────────────────────────────────────────────────────────────

export async function getPropertyById(id: string) {
  return prisma.property.findUnique({
    where: { id },
    include: {
      highlights: { select: { highlightId: true } },
      amenities:  { select: { amenityId:   true } },
      owner:       { select: { id: true, name: true, phone: true, email: true, cpf: true } },
      createdBy:   { select: { id: true, name: true, email: true, role: true, avatar: true } },
      agent:       { select: { id: true, name: true, email: true, role: true, avatar: true } },
      logs: {
        orderBy: { createdAt: "desc" },
        take: 200,
        include: { user: { select: { avatar: true } } },
      },
    },
  });
}

// ─── Update ────────────────────────────────────────────────────────────────────

const LOGGABLE_FIELDS: Array<{ key: string; label: string }> = [
  { key: "title",              label: "Título"            },
  { key: "slug",               label: "Slug"              },
  { key: "status",             label: "Status"            },
  { key: "purposes",           label: "Finalidade"        },
  { key: "type",               label: "Tipo (legado)"     },
  { key: "categoryId",         label: "Categoria"         },
  { key: "region",             label: "Região"            },
  { key: "city",               label: "Cidade"            },
  { key: "neighborhood",       label: "Bairro"            },
  { key: "address",            label: "Logradouro"        },
  { key: "addressNumber",      label: "Número"            },
  { key: "bedrooms",           label: "Quartos"           },
  { key: "bathrooms",          label: "Banheiros"         },
  { key: "suites",             label: "Suítes"            },
  { key: "parkingSpots",       label: "Vagas"             },
  { key: "areaTotal",          label: "Área Total"        },
  { key: "areaUsable",         label: "Área Útil"         },
  { key: "priceAsk",           label: "Preço de Venda"    },
  { key: "priceRent",          label: "Preço de Locação"  },
  { key: "condoFee",           label: "Condomínio"        },
  { key: "iptu",               label: "IPTU"              },
  { key: "description",        label: "Descrição"         },
  { key: "featured",           label: "Destaque"          },
  { key: "isIsca",             label: "Imóvel Isca"       },
  { key: "ownerId",            label: "Proprietário"      },
  { key: "agentId",            label: "Corretor Resp."    },
  { key: "reviewIntervalDays", label: "Intervalo Revisão" },
  { key: "seoTitle",           label: "SEO Title"         },
  { key: "seoDescription",     label: "SEO Description"   },
];

export async function updateProperty(
  id: string,
  raw: unknown
): Promise<PropertyActionResult> {
  const parsed = propertyFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const session = await requireSession();
  const d = parsed.data;

  // Busca dados atuais para diff
  const old = await prisma.property.findUnique({
    where:  { id },
    select: {
      title: true, slug: true, status: true, purposes: true, type: true,
      categoryId: true, region: true, city: true, neighborhood: true,
      address: true, addressNumber: true, bedrooms: true, bathrooms: true,
      suites: true, parkingSpots: true, areaTotal: true, areaUsable: true,
      priceAsk: true, priceRent: true, condoFee: true, iptu: true,
      description: true, featured: true, isIsca: true, ownerId: true,
      agentId: true, reviewIntervalDays: true, seoTitle: true, seoDescription: true,
    },
  });

  const newData = {
    title:              d.title,
    slug:               d.slug || slugify(d.title),
    status:             d.status,
    purposes:           d.purposes,
    type:               d.type,
    categoryId:         d.categoryId || null,
    region:             d.region,
    city:               d.city,
    neighborhood:       d.neighborhood,
    address:            d.address ?? null,
    addressNumber:      d.addressNumber || null,
    bedrooms:           toNum(d.bedrooms) ?? null,
    bathrooms:          toNum(d.bathrooms) ?? null,
    suites:             toNum(d.suites) ?? null,
    parkingSpots:       toNum(d.parkingSpots) ?? null,
    areaTotal:          toNum(d.areaTotal) ?? null,
    areaUsable:         toNum(d.areaUsable) ?? null,
    priceAsk:           toNum(d.priceAsk) ?? null,
    priceRent:          toNum(d.priceRent) ?? null,
    condoFee:           toNum(d.condoFee) ?? null,
    iptu:               toNum(d.iptu) ?? null,
    description:        d.description ?? null,
    featured:           d.featured,
    isIsca:             d.isIsca,
    ownerId:            d.ownerId || null,
    agentId:            d.agentId || null,
    reviewIntervalDays: toNum(d.reviewIntervalDays) ?? 90,
    seoTitle:           d.seoTitle ?? null,
    seoDescription:     d.seoDescription ?? null,
  };

  // Gera logs por campo alterado
  const logEntries: Array<{
    propertyId: string; userId: string; userName: string;
    action: string; field: string; oldValue: string | null; newValue: string | null;
  }> = [];

  if (old) {
    for (const { key, label } of LOGGABLE_FIELDS) {
      const rawOld = old[key as keyof typeof old];
      const rawNew = newData[key as keyof typeof newData];
      const oldVal = Array.isArray(rawOld) ? rawOld.join(", ") : String(rawOld ?? "");
      const newVal = Array.isArray(rawNew) ? rawNew.join(", ") : String(rawNew ?? "");
      if (oldVal !== newVal) {
        logEntries.push({
          propertyId: id,
          userId:     session.userId,
          userName:   session.name,
          action:     "UPDATED",
          field:      label,
          oldValue:   oldVal || null,
          newValue:   newVal || null,
        });
      }
    }
  }

  try {
    await prisma.$transaction([
      prisma.propertyHighlight.deleteMany({ where: { propertyId: id } }),
      prisma.propertyAmenity.deleteMany({ where: { propertyId: id } }),
      prisma.property.update({
        where: { id },
        data: {
          ...newData,
          showAddressNumber: d.showAddressNumber,
          cep:          d.cep?.replace(/\D/g, "") || undefined,
          nextReviewAt: calcNextReview(toNum(d.reviewIntervalDays) ?? 90),
          ownerName:    d.ownerName  || undefined,
          ownerPhone:   d.ownerPhone || undefined,
          images:       splitLines(d.imagesRaw),
          highlights: {
            create: (d.highlightIds ?? []).map((highlightId) => ({ highlightId })),
          },
          amenities: {
            create: (d.amenityIds ?? []).map((amenityId) => ({ amenityId })),
          },
        },
      }),
      ...(logEntries.length > 0
        ? [prisma.propertyLog.createMany({ data: logEntries })]
        : []),
    ]);

    revalidatePath("/admin/properties");
    revalidatePath(`/admin/properties/${id}/edit`);
    return { success: true, id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    return { success: false, error: msg };
  }
}

// ─── Delete ────────────────────────────────────────────────────────────────────

export async function deleteProperty(id: string): Promise<void> {
  await prisma.property.delete({ where: { id } });
  revalidatePath("/admin/properties");
}

// ─── Listing ───────────────────────────────────────────────────────────────────

export type PropertyRow = {
  id: string;
  refCode: string | null;
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
      id: true, refCode: true, title: true, type: true, status: true,
      city: true, neighborhood: true, region: true,
      priceAsk: true, isIsca: true, featured: true, createdAt: true,
      _count: { select: { interests: true } },
    },
  }) as unknown as PropertyRow[];
}
