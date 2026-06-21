import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LeadStatus, LeadType, LeadSource } from "@prisma/client";
import { KanbanColumn } from "@/components/admin/KanbanColumn";
import { KanbanBoard } from "@/components/admin/KanbanBoard";
import { LEAD_STATUS_CONFIG, BUDGET_LABELS } from "@/lib/lead-config";
import { searchLeads } from "@/actions/leads";
import { cn } from "@/lib/utils";
import { LeadsStatusFilter } from "@/components/admin/LeadsStatusFilter";
import { Plus } from "lucide-react";

export const metadata: Metadata = { title: "Leads" };
export const revalidate = 0;

const SOURCE_LABELS: Record<LeadSource, string> = {
  LANDING_PAGE: "Site", WHATSAPP: "WhatsApp", INSTAGRAM: "Instagram",
  GOOGLE_ADS: "Google Ads", REFERRAL: "Indicação", DIRECT: "Direto", MANUAL: "Cadastro Manual",
};

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(d));
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp     = await searchParams;
  const view   = sp.view === "list" ? "list" : "kanban";
  const q      = sp.q?.trim()     || undefined;
  const status = sp.status as LeadStatus | undefined;
  const type   = sp.type   as LeadType   | undefined;

  // List mode: busca com filtros
  // Kanban mode: todos os leads (sem filtro de texto)
  const isFiltered = !!(q || status || type);

  const [leads, total] = await Promise.all([
    view === "list" || isFiltered
      ? searchLeads({ q, status, type, take: 300 })
      : prisma.lead.findMany({
          orderBy: { createdAt: "desc" },
          select: {
            id: true, name: true, phone: true, status: true,
            budgetRange: true, regions: true, createdAt: true, score: true,
            _count: { select: { interests: true, interactions: true } },
          },
        }),
    prisma.lead.count(),
  ]);

  function href(extra: Record<string, string | undefined>) {
    const p = new URLSearchParams(sp);
    Object.entries(extra).forEach(([k, v]) => v ? p.set(k, v) : p.delete(k));
    return `/admin/leads?${p.toString()}`;
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex shrink-0 flex-col gap-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-8 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-cormorant text-2xl font-light text-zinc-900 dark:text-zinc-100">Leads</h1>
          <p className="mt-0.5 font-inter text-xs text-zinc-400 dark:text-zinc-500">
            {total} {total === 1 ? "lead" : "leads"} no funil
          </p>
        </div>

        {/* Controles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Novo lead */}
          <Link
            href="/admin/leads/new"
            className="flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 px-3 py-1.5 font-inter text-xs font-medium text-white transition-colors shadow-sm shadow-amber-500/20"
          >
            <Plus size={13} strokeWidth={2.5} />
            Novo Lead
          </Link>

          {/* Busca */}
          <form method="get" className="flex gap-2">
            <input type="hidden" name="view" value={view} />
            <input
              name="q"
              defaultValue={q}
              placeholder="Nome, telefone ou e-mail..."
              className="w-52 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 font-inter text-xs text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30"
            />
          </form>

          {/* Filtro status */}
          <LeadsStatusFilter current={status} baseParams={{ ...sp, view }} />

          {/* Toggle kanban / lista */}
          <div className="flex rounded-md border border-border overflow-hidden">
            <Link
              href={href({ view: "kanban" })}
              className={cn(
                "px-3 py-1.5 font-inter text-xs transition-colors",
                view === "kanban" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Kanban
            </Link>
            <Link
              href={href({ view: "list" })}
              className={cn(
                "border-l border-border px-3 py-1.5 font-inter text-xs transition-colors",
                view === "list" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Lista
            </Link>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      {view === "list" ? (
        /* ── MODO LISTA ── */
        <div className="flex-1 overflow-y-auto p-6">
          {leads.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-cormorant text-2xl font-light text-muted-foreground">
                Nenhum lead encontrado
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full font-inter text-sm">
                <thead className="border-b border-border bg-muted/40">
                  <tr>
                    {["Nome", "Telefone", "Status", "Origem", "Orçamento", "Entrada", ""].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => {
                    const cfg = LEAD_STATUS_CONFIG[l.status];
                    return (
                      <tr key={l.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/leads/${l.id}`}
                            className="font-medium text-foreground hover:text-amber-600 transition-colors"
                          >
                            {l.name}
                          </Link>
                          {"email" in l && l.email && (
                            <p className="text-[11px] text-muted-foreground">{l.email as string}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{l.phone}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-inter text-[11px] font-medium ${cfg.badge}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {"source" in l ? SOURCE_LABELS[l.source as LeadSource] ?? l.source : "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {l.budgetRange ? BUDGET_LABELS[l.budgetRange] : "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{fmtDate(l.createdAt)}</td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/leads/${l.id}`}
                            className="font-inter text-xs text-amber-600 hover:text-amber-500 transition-colors"
                          >
                            Ver
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* ── MODO KANBAN ── */
        <div className="flex-1 overflow-x-auto bg-muted/30">
          <KanbanBoard
            initialLeads={leads as Parameters<typeof KanbanBoard>[0]["initialLeads"]}
          />
        </div>
      )}
    </div>
  );
}
