"use client";

import { useState, useCallback, useRef, useEffect, useTransition } from "react";
import { Search, X, UserCheck, Phone, Plus, AlertTriangle, Loader2 } from "lucide-react";
import { getOwners, findOwnerByPhoneOrCpf, createOwner } from "@/actions/owners";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type OwnerSummary = {
  id: string; name: string; phone: string; email: string | null; cpf: string | null;
};

const inputCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2 font-inter text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30";

// ── Formata número brasileiro ─────────────────────────────────────────────────
function formatBR(digits: string): string {
  const d = digits.slice(0, 11);
  if (!d) return "";
  if (d.length <= 2)  return d;
  if (d.length <= 6)  return `${d.slice(0, 2)} ${d.slice(2)}`;
  if (d.length <= 10) return `${d.slice(0, 2)} ${d.slice(2, 6)}-${d.slice(6)}`;
  return `${d.slice(0, 2)} ${d.slice(2, 7)}-${d.slice(7)}`;
}

// ── Modal de criação rápida ───────────────────────────────────────────────────
function CreateOwnerDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: (owner: OwnerSummary) => void;
}) {
  const [isPending, start] = useTransition();
  const [name,  setName]  = useState("");
  const [cc,    setCc]    = useState("55");
  const [local, setLocal] = useState("");
  const [cpf,   setCpf]   = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [duplicate, setDuplicate] = useState<OwnerSummary | null>(null);

  const phone = local.replace(/\D/g, "").length > 0
    ? `+${cc}${local.replace(/\D/g, "")}`
    : "";

  function resetForm() {
    setName(""); setCc("55"); setLocal(""); setCpf(""); setEmail("");
    setError(""); setDuplicate(null);
  }

  function handleClose(v: boolean) {
    if (!v) resetForm();
    onOpenChange(v);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setDuplicate(null);
    if (!name.trim()) { setError("Nome é obrigatório."); return; }
    if (!phone)       { setError("Telefone é obrigatório."); return; }

    start(async () => {
      const found = await findOwnerByPhoneOrCpf(phone, cpf.replace(/\D/g, "") || undefined);
      if (found) { setDuplicate(found); return; }

      const res = await createOwner({
        name:  name.trim(),
        phone,
        cpf:   cpf.trim()   || undefined,
        email: email.trim() || undefined,
      });

      if (res.success) {
        onCreated({ id: res.id, name: name.trim(), phone, email: email || null, cpf: cpf || null });
        handleClose(false);
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo proprietário</DialogTitle>
          <DialogDescription>
            Preencha os dados. Se o telefone ou CPF já existir, o sistema irá identificar o cadastro.
          </DialogDescription>
        </DialogHeader>

        {/* Alerta de duplicata */}
        {duplicate && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-400/20 dark:bg-amber-400/5 p-4 space-y-3">
            <div className="flex items-start gap-2">
              <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="font-inter text-xs font-semibold text-amber-700 dark:text-amber-400">
                  Já existe um proprietário com este telefone ou CPF
                </p>
                <p className="mt-0.5 font-inter text-xs text-amber-600/80 dark:text-amber-400/70">
                  {duplicate.name} · {duplicate.phone}
                  {duplicate.cpf && ` · CPF: ${duplicate.cpf}`}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => { onCreated(duplicate); handleClose(false); }}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                Vincular este proprietário
              </Button>
              <Button size="sm" variant="outline" onClick={() => setDuplicate(null)}>
                Voltar
              </Button>
            </div>
          </div>
        )}

        {!duplicate && (
          <form id="quick-owner-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Nome */}
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <Label className="font-inter text-[10px] uppercase tracking-wider text-muted-foreground">
                  Nome *
                </Label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="João Silva"
                  className={inputCls}
                  autoFocus
                />
              </div>

              {/* Telefone */}
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <Label className="font-inter text-[10px] uppercase tracking-wider text-muted-foreground">
                  Telefone / WhatsApp *
                </Label>
                <div className="flex gap-1.5">
                  <div className="relative flex shrink-0 items-center">
                    <span className="pointer-events-none absolute left-2.5 font-inter text-sm text-muted-foreground">+</span>
                    <input
                      type="text" inputMode="numeric" value={cc} placeholder="55"
                      onChange={(e) => setCc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      className={`${inputCls} w-12 pl-5 pr-1 text-center`}
                    />
                  </div>
                  <input
                    type="tel" inputMode="numeric"
                    value={formatBR(local)}
                    onChange={(e) => setLocal(e.target.value.replace(/\D/g, ""))}
                    placeholder="13 99999-9999"
                    className={`${inputCls} min-w-0 flex-1`}
                  />
                </div>
              </div>

              {/* CPF */}
              <div className="flex flex-col gap-1.5">
                <Label className="font-inter text-[10px] uppercase tracking-wider text-muted-foreground">
                  CPF / CNPJ
                </Label>
                <input
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  className={inputCls}
                />
              </div>

              {/* E-mail */}
              <div className="flex flex-col gap-1.5">
                <Label className="font-inter text-[10px] uppercase tracking-wider text-muted-foreground">
                  E-mail
                </Label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="joao@email.com"
                  className={inputCls}
                />
              </div>
            </div>

            {error && (
              <p className="font-inter text-xs text-destructive">{error}</p>
            )}
          </form>
        )}

        {!duplicate && (
          <DialogFooter>
            <Button type="submit" form="quick-owner-form" disabled={isPending} className="bg-amber-500 hover:bg-amber-600 text-white">
              {isPending ? <><Loader2 size={13} className="animate-spin mr-1.5" />Criando...</> : "Criar e vincular"}
            </Button>
            <Button variant="outline" onClick={() => handleClose(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
interface Props {
  value: OwnerSummary | null;
  onChange: (owner: OwnerSummary | null) => void;
}

export function OwnerSearchInput({ value, onChange }: Props) {
  const [query, setQuery]       = useState("");
  const [results, setResults]   = useState<OwnerSummary[]>([]);
  const [loading, setLoading]   = useState(false);
  const [open, setOpen]         = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const containerRef            = useRef<HTMLDivElement>(null);
  const debounceRef             = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
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
    setQuery(""); setResults([]); setOpen(false);
  }

  function handleClear() {
    onChange(null);
    setQuery(""); setResults([]);
  }

  // ── Proprietário vinculado ────────────────────────────────────────────────
  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-400/20 dark:bg-amber-400/5 px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-400/20">
          <UserCheck size={16} className="text-amber-600 dark:text-amber-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-inter text-sm font-semibold text-zinc-900 dark:text-zinc-100">{value.name}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
            <span className="flex items-center gap-1 font-inter text-xs text-zinc-500">
              <Phone size={11} /> {value.phone}
            </span>
            {value.cpf   && <span className="font-inter text-xs text-zinc-400">CPF: {value.cpf}</span>}
            {value.email && <span className="font-inter text-xs text-zinc-400">{value.email}</span>}
          </div>
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-colors"
          title="Desvincular proprietário"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  const noResults = open && !loading && results.length === 0 && !!query.trim();

  return (
    <>
      <div ref={containerRef} className="relative">
        {/* Campo de busca */}
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
          {loading && <Loader2 size={13} className="shrink-0 animate-spin text-amber-400" />}
        </div>

        {/* Dropdown resultados */}
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
                  <p className="truncate font-inter text-sm font-medium text-foreground">{owner.name}</p>
                  <p className="font-inter text-xs text-muted-foreground">
                    {owner.phone}{owner.cpf && ` · CPF: ${owner.cpf}`}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Sem resultados */}
        {noResults && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1.5 rounded-xl border border-border bg-popover px-4 py-3 shadow-lg shadow-black/10">
            <p className="font-inter text-sm text-muted-foreground">Nenhum proprietário encontrado.</p>
            <button
              type="button"
              onMouseDown={() => { setOpen(false); setDialogOpen(true); }}
              className="mt-2 flex items-center gap-1.5 font-inter text-xs font-medium text-amber-600 hover:text-amber-700 transition-colors"
            >
              <Plus size={13} />
              Criar novo proprietário
            </button>
          </div>
        )}
      </div>

      {/* Modal de criação */}
      <CreateOwnerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={(owner) => { onChange(owner); setQuery(""); setResults([]); }}
      />
    </>
  );
}
