import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getHighlights, getAmenities, getProximities } from "@/actions/catalog";
import { getPropertyById } from "@/actions/properties";
import { getPropertyCategories } from "@/actions/property-categories";
import { PropertyForm } from "@/components/admin/PropertyForm";
import { PropertyLogPanel } from "@/components/admin/PropertyLogPanel";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Editar Imóvel" };

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [property, highlights, amenities, proximities, categories, session] = await Promise.all([
    getPropertyById(id),
    getHighlights(),
    getAmenities(),
    getProximities(),
    getPropertyCategories(),
    getSession(),
  ]);

  if (!property) notFound();

  const initialData = {
    id:           property.id,
    title:        property.title,
    slug:         property.slug,
    type:             property.type,
    status:           property.status,
    active:           property.active,
    isIsca:           property.isIsca,
    featured:         property.featured,
    acceptsFinancing: property.acceptsFinancing,
    exclusive:        property.exclusive,
    region:       property.region,
    cep:          property.cep ?? "",
    city:         property.city,
    neighborhood: property.neighborhood,
    address:           property.address ?? "",
    addressNumber:     property.addressNumber ?? "",
    showAddressNumber: property.showAddressNumber ?? false,
    bedrooms:     property.bedrooms?.toString() ?? "",
    bathrooms:    property.bathrooms?.toString() ?? "",
    suites:       property.suites?.toString() ?? "",
    parkingSpots: property.parkingSpots?.toString() ?? "",
    areaTotal:    property.areaTotal?.toString() ?? "",
    areaUsable:   property.areaUsable?.toString() ?? "",
    priceAsk:     property.priceAsk?.toString() ?? "",
    priceRent:    property.priceRent?.toString() ?? "",
    condoFee:     property.condoFee?.toString() ?? "",
    iptu:         property.iptu?.toString() ?? "",
    description:  property.description ?? "",
    imagesRaw:    property.images.join("\n"),
    highlightIds:  property.highlights.map((h) => h.highlightId),
    amenityIds:    property.amenities.map((a) => a.amenityId),
    proximityIds:  property.proximities.map((p) => p.proximityId),
    averbada:          property.averbada,
    escritura:         property.escritura,
    placaImobiliaria:  property.placaImobiliaria,
    localChaves:       property.localChaves ?? "",
    purposes:          property.purposes,
    categoryId:        property.categoryId ?? "",
    reviewIntervalDays: property.reviewIntervalDays?.toString() ?? "90",
    ownerId:    property.ownerId    ?? "",
    ownerName:  property.ownerName  ?? "",
    ownerPhone: property.ownerPhone ?? "",
    agentId:    property.agentId    ?? "",
    refCode:    property.refCode ?? undefined,
    seoTitle:       property.seoTitle ?? "",
    seoDescription: property.seoDescription ?? "",
    latitude:       property.latitude  ? Number(property.latitude)  : undefined,
    longitude:      property.longitude ? Number(property.longitude) : undefined,
  };

  const isAdmin = session?.role === "ADMIN";

  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <nav className="mb-8 flex items-center gap-2 font-inter text-xs text-muted-foreground">
        <Link href="/admin/properties" className="hover:text-foreground">
          Imóveis
        </Link>
        <span>/</span>
        <span className="truncate max-w-48 text-foreground">{property.title}</span>
        <span>/</span>
        <span className="text-foreground">Editar</span>
      </nav>

      <div className="mb-8">
        <h1 className="font-cormorant text-2xl font-light text-foreground">
          Editar Imóvel
        </h1>
        <p className="mt-1 font-inter text-xs text-muted-foreground">
          {property.title}
        </p>
      </div>

      <PropertyForm
        highlights={highlights}
        amenities={amenities}
        categories={categories}
        initialData={initialData}
        proximities={proximities}
        initialOwner={property.owner ?? null}
        initialAgent={property.agent ?? null}
        initialCreatedBy={property.createdBy ?? null}
        isAdmin={isAdmin}
      />

      {isAdmin && property.logs.length > 0 && (
        <PropertyLogPanel logs={property.logs} />
      )}
    </div>
  );
}
