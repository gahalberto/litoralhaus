import type { Metadata } from "next";
import Link from "next/link";
import { getAdminPosts } from "@/actions/blog";
import { REGION_LABELS } from "@/lib/property-config";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Blog" };

export default async function AdminBlogPage() {
  const posts = await getAdminPosts();

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-8 py-4">
        <div>
          <h1 className="font-cormorant text-2xl font-light text-foreground">Blog</h1>
          <p className="mt-0.5 font-inter text-xs text-muted-foreground">
            {posts.length} {posts.length === 1 ? "artigo" : "artigos"}
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center gap-2 rounded-none border border-amber-400 bg-amber-400 px-5 py-2 font-inter text-xs font-medium uppercase tracking-widest text-stone-950 transition-colors hover:bg-transparent hover:text-amber-600 dark:hover:text-amber-400"
        >
          + Novo artigo
        </Link>
      </div>

      {/* Tabela */}
      <div className="flex-1 overflow-auto">
        {posts.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <p className="font-cormorant text-2xl font-light text-muted-foreground">
              Nenhum artigo criado
            </p>
            <p className="font-inter text-xs text-muted-foreground/60">
              Crie o primeiro artigo para começar a dominar o SEO local.
            </p>
            <Link
              href="/admin/blog/new"
              className="mt-2 inline-flex items-center gap-2 border border-border px-5 py-2.5 font-inter text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
            >
              + Criar primeiro artigo
            </Link>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Título", "Região / Bairro", "Tags", "Status", "Data", ""].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left font-inter text-[10px] font-medium uppercase tracking-widest text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {posts.map((p) => (
                <tr key={p.id} className="group transition-colors hover:bg-muted/20">
                  {/* Título */}
                  <td className="px-5 py-3">
                    <p className="font-inter text-sm font-medium text-foreground">{p.title}</p>
                    <p className="font-inter text-[10px] text-muted-foreground/60">/blog/{p.slug}</p>
                  </td>

                  {/* Região */}
                  <td className="px-5 py-3 font-inter text-xs text-muted-foreground">
                    {p.region ? REGION_LABELS[p.region] : "—"}
                    {p.neighborhood && (
                      <span className="ml-1 text-muted-foreground/50">· {p.neighborhood}</span>
                    )}
                  </td>

                  {/* Tags */}
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.tags.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-muted px-2 py-0.5 font-inter text-[10px] text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                      {p.tags.length > 3 && (
                        <span className="font-inter text-[10px] text-muted-foreground/50">
                          +{p.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded px-2 py-0.5 font-inter text-[10px] uppercase tracking-wider",
                        p.published
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400"
                          : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          p.published ? "bg-emerald-400" : "bg-zinc-400"
                        )}
                      />
                      {p.published ? "Publicado" : "Rascunho"}
                    </span>
                  </td>

                  {/* Data */}
                  <td className="px-5 py-3 font-inter text-xs tabular-nums text-muted-foreground">
                    {p.publishedAt
                      ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(p.publishedAt))
                      : new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(p.updatedAt))}
                  </td>

                  {/* Ações */}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/blog/${p.id}/edit`}
                        className="font-inter text-xs text-muted-foreground transition-colors hover:text-foreground"
                      >
                        Editar
                      </Link>
                      <a
                        href={`/blog/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-inter text-xs text-amber-600 transition-colors hover:text-amber-500"
                      >
                        Ver
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
