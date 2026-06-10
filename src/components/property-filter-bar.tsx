"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Region } from "@prisma/client";
import { REGION_LABELS, PRICE_RANGES } from "@/lib/property-config";
import { cn } from "@/lib/utils";

const BEDROOMS_OPTIONS = [
  { label: "1 quarto",   value: "1" },
  { label: "2 quartos",  value: "2" },
  { label: "3 quartos",  value: "3" },
  { label: "4+ quartos", value: "4" },
];

type OpenPanel = "region" | "neighborhood" | "price" | "bedrooms" | "more" | null;

interface PropertyFilterBarProps {
  regions:       Region[];
  neighborhoods: string[];
}

export function PropertyFilterBar({ regions, neighborhoods }: PropertyFilterBarProps) {
  const router     = useRouter();
  const sp         = useSearchParams();
  const barRef     = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<OpenPanel>(null);

  const currentRegion       = sp.get("region")       ?? "";
  const currentNeighborhood = sp.get("neighborhood") ?? "";
  const currentPrice        = sp.get("price")        ?? "";
  const currentBedrooms     = sp.get("bedrooms")     ?? "";

  const activeCount = [currentRegion, currentNeighborhood, currentPrice, currentBedrooms]
    .filter(Boolean).length;

  function navigate(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (!v) params.delete(k);
      else params.set(k, v);
    }
    router.push(`/imoveis${params.size ? `?${params}` : ""}`);
    setOpen(null);
  }

  const closeOnOutside = useCallback((e: MouseEvent) => {
    if (barRef.current && !barRef.current.contains(e.target as Node)) {
      setOpen(null);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", closeOnOutside);
    return () => document.removeEventListener("mousedown", closeOnOutside);
  }, [closeOnOutside]);

  function toggle(panel: OpenPanel) {
    setOpen((prev) => (prev === panel ? null : panel));
  }

  const btnCls = (active: boolean, isOpen: boolean) =>
    cn(
      "flex h-full items-center gap-1.5 px-4 font-inter text-sm transition-colors select-none whitespace-nowrap",
      isOpen
        ? "bg-stone-100 dark:bg-white/5 text-foreground"
        : "text-foreground hover:bg-stone-50 dark:hover:bg-white/5",
      active && "font-medium"
    );

  const optionCls = (selected: boolean) =>
    cn(
      "flex w-full items-center px-4 py-2.5 font-inter text-sm transition-colors cursor-pointer",
      selected
        ? "bg-amber-50 dark:bg-amber-400/10 text-amber-700 dark:text-amber-400 font-medium"
        : "text-foreground hover:bg-stone-50 dark:hover:bg-white/5"
    );

  const panelCls =
    "absolute top-full left-0 z-50 mt-1 min-w-52 border border-border bg-background shadow-lg";

  return (
    <div
      ref={barRef}
      className="flex h-12 items-stretch divide-x divide-border overflow-x-auto border border-border bg-background"
    >
      {/* Cidade */}
      <div className="relative">
        <button
          onClick={() => toggle("region")}
          className={btnCls(!!currentRegion, open === "region")}
          aria-expanded={open === "region"}
        >
          <span>{currentRegion ? REGION_LABELS[currentRegion as Region] : "Cidade"}</span>
          <Chevron />
        </button>
        {open === "region" && (
          <div className={panelCls}>
            <button onClick={() => navigate({ region: undefined, neighborhood: undefined })} className={optionCls(!currentRegion)}>
              Todas as cidades
            </button>
            {regions.map((r) => (
              <button
                key={r}
                onClick={() => navigate({ region: r, neighborhood: undefined })}
                className={optionCls(currentRegion === r)}
              >
                {REGION_LABELS[r]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bairro */}
      <div className="relative">
        <button
          onClick={() => toggle("neighborhood")}
          className={btnCls(!!currentNeighborhood, open === "neighborhood")}
          aria-expanded={open === "neighborhood"}
        >
          <span className="text-muted-foreground font-normal">
            {currentNeighborhood || "Pesquisar bairros..."}
          </span>
          <Chevron />
        </button>
        {open === "neighborhood" && (
          <div className={cn(panelCls, "min-w-64")}>
            <NeighborhoodSearch
              neighborhoods={neighborhoods}
              current={currentNeighborhood}
              onSelect={(v) => navigate({ neighborhood: v || undefined })}
            />
          </div>
        )}
      </div>

      {/* Preço */}
      <div className="relative">
        <button
          onClick={() => toggle("price")}
          className={btnCls(!!currentPrice, open === "price")}
          aria-expanded={open === "price"}
        >
          <span>{currentPrice ? PRICE_RANGES[Number(currentPrice)]?.label : "Preço"}</span>
          <Chevron />
        </button>
        {open === "price" && (
          <div className={panelCls}>
            <button onClick={() => navigate({ price: undefined })} className={optionCls(!currentPrice)}>
              Qualquer preço
            </button>
            {PRICE_RANGES.map((r, i) => (
              <button
                key={i}
                onClick={() => navigate({ price: String(i) })}
                className={optionCls(currentPrice === String(i))}
              >
                {r.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quartos */}
      <div className="relative">
        <button
          onClick={() => toggle("bedrooms")}
          className={btnCls(!!currentBedrooms, open === "bedrooms")}
          aria-expanded={open === "bedrooms"}
        >
          <span>
            {currentBedrooms
              ? BEDROOMS_OPTIONS.find((o) => o.value === currentBedrooms)?.label ?? "Quartos"
              : "Quartos"}
          </span>
          <Chevron />
        </button>
        {open === "bedrooms" && (
          <div className={panelCls}>
            <button onClick={() => navigate({ bedrooms: undefined })} className={optionCls(!currentBedrooms)}>
              Qualquer quantidade
            </button>
            {BEDROOMS_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => navigate({ bedrooms: o.value })}
                className={optionCls(currentBedrooms === o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mais filtros */}
      <div className="relative">
        <button
          onClick={() => toggle("more")}
          className={cn(btnCls(false, open === "more"), "gap-2")}
          aria-expanded={open === "more"}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <span className="font-medium">Mais filtros</span>
        </button>
        {open === "more" && (
          <div className={cn(panelCls, "min-w-48 right-0 left-auto")}>
            <div className="px-4 py-2 font-inter text-[10px] uppercase tracking-widest text-muted-foreground">
              Tipo de imóvel
            </div>
            {[
              { label: "Apartamento", value: "APARTMENT" },
              { label: "Casa",        value: "HOUSE"      },
              { label: "Cobertura",   value: "PENTHOUSE"  },
              { label: "Terreno",     value: "LAND"       },
              { label: "Comercial",   value: "COMMERCIAL" },
            ].map((t) => (
              <button
                key={t.value}
                onClick={() => navigate({ type: sp.get("type") === t.value ? undefined : t.value })}
                className={optionCls(sp.get("type") === t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Limpar filtros */}
      {activeCount > 0 && (
        <button
          onClick={() => { router.push("/imoveis"); setOpen(null); }}
          className="ml-auto flex items-center px-4 font-inter text-sm text-muted-foreground transition-colors hover:text-foreground whitespace-nowrap"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}

function Chevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0 text-muted-foreground">
      <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NeighborhoodSearch({
  neighborhoods,
  current,
  onSelect,
}: {
  neighborhoods: string[];
  current: string;
  onSelect: (v: string) => void;
}) {
  const [q, setQ] = useState(current);
  const filtered  = neighborhoods.filter((n) =>
    n.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div>
      <div className="border-b border-border px-3 py-2">
        <input
          autoFocus
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar bairro..."
          className="w-full bg-transparent font-inter text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
      </div>
      <div className="max-h-52 overflow-y-auto">
        <button onClick={() => onSelect("")} className={cn(
          "flex w-full items-center px-4 py-2.5 font-inter text-sm transition-colors cursor-pointer",
          !current ? "text-amber-600 dark:text-amber-400 font-medium" : "text-foreground hover:bg-stone-50 dark:hover:bg-white/5"
        )}>
          Todos os bairros
        </button>
        {filtered.length === 0 && (
          <p className="px-4 py-3 font-inter text-sm text-muted-foreground">Nenhum bairro encontrado</p>
        )}
        {filtered.map((n) => (
          <button
            key={n}
            onClick={() => onSelect(n)}
            className={cn(
              "flex w-full items-center px-4 py-2.5 font-inter text-sm transition-colors cursor-pointer",
              current === n
                ? "bg-amber-50 dark:bg-amber-400/10 text-amber-700 dark:text-amber-400 font-medium"
                : "text-foreground hover:bg-stone-50 dark:hover:bg-white/5"
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
