import type { Metadata } from "next";
import Link from "next/link";
import { getCidades } from "@/actions/cidades";

export const metadata: Metadata = { title: "Cidades" };
export const revalidate = 0;

export default async function CidadesPage() {
  const cidades = await getCidades();

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-cormorant text-2xl font-light text-foreground">Cidades</h1>
          <p className="mt-0.5 font-inter text-xs text-muted-foreground">
            {cidades.length} {cidades.length === 1 ? "cidade" : "cidades"}
          </p>
        </div>
        <Link
          href="/admin/cidades/new"
          className="rounded-lg bg-foreground px-4 py-2 font-inter text-xs font-medium text-background transition hover:opacity-80"
        >
          + Nova cidade
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full font-inter text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              {["Cidade", "Slug", "Status", "Bairros", "Imóveis", ""].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cidades.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-5 py-3 font-medium text-foreground">{c.nome}/{c.uf}</td>
                <td className="px-5 py-3 text-muted-foreground">/regioes/{c.slug}</td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-inter text-[11px] font-medium ${
                      c.ativo
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"
                        : "bg-stone-100 text-stone-500 dark:bg-stone-700/40 dark:text-stone-400"
                    }`}
                  >
                    {c.ativo ? "Ativa" : "Rascunho"}
                  </span>
                </td>
                <td className="px-5 py-3 text-muted-foreground">
                  <Link href={`/admin/bairros?cidadeId=${c.id}`} className="hover:text-amber-600 hover:underline">
                    {c._count.bairros}
                  </Link>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{c._count.properties}</td>
                <td className="px-5 py-3">
                  <Link href={`/admin/cidades/${c.id}/edit`} className="font-inter text-xs text-amber-600 hover:text-amber-500 transition-colors">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
