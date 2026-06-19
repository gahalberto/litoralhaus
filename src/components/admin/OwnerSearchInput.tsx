"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Search, X, UserCheck, Phone, Link2 } from "lucide-react";
import { getOwners } from "@/actions/owners";

type OwnerSummary = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  cpf: string | null;
};

interface Props {
  value: OwnerSummary | null;
  onChange: (owner: OwnerSummary | null) => void;
}

export function OwnerSearchInput({ value, onChange }: Props) {
  const [query, setQuery]         = useState("");
  const [results, setResults]     = useState<OwnerSummary[]>([]);
  const [loading, setLoading]     = useState(false);
  const [open, setOpen]           = useState(false);
  const containerRef              = useRef<HTMLDivElement>(null);
  const debounceRef               = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const search = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) { setResults([]); setOpen(false); return; }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await getOwners(q);
        setResults(res as OwnerSummary[]);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  function handleSelect(owner: OwnerSummary) {
    onChange(owner);
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  function handleClear() {
    onChange(null);
    setQuery("");
    setResults([]);
  }

  // ── Proprietário já vinculado ──────────────────────────────────────────────
  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-400/20 dark:bg-amber-400/5 px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-400/20">
          <UserCheck size={16} className="text-amber-600 dark:text-amber-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-inter text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {value.name}
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
            <span className="flex items-center gap-1 font-inter text-xs text-zinc-500">
              <Phone size={11} /> {value.phone}
            </span>
            {value.cpf && (
              <span className="font-inter text-xs text-zinc-400">CPF: {value.cpf}</span>
            )}
            {value.email && (
              <span className="font-inter text-xs text-zinc-400">{value.email}</span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <a
            href={`/admin/owners/${value.id}/edit`}
            target="_blank"
            rel="noopener"
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 transition-colors"
            title="Ver perfil do proprietário"
          >
            <Link2 size={14} />
          </a>
          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-colors"
            title="Desvincular proprietário"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  // ── Campo de busca ────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2 focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400/30 transition-colors">
        <Search size={14} className="shrink-0 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); search(e.target.value); }}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          placeholder="Buscar por nome, telefone ou CPF..."
          className="flex-1 min-w-0 bg-transparent font-inter text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
        />
        {loading && (
          <div className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
        )}
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-xl border border-border bg-popover shadow-lg shadow-black/10">
          {results.map((owner) => (
            <button
              key={owner.id}
              type="button"
              onMouseDown={() => handleSelect(owner)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-400/15 font-inter text-[11px] font-bold text-amber-700 dark:text-amber-400">
                {owner.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-inter text-sm font-medium text-foreground truncate">{owner.name}</p>
                <p className="font-inter text-xs text-muted-foreground">
                  {owner.phone}
                  {owner.cpf && ` · CPF: ${owner.cpf}`}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {open && !loading && results.length === 0 && query.trim() && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 rounded-xl border border-border bg-popover px-4 py-3 shadow-lg shadow-black/10">
          <p className="font-inter text-sm text-muted-foreground">
            Nenhum proprietário encontrado.{" "}
            <a href="/admin/owners/new" className="text-amber-600 hover:underline" target="_blank">
              Criar novo
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
