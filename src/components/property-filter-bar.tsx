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

type PanelId = "region" | "neighborhood" | "price" | "bedrooms" | "more";

interface OpenState {
  panel: PanelId;
  rect: DOMRect;
}

interface PropertyFilterBarProps {
  regions:       Region[];
  neighborhoods: string[];
}

export function PropertyFilterBar({ regions, neighborhoods }: PropertyFilterBarProps) {
  const router = useRouter();
  const sp     = useSearchParams();
  const [open, setOpen] = useState<OpenState | null>(null);

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

  function toggle(panel: PanelId, e: React.MouseEvent<HTMLButtonElement>) {
    if (open?.panel === panel) {
      setOpen(null);
    } else {
      setOpen({ panel, rect: e.currentTarget.getBoundingClientRect() });
    }
  }

  const closeOnOutside = useCallback((e: MouseEvent) => {
    const target = e.target as Element;
    if (target.closest("[data-filter-bar]") || target.closest("[data-filter-dropdown]")) return;
    setOpen(null);
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", closeOnOutside);
    return () => document.removeEventListener("mousedown", closeOnOutside);
  }, [closeOnOutside]);

  // Reposition dropdown on scroll/resize
  useEffect(() => {
    if (!open) return;
    function reclose() { setOpen(null); }
    window.addEventListener("scroll", reclose, true);
    window.addEventListener("resize", reclose);
    return () => {
      window.removeEventListener("scroll", reclose, true);
      window.removeEventListener("resize", reclose);
    };
  }, [open]);

  const btnCls = (active: boolean, isOpen: boolean) =>
    cn(
      "flex h-full items-center gap-1.5 px-4 font-inter text-sm transition-colors select-none whitespace-nowrap cursor-pointer",
      isOpen
        ? "bg-stone-100 dark:bg-white/5 text-foreground"
        : "text-foreground hover:bg-stone-50 dark:hover:bg-white/5",
      active && "font-semibold"
    );

  const panelStyle = open
    ? { position: "fixed" as const, top: open.rect.bottom + 4, left: open.rect.left, zIndex: 9999 }
    : {};

  const panelBase =
    "min-w-52 border border-border bg-background shadow-xl";

  const optionCls = (selected: boolean) =>
    cn(
      "flex w-full items-center px-4 py-2.5 font-inter text-sm transition-colors cursor-pointer text-left",
      selected
        ? "bg-amber-50 dark:bg-amber-400/10 text-amber-700 dark:text-amber-400 font-medium"
        : "text-foreground hover:bg-stone-50 dark:hover:bg-white/5"
    );

  return (
    <>
      {/* Bar */}
      <div
        data-filter-bar
        className="flex h-12 items-stretch divide-x divide-border overflow-x-auto border border-border bg-background"
      >
        {/* Cidade */}
        <button
          onClick={(e) => toggle("region", e)}
          className={btnCls(!!currentRegion, open?.panel === "region")}
          aria-expanded={open?.panel === "region"}
        >
          <span>{currentRegion ? REGION_LABELS[currentRegion as Region] : "Cidade"}</span>
          <Chevron />
        </button>

        {/* Bairro */}
        <button
          onClick={(e) => toggle("neighborhood", e)}
          className={btnCls(!!currentNeighborhood, open?.panel === "neighborhood")}
          aria-expanded={open?.panel === "neighborhood"}
        >
          <span className={cn("font-normal", !currentNeighborhood && "text-muted-foreground")}>
            {currentNeighborhood || "Bairros"}
          </span>
          <Chevron />
        </button>

        {/* Preço */}
        <button
          onClick={(e) => toggle("price", e)}
          className={btnCls(!!currentPrice, open?.panel === "price")}
          aria-expanded={open?.panel === "price"}
        >
          <span>{currentPrice ? PRICE_RANGES[Number(currentPrice)]?.label : "Preço"}</span>
          <Chevron />
        </button>

        {/* Quartos */}
        <button
          onClick={(e) => toggle("bedrooms", e)}
          className={btnCls(!!currentBedrooms, open?.panel === "bedrooms")}
          aria-expanded={open?.panel === "bedrooms"}
        >
          <span>
            {currentBedrooms
              ? BEDROOMS_OPTIONS.find((o) => o.value === currentBedrooms)?.label ?? "Quartos"
              : "Quartos"}
          </span>
          <Chevron />
        </button>

        {/* Mais filtros */}
        <button
          onClick={(e) => toggle("more", e)}
          className={cn(btnCls(false, open?.panel === "more"), "gap-2")}
          aria-expanded={open?.panel === "more"}
        >
          <FilterIcon />
          <span>Mais filtros</span>
        </button>

        {/* Limpar */}
        {activeCount > 0 && (
          <button
            onClick={() => { router.push("/imoveis"); setOpen(null); }}
            className="ml-auto flex items-center px-4 font-inter text-sm text-muted-foreground transition-colors hover:text-foreground whitespace-nowrap cursor-pointer"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Dropdowns — rendered outside overflow container, fixed positioning */}
      {open?.panel === "region" && (
        <div data-filter-dropdown style={panelStyle} className={panelBase}>
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

      {open?.panel === "neighborhood" && (
        <div data-filter-dropdown style={panelStyle} className={cn(panelBase, "min-w-64")}>
          <NeighborhoodSearch
            neighborhoods={neighborhoods}
            current={currentNeighborhood}
            onSelect={(v) => navigate({ neighborhood: v || undefined })}
          />
        </div>
      )}

      {open?.panel === "price" && (
        <div data-filter-dropdown style={panelStyle} className={panelBase}>
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

      {open?.panel === "bedrooms" && (
        <div data-filter-dropdown style={panelStyle} className={panelBase}>
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

      {open?.panel === "more" && (
        <div data-filter-dropdown style={panelStyle} className={cn(panelBase, "min-w-48")}>
          <div className="px-4 py-2 font-inter text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border">
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
    </>
  );
}

function Chevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0 text-muted-foreground">
      <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
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
  const [q, setQ] = useState("");
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
          "flex w-full items-center px-4 py-2.5 font-inter text-sm transition-colors cursor-pointer text-left",
          !current ? "text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-400/10" : "text-foreground hover:bg-stone-50 dark:hover:bg-white/5"
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
              "flex w-full items-center px-4 py-2.5 font-inter text-sm transition-colors cursor-pointer text-left",
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
