import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getLeadById, deleteLead } from "@/actions/leads";
import { LeadEditForm } from "@/components/admin/LeadEditForm";
import { AddInteractionForm } from "@/components/admin/AddInteractionForm";
import { LEAD_STATUS_CONFIG, BUDGET_LABELS } from "@/lib/lead-config";
import { PROPERTY_TYPE_LABELS, PROPERTY_STATUS_CONFIG, formatPrice } from "@/lib/property-config";

export const metadata: Metadata = { title: "Lead" };

const CHANNEL_ICON: Record<string, string> = {
  WHATSAPP: "💬", EMAIL: "✉️", PHONE: "📞",
  VISIT: "🏠", VIDEO_CALL: "📹", NOTE: "📝",
};
const CHANNEL_LABEL: Record<string, string> = {
  WHATSAPP: "WhatsApp", EMAIL: "E-mail", PHONE: "Telefone",
  VISIT: "Visita", VIDEO_CALL: "Videochamada", NOTE: "Anotação",
};
const SOURCE_LABELS: Record<string, string> = {
  LANDING_PAGE: "Landing Page", WHATSAPP: "WhatsApp", INSTAGRAM: "Instagram",
  GOOGLE_ADS: "Google Ads", REFERRAL: "Indicação", DIRECT: "Direto",
};

function fmt(d: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(d));
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = await getLeadById(id);
  if (!lead) notFound();

  const cfg = LEAD_STATUS_CONFIG[lead.status];

  const defaultValues = {
    name:        lead.name,
    phone:       lead.phone,
    email:       lead.email    ?? "",
    whatsapp:    lead.whatsapp ?? "",
    type:        lead.type,
    status:      lead.status,
    source:      lead.source,
    budgetRange: (lead.budgetRange ?? "") as import("@prisma/client").BudgetRange | "",
    regions:     lead.regions,
    notes:       lead.notes ?? "",
  };

  return (
    <div className="mx-auto max-w-5xl px-8 py-8 space-y-8">
      {/* Nav */}
      <nav className="flex items-center gap-2 font-inter text-xs text-muted-foreground">
        <Link href="/admin/leads?view=list" className="hover:text-foreground">Leads</Link>
        <span>/</span>
        <span className="text-foreground truncate max-w-xs">{lead.name}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-cormorant text-3xl font-light text-foreground">{lead.name}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 font-inter text-xs text-muted-foreground">
            <span>{lead.phone}</span>
            {lead.email && <><span>·</span><span>{lead.email}</span></>}
            <span>·</span>
            <span>Origem: {SOURCE_LABELS[lead.source] ?? lead.source}</span>
            <span>·</span>
            <span>Entrou em {fmt(lead.createdAt)}</span>
          </div>
        </div>
        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 font-inter text-xs font-medium ${cfg.badge}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* Coluna principal */}
        <div className="space-y-8 min-w-0">

          {/* Dados do lead */}
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-5 font-inter text-xs uppercase tracking-widest text-muted-foreground">Dados</h2>
            <LeadEditForm leadId={id} defaultValues={defaultValues} />
          </section>

          {/* Imóveis de interesse */}
          {lead.interests.length > 0 && (
            <section>
              <h2 className="mb-4 font-inter text-xs uppercase tracking-widest text-muted-foreground">
                Imóveis de interesse ({lead.interests.length})
              </h2>
              <div className="space-y-2">
                {lead.interests.map(({ property, createdAt }) => {
                  const pCfg = PROPERTY_STATUS_CONFIG[property.status];
                  return (
                    <div key={property.id} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate font-inter text-sm font-medium text-foreground">{property.title}</p>
                        <p className="font-inter text-xs text-muted-foreground">
                          {PROPERTY_TYPE_LABELS[property.type]} · {property.neighborhood}, {property.city}
                          {" · "} interesse em {fmt(createdAt)}
                        </p>
                      </div>
                      <div className="ml-3 flex shrink-0 items-center gap-3">
                        {property.priceAsk && (
                          <span className="font-inter text-xs text-muted-foreground hidden sm:block">
                            {formatPrice(property.priceAsk.toString())}
                          </span>
                        )}
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-inter text-[10px] font-medium ${pCfg.badge}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${pCfg.dot}`} />
                          {pCfg.label}
                        </span>
                        <Link
                          href={`/admin/properties/${property.id}/report`}
                          className="font-inter text-[11px] text-amber-600 hover:text-amber-500 transition-colors"
                        >
                          Relatório
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Exclusão */}
          <section className="border-t border-border pt-4">
            <form action={async () => { "use server"; await deleteLead(id); redirect("/admin/leads?view=list"); }}>
              <button type="submit" className="font-inter text-xs text-destructive hover:underline">
                Excluir lead
              </button>
            </form>
          </section>
        </div>

        {/* Coluna lateral — histórico de interações */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-inter text-xs uppercase tracking-widest text-muted-foreground">
              Histórico de contatos
            </h2>
            <span className="font-inter text-xs text-muted-foreground">{lead.interactions.length}</span>
          </div>

          <AddInteractionForm leadId={id} />

          {lead.interactions.length === 0 ? (
            <p className="font-inter text-sm text-muted-foreground">Nenhum contato registrado.</p>
          ) : (
            <div className="space-y-3">
              {lead.interactions.map((i) => (
                <div key={i.id} className="rounded-xl border border-border bg-card p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{CHANNEL_ICON[i.channel] ?? "📌"}</span>
                      <span className="font-inter text-xs font-semibold text-foreground">
                        {CHANNEL_LABEL[i.channel] ?? i.channel}
                      </span>
                      <span className="font-inter text-[10px] text-muted-foreground">
                        · {i.direction === "INBOUND" ? "receptivo" : "ativo"}
                      </span>
                    </div>
                    <span className="font-inter text-[10px] text-muted-foreground shrink-0">{fmt(i.createdAt)}</span>
                  </div>
                  <p className="font-inter text-xs leading-relaxed text-foreground">{i.summary}</p>
                  {i.nextStep && (
                    <p className="font-inter text-[11px] text-amber-600">
                      → {i.nextStep}
                      {i.nextStepAt && ` · ${fmt(i.nextStepAt)}`}
                    </p>
                  )}
                  <p className="font-inter text-[10px] text-muted-foreground/60">por {i.performedBy}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
