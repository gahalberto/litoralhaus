"use client";

import { useState, useTransition } from "react";
import { createInteraction } from "@/actions/leads";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const inputCls =
  "w-full rounded-md border border-input bg-background px-3 py-2 font-inter text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring";
const selectCls = cn(inputCls, "cursor-pointer appearance-none");

const CHANNEL_LABELS = {
  WHATSAPP: "WhatsApp", EMAIL: "E-mail", PHONE: "Telefone",
  VISIT: "Visita", VIDEO_CALL: "Videochamada", NOTE: "Anotação",
};

export function AddInteractionForm({ leadId }: { leadId: string }) {
  const [open, setOpen]         = useState(false);
  const [isPending, start]      = useTransition();
  const [error, setError]       = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await createInteraction({
        leadId,
        channel:     fd.get("channel")?.toString() ?? "NOTE",
        direction:   fd.get("direction")?.toString() ?? "OUTBOUND",
        summary:     fd.get("summary")?.toString() ?? "",
        nextStep:    fd.get("nextStep")?.toString() || undefined,
        nextStepAt:  fd.get("nextStepAt")?.toString() || undefined,
        performedBy: fd.get("performedBy")?.toString() ?? "",
      });
      if (res.success) { setOpen(false); setError(""); (e.target as HTMLFormElement).reset(); }
      else setError(res.error);
    });
  }

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>+ Registrar contato</Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-muted/30 p-4 space-y-4">
      <p className="font-inter text-sm font-semibold text-foreground">Novo contato</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label className="font-inter text-xs uppercase tracking-wider text-muted-foreground">Canal *</Label>
          <select name="channel" defaultValue="WHATSAPP" className={selectCls}>
            {Object.entries(CHANNEL_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="font-inter text-xs uppercase tracking-wider text-muted-foreground">Direção</Label>
          <select name="direction" defaultValue="OUTBOUND" className={selectCls}>
            <option value="OUTBOUND">Saída (ativo)</option>
            <option value="INBOUND">Entrada (receptivo)</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="font-inter text-xs uppercase tracking-wider text-muted-foreground">Realizado por *</Label>
          <input name="performedBy" placeholder="Seu nome" required className={inputCls} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="font-inter text-xs uppercase tracking-wider text-muted-foreground">Resumo *</Label>
        <Textarea name="summary" rows={2} placeholder="O que foi discutido ou anotado..." required className="font-inter text-sm" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label className="font-inter text-xs uppercase tracking-wider text-muted-foreground">Próximo passo</Label>
          <input name="nextStep" placeholder="Ex: Agendar visita" className={inputCls} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="font-inter text-xs uppercase tracking-wider text-muted-foreground">Data do próximo passo</Label>
          <input name="nextStepAt" type="datetime-local" className={inputCls} />
        </div>
      </div>
      {error && <p className="font-inter text-xs text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isPending}>{isPending ? "Salvando..." : "Salvar"}</Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
      </div>
    </form>
  );
}
