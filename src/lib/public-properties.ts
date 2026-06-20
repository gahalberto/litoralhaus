import { prisma } from "@/lib/prisma";
import { PropertyType, Region } from "@prisma/client";

export type PublicProperty = {
  id:           string;
  slug:         string;
  title:        string;
  type:         PropertyType;
  region:       Region;
  city:         string;
  neighborhood: string;
  bedrooms:     number | null;
  bathrooms:    number | null;
  areaTotal:    string | null;
  priceAsk:     string | null;
  priceRent:    string | null;
  images:       string[];
  featured:     boolean;
  isIsca:       boolean;
};

export type PublicPropertyDetail = PublicProperty & {
  description:       string | null;
  address:           string | null;
  addressNumber:     string | null;
  showAddressNumber: boolean;
  suites:            number | null;
  parkingSpots:      number | null;
  areaUsable:        string | null;
  condoFee:          string | null;
  iptu:              string | null;
  highlights:        { highlight: { label: string } }[];
  amenities:         { amenity:   { label: string } }[];
  proximities:       { proximity: { label: string } }[];
  seoTitle:          string | null;
  seoDescription:    string | null;
  acceptsFinancing:  boolean;
  exclusive:         boolean;
};

export type PropertyFilters = {
  q?:           string;
  type?:        PropertyType;
  region?:      Region;
  neighborhood?: string;
  bedrooms?:    number;
  minPrice?:    number;
  maxPrice?:    number;
};

export async function getPublicProperties(filters: PropertyFilters = {}): Promise<PublicProperty[]> {
  const { q, type, region, neighborhood, bedrooms, minPrice, maxPrice } = filters;

  return prisma.property.findMany({
    where: {
      status: "DISPONIVEL",
      ...(type         && { type }),
      ...(region       && { region }),
      ...(neighborhood && { neighborhood: { contains: neighborhood, mode: "insensitive" } }),
      ...(bedrooms != null && bedrooms >= 4
        ? { bedrooms: { gte: 4 } }
        : bedrooms != null
        ? { bedrooms }
        : {}),
      ...(q && {
        OR: [
          { title:        { contains: q, mode: "insensitive" } },
          { neighborhood: { contains: q, mode: "insensitive" } },
          { city:         { contains: q, mode: "insensitive" } },
          { description:  { contains: q, mode: "insensitive" } },
        ],
      }),
      ...(minPrice != null && { priceAsk: { gte: minPrice } }),
      ...(maxPrice != null && { priceAsk: { lte: maxPrice } }),
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    select: {
      id: true, slug: true, title: true, type: true,
      region: true, city: true, neighborhood: true,
      bedrooms: true, bathrooms: true,
      areaTotal: true, priceAsk: true, priceRent: true,
      images: true, featured: true, isIsca: true,
    },
  }) as unknown as PublicProperty[];
}

export async function getFeaturedProperties(): Promise<PublicProperty[]> {
  return prisma.property.findMany({
    where: { status: "DISPONIVEL", featured: true },
    orderBy: { createdAt: "desc" },
    take: 6,
    select: {
      id: true, slug: true, title: true, type: true,
      region: true, city: true, neighborhood: true,
      bedrooms: true, bathrooms: true,
      areaTotal: true, priceAsk: true, priceRent: true,
      images: true, featured: true, isIsca: true,
    },
  }) as unknown as PublicProperty[];
}

export async function getNeighborhoods(region?: Region): Promise<string[]> {
  const rows = await prisma.property.findMany({
    where: { status: "DISPONIVEL", ...(region && { region }) },
    select: { neighborhood: true },
    distinct: ["neighborhood"],
    orderBy: { neighborhood: "asc" },
  });
  return rows.map((r) => r.neighborhood).filter(Boolean);
}

export async function getAvailableRegions(): Promise<Region[]> {
  const rows = await prisma.property.findMany({
    where:    { status: "DISPONIVEL" },
    select:   { region: true },
    distinct: ["region"],
    orderBy:  { region: "asc" },
  });
  return rows.map((r) => r.region);
}

export async function getPublicPropertyBySlug(slug: string): Promise<PublicPropertyDetail | null> {
  return prisma.property.findUnique({
    where: { slug, status: "DISPONIVEL" },
    select: {
      id: true, slug: true, title: true, type: true,
      region: true, city: true, neighborhood: true, address: true,
      addressNumber: true, showAddressNumber: true,
      bedrooms: true, bathrooms: true, suites: true, parkingSpots: true,
      areaTotal: true, areaUsable: true,
      priceAsk: true, priceRent: true, condoFee: true, iptu: true,
      images: true, featured: true, isIsca: true,
      description: true,
      highlights:  { select: { highlight:  { select: { label: true } } } },
      amenities:   { select: { amenity:    { select: { label: true } } } },
      proximities: { select: { proximity:  { select: { label: true } } } },
      seoTitle: true, seoDescription: true, acceptsFinancing: true, exclusive: true,
    },
  }) as unknown as PublicPropertyDetail | null;
}
