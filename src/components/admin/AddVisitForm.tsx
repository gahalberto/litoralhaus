"use client";

import { useState, useTransition } from "react";
import { createVisit } from "@/actions/property-report";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const inputCls =
  "w-full rounded-md border border-input bg-background px-3 py-2 font-inter text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring";

interface Lead { id: string; name: string; phone: string }

interface Props {
  propertyId: string;
  leads: Lead[];
}

export function AddVisitForm({ propertyId, leads }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, start] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await createVisit({
        propertyId,
        leadId:      fd.get("leadId")?.toString() || undefined,
        visitedAt:   fd.get("visitedAt")?.toString() ?? "",
        conductedBy: fd.get("conductedBy")?.toString() ?? "",
        notes:       fd.get("notes")?.toString() || undefined,
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
      <Button size="sm" onClick={() => setOpen(true)}>
        + Registrar visita
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-muted/30 p-5 space-y-4">
      <p className="font-inter text-sm font-semibold text-foreground">Nova visita</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label className="font-inter text-xs uppercase tracking-wider text-muted-foreground">Data e hora *</Label>
          <input type="datetime-local" name="visitedAt" required className={inputCls} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="font-inter text-xs uppercase tracking-wider text-muted-foreground">Realizada por *</Label>
          <input name="conductedBy" placeholder="Nome do corretor" required className={inputCls} />
        </div>
      </div>

      {leads.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <Label className="font-inter text-xs uppercase tracking-wider text-muted-foreground">Lead (opcional)</Label>
          <select name="leadId" className={cn(inputCls, "cursor-pointer appearance-none")}>
            <option value="">— Sem lead vinculado —</option>
            {leads.map((l) => (
              <option key={l.id} value={l.id}>{l.name} · {l.phone}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label className="font-inter text-xs uppercase tracking-wider text-muted-foreground">Observações</Label>
        <Textarea name="notes" placeholder="Como correu a visita, interesse do cliente..." rows={3} className="font-inter text-sm" />
      </div>

      {error && <p className="font-inter text-xs text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Salvando..." : "Salvar visita"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
