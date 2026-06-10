"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Region } from "@prisma/client";
import { REGION_LABELS, PRICE_RANGES } from "@/lib/property-config";

export function HeroSearch({ regions }: { regions: Region[] }) {
  const router = useRouter();
  const [region, setRegion] = useState("GUARUJA");
  const [price, setPrice]   = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (region) params.set("region", region);
    if (price !== "")  params.set("price", price);
    router.push(`/imoveis${params.size ? `?${params}` : ""}`);
  }

  const selectCls =
    "w-full appearance-none bg-transparent font-inter text-sm text-stone-100 outline-none placeholder:text-stone-500 cursor-pointer";

  return (
    <form
      onSubmit={handleSearch}
      className="mt-10 w-full max-w-2xl"
      aria-label="Busca de imóveis"
    >
      <div className="flex flex-col overflow-hidden border border-stone-700 bg-stone-900/80 backdrop-blur-sm sm:flex-row">
        {/* Região */}
        <div className="flex flex-1 items-center gap-3 border-b border-stone-700 px-5 py-4 sm:border-b-0 sm:border-r">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-amber-400/60" aria-hidden>
            <path d="M8 1.5C5.52 1.5 3.5 3.52 3.5 6c0 3.75 4.5 8.5 4.5 8.5S12.5 9.75 12.5 6c0-2.48-2.02-4.5-4.5-4.5z" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          <div className="flex-1">
            <p className="mb-0.5 font-inter text-[9px] uppercase tracking-widest text-stone-500">
              Onde você quer morar?
            </p>
            <select value={region} onChange={(e) => setRegion(e.target.value)} className={selectCls}>
              <option value="" className="bg-stone-900">Todas as cidades</option>
              {regions.map((r) => (
                <option key={r} value={r} className="bg-stone-900">
                  {REGION_LABELS[r]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Preço */}
        <div className="flex flex-1 items-center gap-3 border-b border-stone-700 px-5 py-4 sm:border-b-0 sm:border-r">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-amber-400/60" aria-hidden>
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M8 4.5v7M6 6h2.5a1.5 1.5 0 010 3H6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <div className="flex-1">
            <p className="mb-0.5 font-inter text-[9px] uppercase tracking-widest text-stone-500">
              Valor até
            </p>
            <select value={price} onChange={(e) => setPrice(e.target.value)} className={selectCls}>
              <option value="" className="bg-stone-900">Qualquer valor</option>
              {PRICE_RANGES.map((range, i) => (
                <option key={i} value={String(i)} className="bg-stone-900">
                  {range.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botão */}
        <button
          type="submit"
          className="flex items-center justify-center gap-2 bg-amber-400 px-8 py-4 font-inter text-xs font-medium uppercase tracking-widest text-stone-950 transition-all duration-200 hover:bg-amber-300 sm:w-auto"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          Buscar
        </button>
      </div>
    </form>
  );
}
