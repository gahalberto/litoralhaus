"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star, MapPin, Bed, Bath, Maximize, Car } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/property-config";
import type { PublicProperty } from "@/lib/public-properties";

function cloudinaryOptimized(url: string, width = 800): string {
  if (!url.includes("res.cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/c_fill,f_auto,q_auto,w_${width}/`);
}

export function FeaturedPropertyCard({ p }: { p: PublicProperty }) {
  const [favorited, setFavorited] = useState(false);
  const cover = p.images[0];

  return (
    <div className="group relative overflow-hidden rounded-xl" style={{ aspectRatio: "3/4" }}>

      {/* ── Background imersivo ──────────────────────────────────────────── */}
      {cover ? (
        <Image
          src={cloudinaryOptimized(cover, 800)}
          alt={p.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority
        />
      ) : (
        <div className="absolute inset-0 bg-stone-800" />
      )}

      {/* ── Gradient overlay ─────────────────────────────────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

      {/* ── Top badges ───────────────────────────────────────────────────── */}
      <div className="absolute left-3 right-3 top-3 z-10 flex items-start justify-between gap-2">
        {/* Esquerda: RECOMENDADO + status */}
        <div className="flex flex-wrap gap-1.5">
          <span className="flex items-center gap-1 rounded bg-yellow-500 px-2 py-1 font-inter text-[10px] font-black uppercase tracking-widest text-black shadow">
            <Star size={10} className="fill-black" />
            Recomendado
          </span>
          <span className="rounded bg-white px-2 py-1 font-inter text-[10px] font-semibold text-black shadow">
            Disponível
          </span>
        </div>

        {/* Direita: favoritar */}
        <button
          onClick={() => setFavorited((f) => !f)}
          aria-label={favorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-md transition-transform hover:scale-110"
        >
          <Heart
            size={14}
            className={cn(
              "transition-colors",
              favorited ? "fill-red-500 text-red-500" : "text-gray-500"
            )}
          />
        </button>
      </div>

      {/* ── Conteúdo inferior ────────────────────────────────────────────── */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col">
        <div className="space-y-3 p-4">

          {/* Título */}
          <div>
            <h3 className="font-inter text-xl font-bold leading-tight text-white">
              {p.title}
            </h3>
            {/* Endereço */}
            <div className="mt-1 flex items-center gap-1 text-gray-300">
              <MapPin size={11} className="shrink-0" />
              <span className="font-inter text-xs">
                {[p.neighborhood, p.city].filter(Boolean).join(", ")}
              </span>
            </div>
          </div>

          {/* Descrição — glassmorphism */}
          {p.images.length > 0 && (
            <div className="rounded-md border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
              <p className="line-clamp-3 font-inter text-xs leading-relaxed text-gray-200">
                Imóvel selecionado pela curadoria Litoral Haus. Localizado em{" "}
                {p.neighborhood}, {p.city}, com acabamento de médio e alto padrão.{" "}
                <Link
                  href={`/imoveis/${p.slug}`}
                  className="font-semibold text-yellow-400 hover:text-yellow-300"
                >
                  Ver mais →
                </Link>
              </p>
            </div>
          )}

          {/* Grid de características — glassmorphism */}
          <div className="grid grid-cols-4 divide-x divide-white/10 rounded-md border border-white/10 bg-black/30 backdrop-blur-sm">
            {[
              { icon: <Bed size={13} />,      value: p.bedrooms  ?? "—", label: "dorm." },
              { icon: <Bath size={13} />,     value: p.bathrooms ?? "—", label: "ban."  },
              { icon: <Maximize size={13} />, value: p.areaTotal ? `${Number(p.areaTotal).toLocaleString("pt-BR")}` : "—", label: "m²" },
              { icon: <Car size={13} />,      value: 0,                  label: "vaga"  },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5 px-2 py-2">
                <span className="text-gray-400">{item.icon}</span>
                <span className="font-inter text-sm font-bold text-white">{item.value}</span>
                <span className="font-inter text-[9px] uppercase tracking-wide text-gray-400">{item.label}</span>
              </div>
            ))}
          </div>

        </div>

        {/* ── Rodapé amarelo com preço ──────────────────────────────────── */}
        <Link
          href={`/imoveis/${p.slug}`}
          className="flex items-center justify-between bg-amber-500 px-4 py-3 transition-colors hover:bg-amber-400"
        >
          <div>
            <p className="font-inter text-[10px] uppercase tracking-wide text-black/60">
              {p.priceRent && !p.priceAsk ? "Locação a partir de" : "Venda a partir de"}
            </p>
            <p className="font-inter text-lg font-black text-black">
              {formatPrice(p.priceAsk ?? p.priceRent)}
            </p>
          </div>
          <span className="font-inter text-xs font-bold text-black/70">
            Ver imóvel →
          </span>
        </Link>
      </div>

    </div>
  );
}
