import Link from "next/link";
import Image from "next/image";
import type { Region } from "@prisma/client";
import { getPropertiesByRegion, getPropertiesByNeighborhood } from "@/lib/blog";
import { PROPERTY_TYPE_LABELS, REGION_LABELS, formatPrice } from "@/lib/property-config";
import { Bed, Maximize, ArrowRight } from "lucide-react";

interface PropertyShowcaseProps {
  region?:      Region;
  neighborhood?: string;
  title?:       string;
}

export async function PropertyShowcase({ region, neighborhood, title }: PropertyShowcaseProps) {
  const properties = neighborhood
    ? await getPropertiesByNeighborhood(neighborhood)
    : region
    ? await getPropertiesByRegion(region)
    : [];

  if (properties.length === 0) return null;

  const heading = title ?? (neighborhood
    ? `Imóveis à venda em ${neighborhood}`
    : region
    ? `Imóveis à venda em ${REGION_LABELS[region]}`
    : "Imóveis em destaque");

  return (
    <aside className="not-prose my-10 rounded-2xl border border-border bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="font-inter text-[10px] uppercase tracking-widest text-amber-600">
            Curadoria Litoral Haus
          </p>
          <h3 className="mt-0.5 font-cormorant text-xl font-semibold text-gray-900">
            {heading}
          </h3>
        </div>
        {region && (
          <Link
            href={`/imoveis?region=${region}`}
            className="flex items-center gap-1 font-inter text-xs font-medium text-amber-700 transition hover:text-amber-900"
          >
            Ver todos <ArrowRight size={13} />
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {properties.map((p) => {
          const image = p.images[0];
          const price = p.priceAsk ?? p.priceRent;

          return (
            <Link
              key={p.id}
              href={`/imoveis/${p.slug}`}
              className="group block overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="relative h-36 w-full overflow-hidden bg-gray-100">
                {image ? (
                  <Image
                    src={image}
                    alt={p.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="font-inter text-xs text-gray-300">sem foto</span>
                  </div>
                )}
                <div className="absolute left-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 font-inter text-[10px] font-bold uppercase tracking-wide text-white">
                  {PROPERTY_TYPE_LABELS[p.type as keyof typeof PROPERTY_TYPE_LABELS]}
                </div>
              </div>
              <div className="p-3">
                <p className="line-clamp-2 font-inter text-[13px] font-medium leading-snug text-gray-900">
                  {p.title}
                </p>
                <p className="mt-0.5 font-inter text-[11px] text-gray-400">
                  {p.neighborhood}, {p.city}
                </p>
                <div className="mt-2 flex items-center gap-3 font-inter text-[11px] text-gray-500">
                  {p.bedrooms != null && (
                    <span className="flex items-center gap-1">
                      <Bed size={11} className="text-amber-500" /> {p.bedrooms} dorm.
                    </span>
                  )}
                  {p.areaTotal && (
                    <span className="flex items-center gap-1">
                      <Maximize size={11} className="text-amber-500" />
                      {Number(p.areaTotal).toLocaleString("pt-BR")} m²
                    </span>
                  )}
                </div>
                {price && (
                  <p className="mt-2 font-inter text-sm font-bold text-gray-900">
                    {formatPrice(String(price))}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
