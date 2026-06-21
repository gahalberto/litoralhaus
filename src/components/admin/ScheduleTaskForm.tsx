"use client";

import { useState, useTransition } from "react";
import { createInteraction } from "@/actions/leads";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CalendarClock } from "lucide-react";

const inputCls =
  "w-full rounded-md border border-input bg-background px-3 py-2 font-inter text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring";

const CHANNEL_LABELS = {
  PHONE:      "📞 Telefone",
  WHATSAPP:   "💬 WhatsApp",
  VISIT:      "🏠 Visita",
  VIDEO_CALL: "📹 Videochamada",
  EMAIL:      "✉️ E-mail",
  NOTE:       "📝 Anotação",
};

// Retorna datetime-local mínimo: agora + 5 min
function minDateTime() {
  const d = new Date(Date.now() + 5 * 60 * 1000);
  return d.toISOString().slice(0, 16);
}

export function ScheduleTaskForm({ leadId, userName }: { leadId: string; userName: string }) {
  const [open, setOpen]     = useState(false);
  const [isPending, start]  = useTransition();
  const [error, setError]   = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const task        = fd.get("task")?.toString()        ?? "";
    const scheduledAt = fd.get("scheduledAt")?.toString() ?? "";
    const channel     = fd.get("channel")?.toString()     ?? "PHONE";

    if (!task || !scheduledAt) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    start(async () => {
      const res = await createInteraction({
        leadId,
        channel,
        direction:   "OUTBOUND",
        summary:     `Tarefa agendada: ${task}`,
        nextStep:    task,
        nextStepAt:  scheduledAt,
        performedBy: userName,
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
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        className="gap-1.5"
      >
        <CalendarClock size={13} />
        Agendar tarefa
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-500/5 p-4 space-y-4"
    >
      <div className="flex items-center gap-2">
        <CalendarClock size={14} className="text-amber-600 dark:text-amber-400" />
        <p className="font-inter text-sm font-semibold text-foreground">Nova tarefa</p>
      </div>

      {/* O que fazer */}
      <div className="flex flex-col gap-1.5">
        <Label className="font-inter text-xs uppercase tracking-wider text-muted-foreground">
          O que fazer *
        </Label>
        <input
          name="task"
          placeholder="Ex: Ligar para marcar horário de visita"
          required
          autoFocus
          className={inputCls}
        />
      </div>

      {/* Quando + Canal */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label className="font-inter text-xs uppercase tracking-wider text-muted-foreground">
            Quando *
          </Label>
          <input
            name="scheduledAt"
            type="datetime-local"
            required
            min={minDateTime()}
            className={inputCls}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="font-inter text-xs uppercase tracking-wider text-muted-foreground">
            Canal
          </Label>
          <select name="channel" defaultValue="PHONE" className={`${inputCls} cursor-pointer appearance-none`}>
            {Object.entries(CHANNEL_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      <p className="font-inter text-[11px] text-muted-foreground">
        Responsável: <span className="font-medium text-foreground">{userName}</span>
      </p>

      {error && <p className="font-inter text-xs text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Salvando..." : "Agendar"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => { setOpen(false); setError(""); }}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
