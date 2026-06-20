"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition, useRef, useEffect, useState } from "react";
import { Search, X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { PropertyStatus, PropertyType, PropertyPurpose, Region } from "@prisma/client";
import {
  PROPERTY_STATUS_CONFIG,
  PROPERTY_TYPE_LABELS,
  REGION_LABELS,
  PURPOSE_CONFIG,
} from "@/lib/property-config";
import { cn } from "@/lib/utils";

// ─── helpers ──────────────────────────────────────────────────────────────────

function useUpdateParams() {
  const router    = useRouter();
  const pathname  = usePathname();
  const sp        = useSearchParams();

  return useCallback(
    (updates: Record<string, string | null>) => {
      const p = new URLSearchParams(sp.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (v === null || v === "") p.delete(k);
        else p.set(k, v);
      }
      router.push(`${pathname}?${p.toString()}`);
    },
    [router, pathname, sp]
  );
}

// ─── Search input ─────────────────────────────────────────────────────────────

export function PropertySearchInput({ defaultValue }: { defaultValue: string }) {
  const update  = useUpdateParams();
  const [, start] = useTransition();
  const debounce  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [value, setValue] = useState(defaultValue);

  useEffect(() => { setValue(defaultValue); }, [defaultValue]);

  function handleChange(v: string) {
    setValue(v);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      start(() => update({ q: v || null }));
    }, 300);
  }

  return (
    <div className="relative flex items-center">
      <Search size={14} className="pointer-events-none absolute left-3 text-muted-foreground/50" />
      <input
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Buscar por ref., título, bairro, cidade..."
        className="h-9 w-72 rounded-lg border border-border bg-background pl-9 pr-8 font-inter text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-colors focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30"
      />
      {value && (
        <button
          onClick={() => handleChange("")}
          className="absolute right-2.5 text-muted-foreground/50 hover:text-muted-foreground"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}

// ─── Filter pill ──────────────────────────────────────────────────────────────

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded px-2.5 py-1 font-inter text-[11px] transition-colors",
        active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

// ─── Inline filter pills ──────────────────────────────────────────────────────

export function PropertyFilterPills() {
  const sp     = useSearchParams();
  const update = useUpdateParams();

  const status  = sp.get("status")  as PropertyStatus  | null;
  const type    = sp.get("type")    as PropertyType    | null;
  const isca    = sp.get("isca");

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
      {/* Status */}
      <div className="flex items-center gap-1.5">
        <span className="mr-1 font-inter text-[10px] uppercase tracking-widest text-muted-foreground/50">
          Status
        </span>
        <Pill active={!status} onClick={() => update({ status: null })}>Todos</Pill>
        {Object.values(PropertyStatus).map((s) => (
          <Pill key={s} active={status === s} onClick={() => update({ status: s })}>
            {PROPERTY_STATUS_CONFIG[s].label}
          </Pill>
        ))}
      </div>

      <div className="h-4 w-px shrink-0 bg-border" />

      {/* Tipo */}
      <div className="flex items-center gap-1.5">
        <span className="mr-1 font-inter text-[10px] uppercase tracking-widest text-muted-foreground/50">
          Tipo
        </span>
        <Pill active={!type} onClick={() => update({ type: null })}>Todos</Pill>
        {Object.values(PropertyType).map((t) => (
          <Pill key={t} active={type === t} onClick={() => update({ type: t })}>
            {PROPERTY_TYPE_LABELS[t]}
          </Pill>
        ))}
      </div>

      <div className="h-4 w-px shrink-0 bg-border" />

      {/* Isca */}
      <div className="flex items-center gap-1.5">
        <span className="mr-1 font-inter text-[10px] uppercase tracking-widest text-muted-foreground/50">
          Isca
        </span>
        <Pill active={isca === null}  onClick={() => update({ isca: null })}>Todos</Pill>
        <Pill active={isca === "1"}   onClick={() => update({ isca: "1"  })}>Ativa</Pill>
        <Pill active={isca === "0"}   onClick={() => update({ isca: "0"  })}>Inativa</Pill>
      </div>
    </div>
  );
}

// ─── Advanced filters panel ───────────────────────────────────────────────────

export function PropertyAdvancedFilters() {
  const sp     = useSearchParams();
  const update = useUpdateParams();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const region   = sp.get("region")   as Region          | null;
  const purpose  = sp.get("purpose")  as PropertyPurpose | null;
  const active   = sp.get("active");
  const featured = sp.get("featured");

  const advancedCount = [region, purpose, active, featured].filter(Boolean).length;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  function clearAll() {
    update({ region: null, purpose: null, active: null, featured: null });
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-9 items-center gap-2 rounded-lg border px-3 font-inter text-xs transition-colors",
          advancedCount > 0
            ? "border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-400"
            : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
        )}
      >
        <SlidersHorizontal size={13} />
        Filtros avançados
        {advancedCount > 0 && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 font-inter text-[10px] font-bold text-stone-950">
            {advancedCount}
          </span>
        )}
        <ChevronDown size={12} className={cn("transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-30 w-80 rounded-xl border border-border bg-white shadow-xl dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="font-inter text-xs font-semibold text-foreground">Filtros avançados</span>
            {advancedCount > 0 && (
              <button
                onClick={clearAll}
                className="font-inter text-[11px] text-muted-foreground hover:text-foreground"
              >
                Limpar tudo
              </button>
            )}
          </div>

          <div className="space-y-5 p-4">
            {/* Região */}
            <div>
              <p className="mb-2 font-inter text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Região
              </p>
              <div className="flex flex-wrap gap-1.5">
                <Pill active={!region} onClick={() => update({ region: null })}>Todas</Pill>
                {Object.values(Region).map((r) => (
                  <Pill key={r} active={region === r} onClick={() => update({ region: r })}>
                    {REGION_LABELS[r]}
                  </Pill>
                ))}
              </div>
            </div>

            {/* Finalidade */}
            <div>
              <p className="mb-2 font-inter text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Finalidade
              </p>
              <div className="flex flex-wrap gap-1.5">
                <Pill active={!purpose} onClick={() => update({ purpose: null })}>Todas</Pill>
                {Object.values(PropertyPurpose).map((p) => (
                  <Pill key={p} active={purpose === p} onClick={() => update({ purpose: p })}>
                    {PURPOSE_CONFIG[p].icon} {PURPOSE_CONFIG[p].label}
                  </Pill>
                ))}
              </div>
            </div>

            {/* Ativo */}
            <div>
              <p className="mb-2 font-inter text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Visibilidade
              </p>
              <div className="flex gap-1.5">
                <Pill active={active === null} onClick={() => update({ active: null })}>Todos</Pill>
                <Pill active={active === "1"}  onClick={() => update({ active: "1"  })}>Ativo</Pill>
                <Pill active={active === "0"}  onClick={() => update({ active: "0"  })}>Inativo</Pill>
              </div>
            </div>

            {/* Destaque */}
            <div>
              <p className="mb-2 font-inter text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Destaque
              </p>
              <div className="flex gap-1.5">
                <Pill active={featured === null} onClick={() => update({ featured: null })}>Todos</Pill>
                <Pill active={featured === "1"}  onClick={() => update({ featured: "1"  })}>★ Com destaque</Pill>
                <Pill active={featured === "0"}  onClick={() => update({ featured: "0"  })}>Sem destaque</Pill>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Clear all button ─────────────────────────────────────────────────────────

export function ClearAllFilters() {
  const sp     = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const hasFilters = Array.from(sp.keys()).some((k) => k !== "");
  if (!hasFilters) return null;

  return (
    <button
      onClick={() => router.push(pathname)}
      className="flex items-center gap-1 font-inter text-xs text-muted-foreground hover:text-foreground"
    >
      <X size={12} />
      Limpar filtros
    </button>
  );
}
