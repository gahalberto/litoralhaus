import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { LeadStatus } from "@prisma/client";
import { KanbanColumn } from "@/components/admin/KanbanColumn";

export const metadata: Metadata = { title: "Kanban de Vendas" };

export const revalidate = 60;

async function getLeads() {
  return prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      phone: true,
      status: true,
      budgetRange: true,
      regions: true,
      createdAt: true,
      score: true,
    },
  });
}

export default async function KanbanPage() {
  const leads = await getLeads();

  const byStatus = Object.values(LeadStatus).map((status) => ({
    status,
    leads: leads.filter((l) => l.status === status),
  }));

  const total = leads.length;

  return (
    <div className="flex h-full flex-col">
      {/* Page header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-8 py-4">
        <div>
          <h1 className="font-cormorant text-2xl font-light text-foreground">Kanban de Vendas</h1>
          <p className="mt-0.5 font-inter text-xs text-muted-foreground">
            {total} {total === 1 ? "lead" : "leads"} no funil
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-inter text-xs text-muted-foreground/60">Atualiza a cada 60s</span>
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto bg-muted/30">
        <div className="flex h-full gap-3 p-6" style={{ minWidth: "max-content" }}>
          {byStatus.map(({ status, leads: colLeads }) => (
            <KanbanColumn key={status} status={status} leads={colLeads} />
          ))}
        </div>
      </div>
    </div>
  );
}
