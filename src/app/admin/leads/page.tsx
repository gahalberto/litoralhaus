import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LeadStatus, LeadType, LeadSource } from "@prisma/client";
import { KanbanColumn } from "@/components/admin/KanbanColumn";
import { LEAD_STATUS_CONFIG, BUDGET_LABELS } from "@/lib/lead-config";
import { searchLeads } from "@/actions/leads";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Leads" };
export const revalidate = 0;

const SOURCE_LABELS: Record<LeadSource, string> = {
  LANDING_PAGE: "Landing Page", WHATSAPP: "WhatsApp", INSTAGRAM: "Instagram",
  GOOGLE_ADS: "Google Ads", REFERRAL: "Indicação", DIRECT: "Direto",
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
      <div className="flex shrink-0 flex-col gap-3 border-b border-border px-8 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-cormorant text-2xl font-light text-foreground">Leads</h1>
          <p className="mt-0.5 font-inter text-xs text-muted-foreground">
            {total} {total === 1 ? "lead" : "leads"} no funil
          </p>
        </div>

        {/* Controles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Busca */}
          <form method="get" className="flex gap-2">
            <input type="hidden" name="view" value={view} />
            <input
              name="q"
              defaultValue={q}
              placeholder="Nome, telefone ou e-mail..."
              className="w-52 rounded-md border border-input bg-background px-3 py-1.5 font-inter text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-ring focus:ring-1 focus:ring-ring"
            />
          </form>

          {/* Filtro status */}
          <select
            defaultValue={status ?? ""}
            onChange={(e) => { window.location.href = href({ status: e.target.value || undefined, view }); }}
            className="rounded-md border border-input bg-background px-2 py-1.5 font-inter text-sm text-foreground outline-none focus:border-ring cursor-pointer appearance-none"
          >
            <option value="">Todos os status</option>
            {Object.values(LeadStatus).map((s) => (
              <option key={s} value={s}>{LEAD_STATUS_CONFIG[s].label}</option>
            ))}
          </select>

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
          <div className="flex h-full gap-3 p-6" style={{ minWidth: "max-content" }}>
            {Object.values(LeadStatus).map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                leads={(leads as Parameters<typeof KanbanColumn>[0]["leads"]).filter((l) => l.status === status)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
