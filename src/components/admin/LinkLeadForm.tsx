"use client";

import { useState, useTransition } from "react";
import { linkLeadToProperty } from "@/actions/property-report";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const inputCls =
  "w-full rounded-md border border-input bg-background px-3 py-2 font-inter text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring";

export function LinkLeadForm({ propertyId }: { propertyId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, start] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await linkLeadToProperty({
        propertyId,
        name:  fd.get("name")?.toString()  ?? "",
        phone: fd.get("phone")?.toString() ?? "",
        email: fd.get("email")?.toString() || undefined,
        type:  (fd.get("type")?.toString() ?? "BUYER") as "BUYER" | "SELLER",
        notes: fd.get("notes")?.toString() || undefined,
      });
      if (res.success) {
        setOpen(false);
        setError("");
        (e.target as HTMLFormElement).reset();
      } else {
        setError(res.error);
      }
    });
  }

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        + Adicionar contato
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-muted/30 p-5 space-y-4">
      <p className="font-inter text-sm font-semibold text-foreground">Cadastrar contato vinculado</p>
      <p className="font-inter text-xs text-muted-foreground">
        Se o telefone já existir no sistema, o lead será reutilizado e vinculado a este imóvel.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label className="font-inter text-xs uppercase tracking-wider text-muted-foreground">Nome *</Label>
          <input name="name" placeholder="João Silva" required className={inputCls} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="font-inter text-xs uppercase tracking-wider text-muted-foreground">Telefone *</Label>
          <input name="phone" placeholder="+55 13 99999-9999" required className={inputCls} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="font-inter text-xs uppercase tracking-wider text-muted-foreground">E-mail</Label>
          <input name="email" type="email" placeholder="joao@email.com" className={inputCls} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="font-inter text-xs uppercase tracking-wider text-muted-foreground">Tipo *</Label>
          <select name="type" defaultValue="BUYER" className={`${inputCls} cursor-pointer appearance-none`}>
            <option value="BUYER">Comprador</option>
            <option value="SELLER">Proprietário / Vendedor</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="font-inter text-xs uppercase tracking-wider text-muted-foreground">Observações</Label>
        <Textarea name="notes" placeholder="Interesse específico, orçamento, urgência..." rows={2} className="font-inter text-sm" />
      </div>

      {error && <p className="font-inter text-xs text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Salvando..." : "Salvar contato"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
