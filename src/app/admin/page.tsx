import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LeadStatus } from "@prisma/client";
import { LEAD_STATUS_CONFIG, BUDGET_LABELS } from "@/lib/lead-config";

export const metadata: Metadata = { title: "Dashboard" };

async function getStats() {
  const [total, byStatus, recentLeads] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, status: true, budgetRange: true, createdAt: true },
    }),
  ]);
  return { total, byStatus, recentLeads };
}

export default async function AdminDashboard() {
  const { total, byStatus, recentLeads } = await getStats();

  const won = byStatus.find((s) => s.status === LeadStatus.FECHADO_GANHO)?._count.id ?? 0;
  const active = byStatus
    .filter((s) => s.status !== LeadStatus.FECHADO_GANHO && s.status !== LeadStatus.FECHADO_PERDIDO)
    .reduce((acc, s) => acc + s._count.id, 0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-cormorant text-2xl font-light text-foreground">Dashboard</h1>
        <p className="mt-1 font-inter text-xs text-muted-foreground">
          Visão geral do funil de vendas.
        </p>
      </div>

      {/* KPIs */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        {[
          { label: "Total de leads", value: total },
          { label: "Em andamento",   value: active },
          { label: "Fechados (ganho)", value: won },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded border border-border bg-card p-5">
            <p className="font-inter text-xs uppercase tracking-widest text-muted-foreground">
              {kpi.label}
            </p>
            <p className="mt-2 font-cormorant text-4xl font-light text-foreground">
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* Status breakdown */}
      <div className="mb-8 rounded border border-border bg-card p-5">
        <p className="mb-4 font-inter text-xs uppercase tracking-widest text-muted-foreground">
          Distribuição por etapa
        </p>
        <div className="space-y-2">
          {Object.values(LeadStatus).map((status) => {
            const count = byStatus.find((s) => s.status === status)?._count.id ?? 0;
            const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
            const cfg   = LEAD_STATUS_CONFIG[status];
            return (
              <div key={status} className="flex items-center gap-3">
                <span className={`h-2 w-2 shrink-0 rounded-full ${cfg.dot}`} />
                <span className="w-36 font-inter text-xs text-muted-foreground">{cfg.label}</span>
                <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className={`h-full rounded-full ${cfg.bar}`} style={{ width: `${pct}%` }} />
                </div>
                <span className="w-6 text-right font-inter text-xs tabular-nums text-muted-foreground/60">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leads recentes */}
      <div className="rounded border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-inter text-xs uppercase tracking-widest text-muted-foreground">
            Leads recentes
          </p>
          <Link
            href="/admin/leads"
            className="font-inter text-xs text-amber-600 hover:text-amber-500 dark:text-amber-400 dark:hover:text-amber-300"
          >
            Ver kanban →
          </Link>
        </div>
        <div className="divide-y divide-border">
          {recentLeads.length === 0 && (
            <p className="py-4 text-center font-inter text-xs text-muted-foreground/50">
              Nenhum lead captado ainda.
            </p>
          )}
          {recentLeads.map((lead) => {
            const cfg = LEAD_STATUS_CONFIG[lead.status];
            return (
              <div key={lead.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-inter text-sm text-foreground">{lead.name}</p>
                  <p className="font-inter text-xs text-muted-foreground">
                    {BUDGET_LABELS[lead.budgetRange]}
                  </p>
                </div>
                <span className={`rounded px-2 py-0.5 font-inter text-[10px] uppercase tracking-wider ${cfg.badge}`}>
                  {cfg.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
