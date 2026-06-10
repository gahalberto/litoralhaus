"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Bed, Bath, Maximize, Car } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── WhatsApp SVG (não existe no lucide-react) ────────────────────────────────

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface PropertyCardV2Props {
  image:          string;
  title:          string;
  address:        string;
  description:    string;
  price:          number;
  bedrooms:       number;
  bathrooms:      number;
  areaSqm:        number;
  parkingSpots:   number;
  href?:          string;
  whatsappHref?:  string;
  status?:        string;
  isExclusive?:   boolean;
  photoCount?:    number;
  isFavorited?:   boolean;
  priceLabel?:    string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PropertyCardV2({
  image,
  title,
  address,
  description,
  price,
  bedrooms,
  bathrooms,
  areaSqm,
  parkingSpots,
  href           = "#",
  whatsappHref   = "#",
  status         = "Em Obras",
  isExclusive    = false,
  photoCount,
  isFavorited    = false,
  priceLabel     = "Venda a partir de",
}: PropertyCardV2Props) {
  const [favorited, setFavorited] = useState(isFavorited);

  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style:    "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md">

      {/* ── Imagem ─────────────────────────────────────────────────────────── */}
      <Link href={href} className="relative block aspect-video w-full overflow-hidden bg-gray-100">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Ribbon diagonal "EXCLUSIVIDADE" */}
        {isExclusive && (
          <div className="pointer-events-none absolute -left-8 top-5 z-10 w-36 overflow-hidden">
            <div className="flex -rotate-45 items-center justify-center bg-yellow-400 px-10 py-1 shadow">
              <span className="whitespace-nowrap font-inter text-[9px] font-black uppercase tracking-widest text-black">
                Exclusividade
              </span>
            </div>
          </div>
        )}

        {/* Botão favoritar */}
        <button
          onClick={(e) => { e.preventDefault(); setFavorited((f) => !f); }}
          aria-label={favorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-200 hover:scale-110"
        >
          <Heart
            size={16}
            className={cn(
              "transition-colors duration-200",
              favorited ? "fill-red-500 text-red-500" : "text-gray-500"
            )}
          />
        </button>

        {/* Badge "Veja mais fotos" */}
        {photoCount != null && photoCount > 1 && (
          <span className="absolute bottom-3 right-3 z-10 rounded bg-black/60 px-2 py-1 font-inter text-[10px] text-white backdrop-blur-sm">
            Veja mais {photoCount} fotos
          </span>
        )}
      </Link>

      {/* ── Corpo ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-5">

        {/* Status tag */}
        {status && (
          <span className="mb-3 inline-block self-start rounded bg-gray-100 px-2.5 py-1 font-inter text-[11px] font-medium text-gray-700">
            {status}
          </span>
        )}

        {/* Título */}
        <h3 className="mb-1 font-inter text-lg font-bold leading-tight text-gray-900">
          {title}
        </h3>

        {/* Endereço */}
        <p className="mb-3 font-inter text-sm text-gray-500">
          {address}
        </p>

        {/* Descrição */}
        <p className="mb-4 line-clamp-3 font-inter text-sm leading-relaxed text-gray-400">
          {description}{" "}
          <Link
            href={href}
            className="font-semibold text-gray-900 hover:underline"
          >
            Ver mais
          </Link>
        </p>

        {/* Grid de características 2×2 */}
        <div className="mb-5 grid grid-cols-2 gap-x-4 gap-y-2.5">
          <AmenityItem icon={<Bed size={14} />}      label={`${bedrooms} ${bedrooms === 1 ? "Quarto" : "Quartos"}`} />
          <AmenityItem icon={<Bath size={14} />}     label={`${bathrooms} ${bathrooms === 1 ? "Banheiro" : "Banheiros"}`} />
          <AmenityItem icon={<Maximize size={14} />} label={`${areaSqm} m²`} />
          <AmenityItem icon={<Car size={14} />}      label={`${parkingSpots} ${parkingSpots === 1 ? "Vaga" : "Vagas"}`} />
        </div>

        {/* Rodapé: preço + CTA */}
        <div className="mt-auto flex items-end justify-between gap-3">

          {/* Preço */}
          <div className="min-w-0">
            <p className="font-inter text-[10px] uppercase tracking-wide text-gray-400">
              {priceLabel}
            </p>
            <p className="font-inter text-xl font-bold text-gray-900">
              {formattedPrice}
            </p>
          </div>

          {/* Botão composto: Fale conosco + WhatsApp */}
          <div className="flex shrink-0 overflow-hidden rounded-md shadow-sm">
            <Link
              href={href}
              className="flex items-center bg-gray-900 px-4 py-2.5 font-inter text-xs font-semibold text-white transition-colors hover:bg-gray-800"
            >
              Fale conosco
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contato via WhatsApp"
              className="flex w-10 items-center justify-center bg-[#25D366] text-white transition-colors hover:bg-[#20b958]"
            >
              <WhatsAppIcon className="h-4 w-4" />
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Subcomponente ────────────────────────────────────────────────────────────

function AmenityItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-gray-600">
      <span className="shrink-0 text-gray-400">{icon}</span>
      <span className="font-inter text-sm">{label}</span>
    </div>
  );
}
