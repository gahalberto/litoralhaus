import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getOwnerById, deleteOwner } from "@/actions/owners";
import { OwnerForm } from "@/components/admin/OwnerForm";
import { PROPERTY_TYPE_LABELS, PROPERTY_STATUS_CONFIG, formatPrice } from "@/lib/property-config";

export const metadata: Metadata = { title: "Editar Proprietário" };

function fmt(d: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(d));
}

const FIELD_ICONS: Record<string, string> = {
  "Telefone": "📞",
  "E-mail":   "✉️",
  "Nome":     "👤",
  "CPF":      "🪪",
  "Observações": "📝",
};

export default async function EditOwnerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const owner = await getOwnerById(id);
  if (!owner) notFound();

  const initialData = {
    id:    owner.id,
    name:  owner.name,
    phone: owner.phone,
    email: owner.email  ?? "",
    cpf:   owner.cpf    ?? "",
    notes: owner.notes  ?? "",
  };

  return (
    <div className="mx-auto max-w-4xl px-8 py-8 space-y-10">
      {/* Nav */}
      <nav className="flex items-center gap-2 font-inter text-xs text-muted-foreground">
        <Link href="/admin/owners" className="hover:text-foreground">Proprietários</Link>
        <span>/</span>
        <span className="text-foreground truncate max-w-xs">{owner.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        {/* Coluna principal */}
        <div className="space-y-8">
          <div>
            <h1 className="font-cormorant text-2xl font-light text-foreground">{owner.name}</h1>
            <p className="mt-1 font-inter text-xs text-muted-foreground">
              Cadastrado em {fmt(owner.createdAt)}
              {owner.updatedAt > owner.createdAt && ` · Atualizado em ${fmt(owner.updatedAt)}`}
            </p>
          </div>

          <OwnerForm initialData={initialData} />

          {/* Imóveis vinculados */}
          <section>
            <h2 className="mb-4 font-inter text-xs uppercase tracking-widest text-muted-foreground">
              Imóveis vinculados ({owner.properties.length})
            </h2>
            {owner.properties.length === 0 ? (
              <p className="font-inter text-sm text-muted-foreground">Nenhum imóvel vinculado.</p>
            ) : (
              <div className="space-y-2">
                {owner.properties.map((p) => {
                  const cfg = PROPERTY_STATUS_CONFIG[p.status];
                  return (
                    <div key={p.id} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate font-inter text-sm font-medium text-foreground">{p.title}</p>
                        <p className="font-inter text-xs text-muted-foreground">
                          {PROPERTY_TYPE_LABELS[p.type]} · {p.neighborhood}, {p.city}
                        </p>
                      </div>
                      <div className="ml-4 flex shrink-0 items-center gap-3">
                        {p.priceAsk && (
                          <span className="font-inter text-xs text-muted-foreground">
                            {formatPrice(p.priceAsk.toString())}
                          </span>
                        )}
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-inter text-[10px] font-medium ${cfg.badge}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                        <Link
                          href={`/admin/properties/${p.id}/edit`}
                          className="font-inter text-[11px] text-amber-600 hover:text-amber-500 transition-colors"
                        >
                          Editar
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Excluir */}
          <section className="border-t border-border pt-6">
            <p className="mb-3 font-inter text-xs text-muted-foreground">
              Excluir remove o proprietário mas não afeta os imóveis vinculados.
            </p>
            <form action={async () => { "use server"; await deleteOwner(id); redirect("/admin/owners"); }}>
              <button type="submit" className="font-inter text-xs text-destructive hover:underline transition-colors">
                Excluir proprietário
              </button>
            </form>
          </section>
        </div>

        {/* Histórico de edições */}
        <div>
          <h2 className="mb-4 font-inter text-xs uppercase tracking-widest text-muted-foreground">
            Histórico de edições
          </h2>
          {owner.history.length === 0 ? (
            <p className="font-inter text-sm text-muted-foreground">Nenhuma alteração registrada.</p>
          ) : (
            <div className="space-y-3">
              {owner.history.map((h) => (
                <div key={h.id} className="rounded-lg border border-border bg-card p-3">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-inter text-xs font-semibold text-foreground">
                      {FIELD_ICONS[h.field] ?? "✏️"} {h.field}
                    </span>
                    <span className="font-inter text-[10px] text-muted-foreground shrink-0">
                      {fmt(h.createdAt)}
                    </span>
                  </div>
                  {h.oldValue && (
                    <p className="font-inter text-[11px] text-muted-foreground line-through">
                      {h.oldValue}
                    </p>
                  )}
                  {h.newValue && (
                    <p className="font-inter text-[11px] text-foreground">{h.newValue}</p>
                  )}
                  <p className="mt-1 font-inter text-[10px] text-muted-foreground/60">
                    por {h.changedBy}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
