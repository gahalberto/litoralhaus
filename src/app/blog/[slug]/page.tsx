import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllPostSlugs, estimateReadingTime } from "@/lib/blog";
import { REGION_LABELS } from "@/lib/property-config";
import { ArticleJsonLd } from "@/components/json-ld";
import { PropertyShowcase } from "@/components/blog/PropertyShowcase";
import { WhatsAppCTA } from "@/components/blog/WhatsAppCTA";
import { Footer } from "@/components/sections/Footer";
import { Calendar, Clock, ArrowLeft, Tag } from "lucide-react";

const BASE = "https://litoralhaus.com.br";

// ─── Geração estática ─────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

// ─── Metadata dinâmica ────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Artigo não encontrado" };

  const canonicalUrl = `${BASE}/blog/${slug}`;
  const title = post.seoTitle ?? `${post.title} | Litoral Haus`;
  const rawDesc = post.seoDescription ?? post.excerpt;
  const description = rawDesc.length > 160 ? rawDesc.slice(0, 157) + "…" : rawDesc;
  const image = post.coverImage ?? "/og-image.jpg";

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    authors: [{ name: post.authorName, url: BASE }],
    openGraph: {
      type: "article",
      locale: "pt_BR",
      url: canonicalUrl,
      siteName: "Litoral Haus",
      title,
      description,
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime:  post.updatedAt.toISOString(),
      authors:       [post.authorName],
      images: [{ url: image, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const readTime = estimateReadingTime(post.content);
  const hasRelatedProperties = post.relatedProperties.length > 0;

  return (
    <>
      <ArticleJsonLd
        slug={post.slug}
        title={post.title}
        excerpt={post.excerpt}
        coverImage={post.coverImage}
        authorName={post.authorName}
        publishedAt={post.publishedAt}
        updatedAt={post.updatedAt}
      />

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="bg-zinc-950">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <Link
            href="/"
            className="font-cormorant text-xl font-light tracking-wider text-white"
          >
            Litoral Haus
          </Link>
          <nav className="hidden items-center gap-8 sm:flex">
            <Link
              href="/blog"
              className="font-inter text-xs uppercase tracking-widest text-white/60 transition hover:text-white"
            >
              Blog
            </Link>
            <Link
              href="/imoveis"
              className="font-inter text-xs uppercase tracking-widest text-white/60 transition hover:text-white"
            >
              Imóveis
            </Link>
          </nav>
        </div>

        {/* Breadcrumb */}
        <div className="border-t border-white/5">
          <nav
            aria-label="Breadcrumb"
            className="mx-auto flex max-w-4xl items-center gap-1.5 overflow-x-auto px-6 py-3 font-inter text-xs text-white/40 whitespace-nowrap"
          >
            <Link href="/" className="transition-colors hover:text-white">Litoral Haus</Link>
            <span>/</span>
            <Link href="/blog" className="transition-colors hover:text-white">Blog</Link>
            <span>/</span>
            <span className="max-w-64 truncate text-white/60">{post.title}</span>
          </nav>
        </div>
      </header>

      {/* ── Hero do artigo ────────────────────────────────────────────────── */}
      <div className="bg-zinc-950 pb-12 pt-10">
        <div className="mx-auto max-w-4xl px-6">
          {/* Localização e tags */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {post.region && (
              <span className="rounded-full bg-amber-500 px-3 py-0.5 font-inter text-[10px] font-bold uppercase tracking-widest text-white">
                {REGION_LABELS[post.region]}
                {post.neighborhood && ` · ${post.neighborhood}`}
              </span>
            )}
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 rounded-full border border-white/10 px-2.5 py-0.5 font-inter text-[10px] text-white/50"
              >
                <Tag size={9} />
                {tag}
              </span>
            ))}
          </div>

          <h1 className="font-cormorant text-4xl font-semibold leading-tight text-white sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 max-w-2xl font-inter text-base leading-relaxed text-white/60">
            {post.excerpt}
          </p>

          {/* Meta */}
          <div className="mt-6 flex flex-wrap items-center gap-5 font-inter text-xs text-white/40">
            <span className="flex items-center gap-1.5">
              <Calendar size={13} />
              {formatDate(post.publishedAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={13} />
              {readTime} min de leitura
            </span>
            <span>Por {post.authorName}</span>
          </div>
        </div>
      </div>

      {/* ── Imagem de capa ─────────────────────────────────────────────────── */}
      {post.coverImage && (
        <div className="relative h-64 w-full overflow-hidden bg-gray-200 sm:h-96 lg:h-[480px]">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
      )}

      {/* ── Corpo do artigo ─────────────────────────────────────────────────── */}
      <main className="bg-white">
        <div className="mx-auto max-w-4xl px-6 py-14">
          <div className="grid gap-12 lg:grid-cols-[1fr_280px]">

            {/* ── Coluna principal ────────────────────────────────────────── */}
            <div>
              {/* Conteúdo HTML armazenado no banco */}
              <div
                className="prose prose-lg max-w-prose
                  prose-headings:font-cormorant prose-headings:font-semibold prose-headings:text-gray-900
                  prose-h2:text-3xl prose-h3:text-2xl
                  prose-p:font-inter prose-p:leading-relaxed prose-p:text-gray-700
                  prose-a:text-amber-700 prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-gray-900
                  prose-blockquote:border-amber-400 prose-blockquote:bg-amber-50 prose-blockquote:py-1 prose-blockquote:font-cormorant prose-blockquote:text-xl prose-blockquote:italic
                  prose-img:rounded-xl
                  prose-ul:font-inter prose-ol:font-inter"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Showcase de imóveis relacionados ao artigo (via PostProperty) */}
              {hasRelatedProperties && (
                <aside className="not-prose my-10 rounded-2xl border border-amber-100 bg-amber-50/60 p-6">
                  <p className="font-inter text-[10px] uppercase tracking-widest text-amber-600">
                    Imóveis citados neste artigo
                  </p>
                  <h3 className="mt-1 font-cormorant text-xl font-semibold text-gray-900">
                    Oportunidades selecionadas pela Litoral Haus
                  </h3>
                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    {post.relatedProperties.map(({ property: p }) => (
                      <Link
                        key={p.id}
                        href={`/imoveis/${p.slug}`}
                        className="group block overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md"
                      >
                        <div className="relative h-32 overflow-hidden bg-gray-100">
                          {p.images[0] ? (
                            <Image
                              src={p.images[0]}
                              alt={p.title}
                              fill
                              sizes="(max-width: 640px) 100vw, 33vw"
                              className="object-cover transition duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <span className="font-inter text-xs text-gray-300">sem foto</span>
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="line-clamp-2 font-inter text-[13px] font-medium text-gray-900">
                            {p.title}
                          </p>
                          <p className="mt-0.5 font-inter text-[11px] text-gray-400">
                            {p.neighborhood}, {p.city}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </aside>
              )}

              {/* Showcase regional automático (se o artigo tiver bairro ou região) */}
              {(post.neighborhood || post.region) && (
                <PropertyShowcase
                  region={post.region ?? undefined}
                  neighborhood={post.neighborhood ?? undefined}
                  title={
                    post.neighborhood
                      ? `Imóveis à venda em ${post.neighborhood}`
                      : post.region
                      ? `Imóveis à venda em ${REGION_LABELS[post.region]}`
                      : undefined
                  }
                />
              )}

              {/* CTA WhatsApp */}
              <WhatsAppCTA
                region={post.region ? REGION_LABELS[post.region] : undefined}
                neighborhood={post.neighborhood ?? undefined}
              />

              {/* Voltar */}
              <div className="mt-10 border-t border-gray-100 pt-8">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 font-inter text-sm text-gray-400 transition hover:text-gray-700"
                >
                  <ArrowLeft size={15} />
                  Voltar para o Blog
                </Link>
              </div>
            </div>

            {/* ── Sidebar sticky ──────────────────────────────────────────── */}
            <aside className="hidden lg:block">
              <div className="sticky top-8 space-y-6">
                {/* Card do autor */}
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                  <p className="font-inter text-[10px] uppercase tracking-widest text-gray-400">
                    Publicado por
                  </p>
                  <p className="mt-1 font-cormorant text-xl font-semibold text-gray-900">
                    {post.authorName}
                  </p>
                  <p className="mt-1 font-inter text-xs text-gray-500">
                    Especialistas em imóveis de médio e alto padrão no litoral de São Paulo.
                  </p>
                </div>

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                    <p className="mb-3 font-inter text-[10px] uppercase tracking-widest text-gray-400">
                      Tópicos
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-gray-200 bg-white px-3 py-1 font-inter text-xs text-gray-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA sidebar */}
                <div className="rounded-2xl bg-zinc-950 p-5 text-center">
                  <p className="font-cormorant text-xl font-light text-white">
                    Encontre seu imóvel ideal
                  </p>
                  <p className="mt-1 font-inter text-xs text-white/50">
                    Curadoria personalizada para o seu perfil.
                  </p>
                  <a
                    href={`https://wa.me/5513955422935?text=${encodeURIComponent("Olá! Gostaria de uma curadoria de imóveis personalizada da Litoral Haus.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 font-inter text-xs font-bold text-white transition hover:bg-amber-600"
                  >
                    Falar com especialista
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
