import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { getBairros } from "@/actions/bairros";
import { getCidades } from "@/actions/cidades";

export const metadata: Metadata = { title: "Bairros" };
export const revalidate = 0;

type Status = "todos" | "ativo" | "rascunho" | "auto";

export default async function BairrosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const cidadeId = sp.cidadeId || undefined;
  const status: Status = (sp.status as Status) || "todos";

  const filters: Parameters<typeof getBairros>[0] = { cidadeId };
  if (status === "ativo") filters.ativo = true;
  if (status === "rascunho") filters.ativo = false;
  if (status === "auto") { filters.ativo = false; filters.criadoAutomaticamente = true; }

  const [bairros, cidades] = await Promise.all([getBairros(filters), getCidades()]);

  const tabs: { key: Status; label: string }[] = [
    { key: "todos",     label: "Todos" },
    { key: "ativo",     label: "Ativos" },
    { key: "rascunho",  label: "Rascunhos" },
    { key: "auto",      label: "Criados automaticamente" },
  ];

  function tabHref(key: Status) {
    const params = new URLSearchParams();
    if (cidadeId) params.set("cidadeId", cidadeId);
    if (key !== "todos") params.set("status", key);
    const qs = params.toString();
    return `/admin/bairros${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-cormorant text-2xl font-light text-foreground">Bairros</h1>
          <p className="mt-0.5 font-inter text-xs text-muted-foreground">
            {bairros.length} {bairros.length === 1 ? "bairro" : "bairros"}
          </p>
        </div>
        <Link
          href="/admin/bairros/new"
          className="rounded-lg bg-foreground px-4 py-2 font-inter text-xs font-medium text-background transition hover:opacity-80"
        >
          + Novo bairro
        </Link>
      </div>

      {/* Tabs de status */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={tabHref(t.key)}
            className={`rounded-full border px-3 py-1.5 font-inter text-xs transition-colors ${
              status === t.key
                ? "border-amber-400 bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-400"
                : "border-border text-muted-foreground hover:border-amber-300"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Filtro de cidade */}
      <form method="get" className="mb-6 flex items-center gap-2">
        {status !== "todos" && <input type="hidden" name="status" value={status} />}
        <select
          name="cidadeId"
          defaultValue={cidadeId ?? ""}
          className="rounded-md border border-input bg-background px-3 py-2 font-inter text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
        >
          <option value="">Todas as cidades</option>
          {cidades.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
        <button type="submit" className="rounded-md border border-input px-3 py-2 font-inter text-xs text-foreground hover:bg-muted/50">
          Filtrar
        </button>
      </form>

      {status === "auto" && bairros.length > 0 && (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 font-inter text-xs text-amber-800 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300">
          Estes bairros foram criados automaticamente ao cadastrar imóveis. Revise e ative-os preenchendo slug, texto e meta description.
        </div>
      )}

      {bairros.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-20 text-center">
          <p className="font-cormorant text-2xl font-light text-muted-foreground">Nenhum bairro encontrado</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full font-inter text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                {["Bairro", "Cidade", "Status", "Origem", "Imóveis", "", ""].map((h, i) => (
                  <th key={`${h}-${i}`} className="px-5 py-3 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bairros.map((b) => (
                <tr key={b.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 font-medium text-foreground">{b.nome}</td>
                  <td className="px-5 py-3 text-muted-foreground">{b.cidade.nome}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-inter text-[11px] font-medium ${
                        b.ativo
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"
                          : "bg-stone-100 text-stone-500 dark:bg-stone-700/40 dark:text-stone-400"
                      }`}
                    >
                      {b.ativo ? "Ativo" : "Rascunho"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {b.criadoAutomaticamente ? "Automático" : "Manual"}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{b._count.properties}</td>
                  <td className="px-5 py-3">
                    {b.ativo ? (
                      <Link
                        href={`/regioes/${b.cidade.slug}/${b.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-inter text-xs text-muted-foreground transition-colors hover:text-amber-600"
                      >
                        <ExternalLink size={12} />
                        Ver
                      </Link>
                    ) : (
                      <span
                        title="Ative o bairro para visualizar a página pública"
                        className="inline-flex items-center gap-1 font-inter text-xs text-muted-foreground/40"
                      >
                        <ExternalLink size={12} />
                        Ver
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <Link href={`/admin/bairros/${b.id}/edit`} className="font-inter text-xs text-amber-600 hover:text-amber-500 transition-colors">
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
