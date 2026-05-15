"use client";

import { useState, useTransition, useRef } from "react";
import { cn } from "@/lib/utils";
import type { CatalogItem } from "@/actions/catalog";

interface CatalogPickerProps {
  label: string;
  items: CatalogItem[];
  selected: string[];
  onChange: (ids: string[]) => void;
  onAdd: (label: string) => Promise<{ success: boolean; item?: CatalogItem; error?: string }>;
}

export function CatalogPicker({
  label,
  items: initialItems,
  selected,
  onChange,
  onAdd,
}: CatalogPickerProps) {
  const [items, setItems] = useState<CatalogItem[]>(initialItems);
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function toggle(id: string) {
    onChange(
      selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]
    );
  }

  function openAdd() {
    setAdding(true);
    setNewLabel("");
    setAddError(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function submitAdd() {
    if (!newLabel.trim()) return;
    startTransition(async () => {
      const result = await onAdd(newLabel);
      if (!result.success) {
        setAddError(result.error ?? "Erro ao adicionar.");
        return;
      }
      if (result.item) {
        setItems((prev) =>
          [...prev, result.item!].sort((a, b) => a.label.localeCompare(b.label, "pt"))
        );
        onChange([...selected, result.item.id]);
      }
      setAdding(false);
      setNewLabel("");
      setAddError(null);
    });
  }

  return (
    <div className="space-y-3">
      {/* Grid de checkboxes */}
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        {items.map((item) => {
          const isSelected = selected.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggle(item.id)}
              className={cn(
                "flex items-center gap-2 rounded border px-3 py-2 text-left font-inter text-xs transition-all duration-150",
                isSelected
                  ? "border-amber-400/60 bg-amber-400/10 text-amber-700 dark:text-amber-300"
                  : "border-border bg-background text-muted-foreground hover:border-border/80 hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border transition-colors",
                  isSelected
                    ? "border-amber-500 bg-amber-400 dark:border-amber-400"
                    : "border-muted-foreground/40"
                )}
              >
                {isSelected && (
                  <svg width="9" height="7" viewBox="0 0 9 7" fill="none" aria-hidden>
                    <path d="M1 3.5L3.5 6L8 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-stone-950" />
                  </svg>
                )}
              </span>
              {item.label}
            </button>
          );
        })}

        {/* Botão de adicionar */}
        {!adding ? (
          <button
            type="button"
            onClick={openAdd}
            className="flex items-center gap-2 rounded border border-dashed border-border px-3 py-2 font-inter text-xs text-muted-foreground/60 transition-colors hover:border-muted-foreground/40 hover:text-muted-foreground"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Adicionar {label}
          </button>
        ) : (
          <div className="col-span-2 sm:col-span-3">
            <div className="flex items-center gap-2 rounded border border-amber-400/40 bg-amber-400/5 px-3 py-2">
              <input
                ref={inputRef}
                value={newLabel}
                onChange={(e) => { setNewLabel(e.target.value); setAddError(null); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); submitAdd(); }
                  if (e.key === "Escape") { setAdding(false); setAddError(null); }
                }}
                placeholder={`Nome do ${label.toLowerCase()}...`}
                disabled={isPending}
                className="flex-1 bg-transparent font-inter text-xs text-foreground placeholder:text-muted-foreground/50 outline-none"
              />
              <button
                type="button"
                onClick={submitAdd}
                disabled={isPending || !newLabel.trim()}
                className="font-inter text-[10px] font-medium uppercase tracking-wider text-amber-600 hover:text-amber-500 dark:text-amber-400 disabled:opacity-40"
              >
                {isPending ? "..." : "Salvar"}
              </button>
              <button
                type="button"
                onClick={() => { setAdding(false); setAddError(null); }}
                className="font-inter text-[10px] text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            {addError && (
              <p className="mt-1 font-inter text-[10px] text-destructive">{addError}</p>
            )}
          </div>
        )}
      </div>

      {selected.length > 0 && (
        <p className="font-inter text-[10px] text-muted-foreground/60">
          {selected.length} {selected.length === 1 ? "selecionado" : "selecionados"}
        </p>
      )}
    </div>
  );
}
