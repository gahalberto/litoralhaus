import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Eye, Tag, MapPin, Pencil, ExternalLink, Clock, ArrowLeft } from "lucide-react";
import { getAdminPostById } from "@/actions/blog";
import { getSession } from "@/lib/session";
import { REGION_LABELS } from "@/lib/property-config";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Visualizar Artigo" };

const CAN_EDIT: Array<"ADMIN" | "CORRETOR"> = ["ADMIN", "CORRETOR"];

function fmt(d: Date | string, opts?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("pt-BR", opts ?? { dateStyle: "long", timeStyle: "short" }).format(
    new Date(d)
  );
}

function estimateReading(html: string): number {
  const words = html.replace(/<[^>]*>/g, " ").trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export default async function AdminPostViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, session] = await Promise.all([getAdminPostById(id), getSession()]);

  if (!post) notFound();

  const canEdit = session && CAN_EDIT.includes(session.role);
  const readingTime = estimateReading(post.content);

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950 pb-16">

      {/* ── Topbar ─────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-white/90 dark:bg-zinc-950/90 backdrop-blur px-6 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/blog"
            className="flex items-center gap-1.5 font-inter text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={13} />
            Blog
          </Link>
          <span className="text-muted-foreground/30">/</span>
          <span className="max-w-xs truncate font-inter text-xs text-foreground">{post.title}</span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`/blog/${post.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded border border-border px-3 py-1.5 font-inter text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            <ExternalLink size={12} />
            Ver no site
          </a>

          {canEdit && (
            <Link
              href={`/admin/blog/${post.id}/edit`}
              className="inline-flex items-center gap-1.5 rounded border border-amber-400 bg-amber-400 px-3 py-1.5 font-inter text-xs font-medium text-stone-950 transition-colors hover:bg-amber-300"
            >
              <Pencil size={12} />
              Editar
            </Link>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 pt-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_260px]">

          {/* ── Coluna principal ─────────────────────────────────────────── */}
          <div className="min-w-0">

            {/* Capa */}
            {post.coverImage && (
              <div className="relative mb-8 h-64 overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800 sm:h-80">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 700px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
              </div>
            )}

            {/* Cabeçalho do post */}
            <div className="mb-8">
              {/* Status badge */}
              <div className="mb-3 flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded px-2 py-0.5 font-inter text-[10px] uppercase tracking-wider",
                    post.published
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400"
                      : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      post.published ? "bg-emerald-400" : "bg-zinc-400"
                    )}
                  />
                  {post.published ? "Publicado" : "Rascunho"}
                </span>

                {post.region && (
                  <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 font-inter text-[10px] text-amber-700 dark:bg-amber-400/10 dark:text-amber-400">
                    <MapPin size={9} />
                    {REGION_LABELS[post.region]}
                    {post.neighborhood && ` · ${post.neighborhood}`}
                  </span>
                )}
              </div>

              <h1 className="font-cormorant text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="mt-3 font-inter text-sm leading-relaxed text-muted-foreground">
                  {post.excerpt}
                </p>
              )}

              {/* Meta linha */}
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-inter text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar size={12} />
                  {post.publishedAt
                    ? fmt(post.publishedAt, { dateStyle: "long" })
                    : "Não publicado"}
                </span>
                <span>·</span>
                <span>{post.authorName}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {readingTime} min de leitura
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <Eye size={12} className={post.viewCount > 0 ? "text-amber-500" : "text-muted-foreground/40"} />
                  {post.viewCount.toLocaleString("pt-BR")} {post.viewCount === 1 ? "visualização" : "visualizações"}
                </span>
              </div>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 font-inter text-[11px] text-muted-foreground"
                    >
                      <Tag size={9} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Divisor */}
            <hr className="mb-8 border-border" />

            {/* Conteúdo do artigo */}
            <div
              className="article-content"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {/* ── Sidebar ──────────────────────────────────────────────────── */}
          <aside className="hidden lg:block">
            <div className="sticky top-20 space-y-5">

              {/* Ações */}
              <div className="rounded-xl border border-border bg-white p-4 dark:bg-zinc-900">
                <p className="mb-3 font-inter text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Ações
                </p>
                <div className="flex flex-col gap-2">
                  {canEdit && (
                    <Link
                      href={`/admin/blog/${post.id}/edit`}
                      className="flex items-center justify-center gap-2 rounded border border-amber-400 bg-amber-400 px-4 py-2 font-inter text-xs font-medium text-stone-950 transition-colors hover:bg-amber-300"
                    >
                      <Pencil size={12} />
                      Editar artigo
                    </Link>
                  )}
                  <a
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded border border-border px-4 py-2 font-inter text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                  >
                    <ExternalLink size={12} />
                    Ver no site
                  </a>
                </div>
              </div>

              {/* Métricas */}
              <div className="rounded-xl border border-border bg-white p-4 dark:bg-zinc-900">
                <p className="mb-3 font-inter text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Métricas
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-inter text-xs text-muted-foreground">
                      <Eye size={12} /> Visualizações
                    </span>
                    <span className="font-inter text-sm font-semibold tabular-nums text-foreground">
                      {post.viewCount.toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-inter text-xs text-muted-foreground">
                      <Clock size={12} /> Leitura
                    </span>
                    <span className="font-inter text-sm font-semibold tabular-nums text-foreground">
                      {readingTime} min
                    </span>
                  </div>
                </div>
              </div>

              {/* SEO */}
              {(post.seoTitle || post.seoDescription) && (
                <div className="rounded-xl border border-border bg-white p-4 dark:bg-zinc-900">
                  <p className="mb-3 font-inter text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    SEO
                  </p>
                  {post.seoTitle && (
                    <div className="mb-2">
                      <p className="font-inter text-[10px] text-muted-foreground/60">Título</p>
                      <p className="font-inter text-xs text-foreground">{post.seoTitle}</p>
                    </div>
                  )}
                  {post.seoDescription && (
                    <div>
                      <p className="font-inter text-[10px] text-muted-foreground/60">Descrição</p>
                      <p className="font-inter text-xs leading-relaxed text-foreground">{post.seoDescription}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Datas */}
              <div className="rounded-xl border border-border bg-white p-4 dark:bg-zinc-900">
                <p className="mb-3 font-inter text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Datas
                </p>
                <div className="space-y-2">
                  <div>
                    <p className="font-inter text-[10px] text-muted-foreground/60">Criado</p>
                    <p className="font-inter text-xs text-foreground">{fmt(post.createdAt)}</p>
                  </div>
                  <div>
                    <p className="font-inter text-[10px] text-muted-foreground/60">Atualizado</p>
                    <p className="font-inter text-xs text-foreground">{fmt(post.updatedAt)}</p>
                  </div>
                  {post.publishedAt && (
                    <div>
                      <p className="font-inter text-[10px] text-muted-foreground/60">Publicado</p>
                      <p className="font-inter text-xs text-foreground">{fmt(post.publishedAt)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Slug */}
              <div className="rounded-xl border border-border bg-white p-4 dark:bg-zinc-900">
                <p className="mb-1.5 font-inter text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  URL
                </p>
                <p className="break-all font-mono text-[10px] text-muted-foreground">
                  /blog/{post.slug}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
