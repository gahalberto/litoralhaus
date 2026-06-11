import Link from "next/link";
import Image from "next/image";
import type { PublicProperty } from "@/lib/public-properties";
import { PROPERTY_TYPE_LABELS, REGION_LABELS, formatPrice } from "@/lib/property-config";

export function PropertyCard({ p }: { p: PublicProperty }) {
  const cover = p.images[0];

  return (
    <Link
      href={`/imoveis/${p.slug}`}
      className="group flex flex-col overflow-hidden border border-border bg-card transition-all duration-300 hover:border-amber-400/40"
    >
      {/* Imagem */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {cover ? (
          <Image
            src={cover}
            alt={p.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-muted-foreground/30">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-3 top-3 flex gap-1.5">
          {p.featured && (
            <span className="rounded-none bg-amber-400 px-2 py-0.5 font-inter text-[9px] font-medium uppercase tracking-widest text-stone-950">
              Destaque
            </span>
          )}
          {p.isIsca && (
            <span className="rounded-none bg-background/80 px-2 py-0.5 font-inter text-[9px] uppercase tracking-widest text-muted-foreground backdrop-blur-sm">
              Oportunidade
            </span>
          )}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex flex-1 flex-col p-5">
        <p className="mb-1 font-inter text-[10px] uppercase tracking-widest text-amber-400/70">
          {PROPERTY_TYPE_LABELS[p.type]} · {REGION_LABELS[p.region]}
        </p>
        <h3 className="mb-3 font-cormorant text-lg font-light leading-snug text-foreground line-clamp-2 transition-colors group-hover:text-amber-500">
          {p.title}
        </h3>
        <p className="mb-4 font-inter text-xs text-muted-foreground transition-colors group-hover:text-amber-500/70">
          {p.neighborhood}, {p.city}
        </p>

        {/* Stats */}
        <div className="mb-4 flex gap-4 border-t border-border pt-4">
          {p.bedrooms != null && (
            <span className="flex items-center gap-1 font-inter text-xs text-muted-foreground">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="5" width="14" height="8" rx="1" stroke="currentColor" strokeWidth="1.2" />
                <path d="M1 9h14M5 9V5a2 2 0 014 0v4" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              {p.bedrooms} dorm.
            </span>
          )}
          {p.bathrooms != null && (
            <span className="flex items-center gap-1 font-inter text-xs text-muted-foreground">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M2 8h12v3a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" stroke="currentColor" strokeWidth="1.2" />
                <path d="M2 8V4a2 2 0 014 0" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              {p.bathrooms} ban.
            </span>
          )}
          {p.areaTotal && (
            <span className="flex items-center gap-1 font-inter text-xs text-muted-foreground">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="1" width="14" height="14" rx="1" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              {Number(p.areaTotal).toLocaleString("pt-BR")} m²
            </span>
          )}
        </div>

        {/* Preço */}
        <div className="mt-auto">
          {p.priceAsk && (
            <p className="font-cormorant text-2xl font-light text-foreground">
              {formatPrice(p.priceAsk)}
            </p>
          )}
          {!p.priceAsk && p.priceRent && (
            <p className="font-inter text-sm text-muted-foreground">
              {formatPrice(p.priceRent)}<span className="text-xs">/mês</span>
            </p>
          )}
          {!p.priceAsk && !p.priceRent && (
            <p className="font-inter text-sm text-muted-foreground">Consulte o preço</p>
          )}
        </div>
      </div>
    </Link>
  );
}
