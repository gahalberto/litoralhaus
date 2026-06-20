"use client";

import Link from "next/link";
import Image from "next/image";
import type { PublicProperty } from "@/lib/public-properties";
import { PROPERTY_TYPE_LABELS, REGION_LABELS, formatPrice } from "@/lib/property-config";

const WA_PHONE = "5513955422935";

function stripHtml(html: string | null): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
const BASE_URL = "https://litoralhaus.com.br";

function waHref(p: PublicProperty) {
  const msg = encodeURIComponent(
    `Olá! Tenho interesse no imóvel "${p.title}" — ${BASE_URL}/imoveis/${p.slug}`
  );
  return `https://wa.me/${WA_PHONE}?text=${msg}`;
}

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
        <h3 className="mb-3 font-cormorant text-lg font-semibold leading-snug text-foreground line-clamp-2 transition-colors group-hover:text-amber-500">
          {p.title}
        </h3>
        <p className="mb-3 font-inter text-xs text-muted-foreground transition-colors group-hover:text-amber-500/70">
          {p.neighborhood}, {p.city}
        </p>

        {p.description && (
          <p className="mb-4 font-inter text-xs leading-relaxed text-muted-foreground line-clamp-4">
            {stripHtml(p.description)}
          </p>
        )}

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

        {/* Preço + Botão WhatsApp */}
        <div className="mt-auto flex items-center justify-between gap-2">
          <div>
            {p.priceAsk && (
              <p className="font-cormorant text-2xl font-bold text-foreground">
                {formatPrice(p.priceAsk)}
              </p>
            )}
            {!p.priceAsk && p.priceRent && (
              <p className="font-inter text-sm font-bold text-foreground">
                {formatPrice(p.priceRent)}<span className="text-xs font-normal">/mês</span>
              </p>
            )}
            {!p.priceAsk && !p.priceRent && (
              <p className="font-inter text-sm text-muted-foreground">Consulte o preço</p>
            )}
          </div>

          <a
            href={waHref(p)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            aria-label="Falar conosco pelo WhatsApp"
            className="flex shrink-0 items-center gap-1.5 rounded-none border border-[#25D366] px-3 py-1.5 font-inter text-xs font-medium text-[#25D366] transition-all hover:bg-[#25D366] hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 shrink-0">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Falar conosco
          </a>
        </div>
      </div>
    </Link>
  );
}
