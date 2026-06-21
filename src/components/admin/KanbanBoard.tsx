"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { LeadStatus } from "@prisma/client";
import { updateLeadStatus } from "@/actions/update-lead-status";
import { LEAD_STATUS_CONFIG } from "@/lib/lead-config";
import { KanbanColumnDnd } from "./KanbanColumnDnd";
import { LeadCard } from "./LeadCard";
import type { Lead } from "@prisma/client";

export type KanbanLead = Pick<
  Lead,
  "id" | "name" | "phone" | "status" | "budgetRange" | "regions" | "createdAt" | "score"
>;

export function KanbanBoard({ initialLeads }: { initialLeads: KanbanLead[] }) {
  const [leads, setLeads]           = useState<KanbanLead[]>(initialLeads);
  const [activeId, setActiveId]     = useState<string | null>(null);
  const [, startTransition]         = useTransition();

  const activeLead = leads.find((l) => l.id === activeId) ?? null;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Exige 8px de movimento antes de iniciar o drag — evita cliques acidentais
      activationConstraint: { distance: 8 },
    })
  );

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    if (!over) return;

    const leadId    = active.id as string;
    const newStatus = over.id   as LeadStatus;

    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.status === newStatus) return;

    // Atualização otimista — move imediatamente na UI
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );

    // Persiste no banco em background
    startTransition(() => updateLeadStatus(leadId, newStatus));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full gap-3 p-6" style={{ minWidth: "max-content" }}>
        {Object.values(LeadStatus).map((status) => (
          <KanbanColumnDnd
            key={status}
            status={status}
            leads={leads.filter((l) => l.status === status)}
            isDraggingOver={activeId !== null}
          />
        ))}
      </div>

      {/* Card fantasma que segue o cursor durante o drag */}
      <DragOverlay dropAnimation={null}>
        {activeLead ? (
          <div className="rotate-1 opacity-90 shadow-2xl">
            <LeadCard lead={activeLead} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
