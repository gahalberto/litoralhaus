"use client";

import { useDroppable } from "@dnd-kit/core";
import { LeadStatus } from "@prisma/client";
import { LEAD_STATUS_CONFIG } from "@/lib/lead-config";
import { cn } from "@/lib/utils";
import { LeadCardDraggable } from "./LeadCardDraggable";
import type { KanbanLead } from "./KanbanBoard";

type Props = {
  status:        LeadStatus;
  leads:         KanbanLead[];
  isDraggingOver: boolean;
};

export function KanbanColumnDnd({ status, leads, isDraggingOver }: Props) {
  const cfg = LEAD_STATUS_CONFIG[status];

  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      className={cn(
        "flex w-72 shrink-0 flex-col rounded border-t-2 border-border bg-background transition-colors",
        cfg.column,
        isOver && "ring-2 ring-amber-400/60 ring-offset-1"
      )}
    >
      {/* Cabeçalho */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", cfg.dot)} />
          <span className="font-inter text-xs font-medium text-foreground">{cfg.label}</span>
        </div>
        <span className="rounded-full bg-muted px-2 py-0.5 font-inter text-[10px] tabular-nums text-muted-foreground">
          {leads.length}
        </span>
      </div>

      {/* Área droppable */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 space-y-2 overflow-y-auto p-3 transition-colors",
          isOver && "bg-amber-50/50 dark:bg-amber-400/5"
        )}
      >
        {leads.length === 0 ? (
          <div className={cn(
            "rounded border border-dashed py-8 text-center transition-colors",
            isOver
              ? "border-amber-300 dark:border-amber-500/40 bg-amber-50/50 dark:bg-amber-400/5"
              : "border-border"
          )}>
            <p className={cn(
              "font-inter text-xs transition-colors",
              isOver ? "text-amber-500" : "text-muted-foreground/40",
              isDraggingOver && !isOver && "text-muted-foreground/20"
            )}>
              {isOver ? "Solte aqui" : "Sem leads"}
            </p>
          </div>
        ) : (
          leads.map((lead) => <LeadCardDraggable key={lead.id} lead={lead} />)
        )}
      </div>
    </div>
  );
}
