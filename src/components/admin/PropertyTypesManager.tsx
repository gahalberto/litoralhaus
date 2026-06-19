"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, Check, X, Building2 } from "lucide-react";
import {
  createPropertyCategory,
  updatePropertyCategory,
  deletePropertyCategory,
} from "@/actions/property-categories";

type Category = { id: string; name: string; _count: { properties: number } };

const inputCls =
  "rounded-lg border border-input bg-background px-3 py-2 font-inter text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30";

export function PropertyTypesManager({
  initialCategories,
}: {
  initialCategories: Category[];
}) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [newName, setNewName]       = useState("");
  const [editId, setEditId]         = useState<string | null>(null);
  const [editName, setEditName]     = useState("");
  const [error, setError]           = useState("");
  const [isPending, start]          = useTransition();

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    start(async () => {
      const res = await createPropertyCategory({ name: newName });
      if (res.success) {
        setCategories((prev) => [
          ...prev,
          { id: res.id, name: newName.trim(), _count: { properties: 0 } },
        ].sort((a, b) => a.name.localeCompare(b.name)));
        setNewName("");
      } else {
        setError(res.error);
      }
    });
  }

  function startEdit(cat: Category) {
    setEditId(cat.id);
    setEditName(cat.name);
    setError("");
  }

  function handleUpdate(id: string) {
    setError("");
    start(async () => {
      const res = await updatePropertyCategory(id, { name: editName });
      if (res.success) {
        setCategories((prev) =>
          prev.map((c) => (c.id === id ? { ...c, name: editName.trim() } : c))
            .sort((a, b) => a.name.localeCompare(b.name))
        );
        setEditId(null);
      } else {
        setError(res.error);
      }
    });
  }

  function handleDelete(id: string, name: string, count: number) {
    if (count > 0) {
      setError(`"${name}" está em uso por ${count} imóvel(s) e não pode ser excluída.`);
      return;
    }
    if (!confirm(`Excluir "${name}"?`)) return;
    start(async () => {
      await deletePropertyCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    });
  }

  return (
    <div className="space-y-6">
      {/* Formulário de criação */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 font-inter text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Novo tipo
        </h2>
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Ex: Mansão, Sobrado, Chácara..."
            className={`${inputCls} flex-1`}
            disabled={isPending}
          />
          <button
            type="submit"
            disabled={isPending || !newName.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 px-4 py-2 font-inter text-sm font-medium text-white transition-colors"
          >
            <Plus size={14} />
            Adicionar
          </button>
        </form>
        {error && <p className="mt-2 font-inter text-xs text-destructive">{error}</p>}
      </section>

      {/* Lista de categorias */}
      <section className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="font-inter text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Tipos cadastrados
          </h2>
          <span className="font-inter text-xs text-muted-foreground">{categories.length} tipos</span>
        </div>

        {categories.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Building2 size={32} className="text-muted-foreground/30" />
            <p className="font-inter text-sm text-muted-foreground">Nenhum tipo cadastrado ainda.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {categories.map((cat) => (
              <li key={cat.id} className="flex items-center gap-3 px-6 py-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  <Building2 size={14} className="text-zinc-500" />
                </div>

                {editId === cat.id ? (
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") { e.preventDefault(); handleUpdate(cat.id); }
                        if (e.key === "Escape") setEditId(null);
                      }}
                      className={`${inputCls} flex-1`}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdate(cat.id)}
                      disabled={isPending}
                      className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                    >
                      <Check size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditId(null)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent transition-colors"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="font-inter text-sm font-medium text-foreground">{cat.name}</p>
                      <p className="font-inter text-[11px] text-muted-foreground">
                        {cat._count.properties === 0
                          ? "Nenhum imóvel"
                          : `${cat._count.properties} imóvel(s)`}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(cat)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                        title="Renomear"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cat.id, cat.name, cat._count.properties)}
                        disabled={isPending}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-colors disabled:opacity-40"
                        title="Excluir"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
