import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPropertyReport, deleteVisit } from "@/actions/property-report";
import { PROPERTY_TYPE_LABELS, PROPERTY_STATUS_CONFIG, REGION_LABELS, formatPrice } from "@/lib/property-config";
import { AddVisitForm } from "@/components/admin/AddVisitForm";
import { LinkLeadForm } from "@/components/admin/LinkLeadForm";

export const metadata: Metadata = { title: "Relatório do Imóvel" };

const LEAD_TYPE_LABEL = { BUYER: "Comprador", SELLER: "Proprietário" };
const LEAD_STATUS_LABEL: Record<string, string> = {
  NOVO: "Novo", EM_CONTATO: "Em contato", QUALIFICADO: "Qualificado",
  VISITA_AGENDADA: "Visita agendada", PROPOSTA: "Proposta",
  FECHADO_GANHO: "Fechado ✓", FECHADO_PERDIDO: "Perdido",
};

function fmt(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(date));
}

function fmtDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  }).format(new Date(date));
}

export default async function PropertyReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { property, leads, visits } = await getPropertyReport(id);
  if (!property) notFound();

  const statusCfg = PROPERTY_STATUS_CONFIG[property.status];
  const leadsForVisit = leads.map((l) => ({
    id:    l.lead.id,
    name:  l.lead.name,
    phone: l.lead.phone,
  }));

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 space-y-8">

      {/* Navegação */}
      <nav className="flex items-center gap-2 font-inter text-xs text-muted-foreground">
        <Link href="/admin/properties" className="hover:text-foreground">Imóveis</Link>
        <span>/</span>
        <Link href={`/admin/properties/${id}/edit`} className="hover:text-foreground truncate max-w-xs">{property.title}</Link>
        <span>/</span>
        <span className="text-foreground">Relatório</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-inter text-[10px] uppercase tracking-widest text-amber-600 mb-1">
            {PROPERTY_TYPE_LABELS[property.type]} · {REGION_LABELS[property.region]}
          </p>
          <h1 className="font-cormorant text-3xl font-light text-foreground">{property.title}</h1>
          <p className="mt-1 font-inter text-sm text-muted-foreground">
            {property.neighborhood}, {property.city}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-inter text-xs font-medium ${statusCfg.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
            {statusCfg.label}
          </span>
          {property.priceAsk && (
            <span className="font-inter text-sm font-semibold text-foreground">
              {formatPrice(property.priceAsk.toString())}
            </span>
          )}
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Leads vinculados",  value: property._count.interests },
          { label: "Visitas realizadas", value: property._count.visits },
          { label: "Compradores",       value: leads.filter((l) => l.lead.type === "BUYER").length },
          { label: "Proprietários",     value: leads.filter((l) => l.lead.type === "SELLER").length },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-border bg-card p-5 text-center">
            <p className="font-inter text-3xl font-bold text-foreground">{m.value}</p>
            <p className="mt-1 font-inter text-[11px] uppercase tracking-wider text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Contatos / Leads */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-inter text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Contatos vinculados
          </h2>
          <LinkLeadForm propertyId={id} />
        </div>

        {leads.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-8 text-center font-inter text-sm text-muted-foreground">
            Nenhum contato vinculado ainda.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full font-inter text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  {["Nome", "Telefone", "Tipo", "Status", "Entrada"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map(({ lead, createdAt }) => (
                  <tr key={lead.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/admin/leads/${lead.id}`} className="font-medium text-foreground hover:text-amber-600 transition-colors">
                        {lead.name}
                      </Link>
                      {lead.email && (
                        <p className="text-[11px] text-muted-foreground">{lead.email}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{lead.phone}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        lead.type === "BUYER"
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-400"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-400"
                      }`}>
                        {LEAD_TYPE_LABEL[lead.type]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {LEAD_STATUS_LABEL[lead.status] ?? lead.status}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{fmtDate(createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Visitas */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-inter text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Check-ins de visitas
          </h2>
          <AddVisitForm propertyId={id} leads={leadsForVisit} />
        </div>

        {visits.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-8 text-center font-inter text-sm text-muted-foreground">
            Nenhuma visita registrada ainda.
          </p>
        ) : (
          <div className="space-y-3">
            {visits.map((v) => (
              <div key={v.id} className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-4">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-inter text-sm font-medium text-foreground">{fmt(v.visitedAt)}</span>
                    <span className="font-inter text-xs text-muted-foreground">· {v.conductedBy}</span>
                    {v.lead && (
                      <span className="rounded-full bg-muted px-2 py-0.5 font-inter text-[11px] text-muted-foreground">
                        {v.lead.name}
                      </span>
                    )}
                  </div>
                  {v.notes && (
                    <p className="font-inter text-xs text-muted-foreground leading-relaxed">{v.notes}</p>
                  )}
                </div>
                <form action={async () => { "use server"; await deleteVisit(v.id, id); }}>
                  <button
                    type="submit"
                    className="shrink-0 font-inter text-[11px] text-muted-foreground hover:text-destructive transition-colors"
                  >
                    Remover
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Ações rápidas */}
      <div className="flex gap-3 pt-2">
        <Link
          href={`/admin/properties/${id}/edit`}
          className="font-inter text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Editar imóvel
        </Link>
        <Link
          href={`/imoveis/${property.slug}`}
          target="_blank"
          className="font-inter text-xs text-muted-foreground hover:text-amber-600 transition-colors"
        >
          Ver no site ↗
        </Link>
      </div>

    </div>
  );
}
