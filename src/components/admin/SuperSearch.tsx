"use client";

import { useEffect, useRef, useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Building2, FileText, UserCheck, Loader2, CornerDownLeft, X } from "lucide-react";
import { superSearch, type SearchResultItem, type SuperSearchResult } from "@/actions/super-search";
import { cn } from "@/lib/utils";

// ─── Ícones por categoria ─────────────────────────────────────────────────────

const CATEGORY_META = {
  imovel:       { label: "Imóveis",       Icon: Building2,  color: "text-amber-500"  },
  blog:         { label: "Blog",          Icon: FileText,   color: "text-blue-500"   },
  proprietario: { label: "Proprietários", Icon: UserCheck,  color: "text-emerald-500" },
} as const;

// ─── Componente ───────────────────────────────────────────────────────────────

interface SuperSearchProps {
  open:    boolean;
  onClose: () => void;
}

export function SuperSearch({ open, onClose }: SuperSearchProps) {
  const router = useRouter();
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState<SuperSearchResult | null>(null);
  const [cursor, setCursor]   = useState(0);
  const [isPending, startTransition] = useTransition();

  const inputRef   = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Todos os resultados em ordem ──────────────────────────────────────────
  const allItems: SearchResultItem[] = results
    ? [...results.imoveis, ...results.blog, ...results.proprietarios]
    : [];

  // ── ⌘K / Ctrl+K global ───────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); onClose(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // ── Focar input ao abrir ──────────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 30);
      setQuery("");
      setResults(null);
      setCursor(0);
    }
  }, [open]);

  // ── Busca com debounce ────────────────────────────────────────────────────
  const search = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const res = await superSearch(q);
        setResults(res);
        setCursor(0);
      });
    }, 280);
  }, []);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setQuery(v);
    if (v.length >= 2) search(v);
    else setResults(null);
  }

  // ── Navegação por teclado ─────────────────────────────────────────────────
  function handleKeyDown(e: React.KeyboardEvent) {
    if (!allItems.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(c + 1, allItems.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
    if (e.key === "Escape") { onClose(); return; }
    if (e.key === "Enter" && allItems[cursor]) {
      router.push(allItems[cursor].href);
      onClose();
    }
  }

  function handleSelect(item: SearchResultItem) {
    router.push(item.href);
    onClose();
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Painel */}
      <div
        className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
          {isPending
            ? <Loader2 size={16} className="shrink-0 animate-spin text-zinc-400" />
            : <Search size={16} className="shrink-0 text-zinc-400" />
          }
          <input
            ref={inputRef}
            value={query}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Buscar imóvel, post, proprietário..."
            className="flex-1 bg-transparent font-inter text-sm text-zinc-900 placeholder:text-zinc-400 outline-none dark:text-zinc-100"
          />
          {query && (
            <button onClick={() => { setQuery(""); setResults(null); inputRef.current?.focus(); }}>
              <X size={14} className="text-zinc-400 hover:text-zinc-600" />
            </button>
          )}
          <kbd className="hidden shrink-0 rounded border border-zinc-200 px-1.5 py-0.5 font-inter text-[10px] text-zinc-400 dark:border-zinc-700 sm:inline-flex">
            ESC
          </kbd>
        </div>

        {/* Resultados */}
        <div className="max-h-[60vh] overflow-y-auto">
          {/* Estado vazio */}
          {!results && !isPending && (
            <div className="px-4 py-10 text-center">
              <p className="font-inter text-sm text-zinc-400">
                Digite pelo menos 2 caracteres para buscar
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {(["REF001", "Enseada", "João", "Como é morar"] as const).map((ex) => (
                  <button
                    key={ex}
                    onClick={() => { setQuery(ex); search(ex); }}
                    className="rounded-full border border-zinc-200 px-3 py-1 font-inter text-xs text-zinc-500 transition hover:border-zinc-400 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sem resultados */}
          {results && results.total === 0 && (
            <div className="px-4 py-10 text-center">
              <p className="font-inter text-sm text-zinc-400">
                Nenhum resultado para <strong className="text-zinc-700 dark:text-zinc-300">&quot;{query}&quot;</strong>
              </p>
            </div>
          )}

          {/* Grupos de resultados */}
          {results && results.total > 0 && (
            <div className="py-2">
              {(["imoveis", "blog", "proprietarios"] as const).map((key) => {
                const items = results[key];
                if (!items.length) return null;

                const catKey = key === "imoveis" ? "imovel" : key === "blog" ? "blog" : "proprietario";
                const { label, Icon, color } = CATEGORY_META[catKey];

                return (
                  <div key={key}>
                    {/* Header do grupo */}
                    <div className="flex items-center gap-2 px-4 py-2">
                      <Icon size={11} className={color} />
                      <span className="font-inter text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                        {label}
                      </span>
                    </div>

                    {/* Items */}
                    {items.map((item) => {
                      const globalIdx = allItems.indexOf(item);
                      const isActive = globalIdx === cursor;

                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setCursor(globalIdx)}
                          className={cn(
                            "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
                            isActive
                              ? "bg-amber-50 dark:bg-amber-400/10"
                              : "hover:bg-zinc-50 dark:hover:bg-zinc-900"
                          )}
                        >
                          <Icon size={15} className={cn("shrink-0", isActive ? color : "text-zinc-300 dark:text-zinc-600")} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="truncate font-inter text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                {item.label}
                              </span>
                              {item.badge && (
                                <span className="shrink-0 rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            {item.sublabel && (
                              <p className="truncate font-inter text-[11px] text-zinc-400">
                                {item.sublabel}
                              </p>
                            )}
                          </div>
                          {isActive && (
                            <CornerDownLeft size={12} className="shrink-0 text-zinc-300" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer com dicas de teclado */}
        {results && results.total > 0 && (
          <div className="flex items-center gap-4 border-t border-zinc-100 px-4 py-2 dark:border-zinc-800">
            <span className="flex items-center gap-1 font-inter text-[10px] text-zinc-400">
              <kbd className="rounded border border-zinc-200 px-1 dark:border-zinc-700">↑↓</kbd> navegar
            </span>
            <span className="flex items-center gap-1 font-inter text-[10px] text-zinc-400">
              <kbd className="rounded border border-zinc-200 px-1 dark:border-zinc-700">↵</kbd> abrir
            </span>
            <span className="flex items-center gap-1 font-inter text-[10px] text-zinc-400">
              <kbd className="rounded border border-zinc-200 px-1 dark:border-zinc-700">ESC</kbd> fechar
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
