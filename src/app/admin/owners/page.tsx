import type { Metadata } from "next";
import Link from "next/link";
import { getOwners } from "@/actions/owners";

export const metadata: Metadata = { title: "Proprietários" };

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(d));
}

export default async function OwnersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;
  const owners = await getOwners(q);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-cormorant text-2xl font-light text-foreground">Proprietários</h1>
          <p className="mt-0.5 font-inter text-xs text-muted-foreground">
            {owners.length} {owners.length === 1 ? "cadastrado" : "cadastrados"}
          </p>
        </div>
        <Link
          href="/admin/owners/new"
          className="rounded-lg bg-foreground px-4 py-2 font-inter text-xs font-medium text-background transition hover:opacity-80"
        >
          + Novo proprietário
        </Link>
      </div>

      {/* Busca */}
      <form method="get" className="mb-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nome ou telefone..."
          className="w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 font-inter text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-ring focus:ring-1 focus:ring-ring"
        />
      </form>

      {/* Tabela */}
      {owners.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-20 text-center">
          <p className="font-cormorant text-2xl font-light text-muted-foreground">
            {q ? "Nenhum resultado para a busca" : "Nenhum proprietário cadastrado"}
          </p>
          {!q && (
            <Link href="/admin/owners/new" className="mt-3 inline-block font-inter text-xs text-amber-600 hover:text-amber-500">
              Cadastrar primeiro proprietário →
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full font-inter text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                {["Nome", "Telefone", "E-mail", "Imóveis", "Cadastro", ""].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {owners.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 font-medium text-foreground">{o.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{o.phone}</td>
                  <td className="px-5 py-3 text-muted-foreground">{o.email ?? "—"}</td>
                  <td className="px-5 py-3">
                    {o._count.properties > 0 ? (
                      <Link
                        href={`/admin/owners/${o.id}/edit`}
                        className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-400/15 px-2 py-0.5 font-inter text-[11px] font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-400/25 transition-colors"
                      >
                        {o._count.properties} imóvel{o._count.properties !== 1 ? "s" : ""}
                        <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                          <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </Link>
                    ) : (
                      <span className="rounded-full bg-muted px-2 py-0.5 font-inter text-[11px] text-muted-foreground">
                        0 imóveis
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{fmtDate(o.createdAt)}</td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/owners/${o.id}/edit`}
                      className="font-inter text-xs text-amber-600 hover:text-amber-500 transition-colors"
                    >
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
