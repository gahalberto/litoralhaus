import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPublishedPosts } from "@/lib/blog";
import { REGION_LABELS } from "@/lib/property-config";
import { Footer } from "@/components/sections/Footer";
import { Navbar } from "@/components/navbar";
import { Calendar, Clock } from "lucide-react";

const BASE = "https://litoralhaus.com.br";

export const metadata: Metadata = {
  title: "Blog | Guias de Bairro, Mercado Imobiliário e Dicas de Compra",
  description:
    "Conteúdo especializado sobre o mercado imobiliário do litoral paulista. Guias de bairro em Guarujá, Santos, Bertioga — dicas de compra, investimento e estilo de vida à beira-mar.",
  alternates: { canonical: `${BASE}/blog` },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: `${BASE}/blog`,
    siteName: "Litoral Haus",
    title: "Blog Litoral Haus — Guias e Inteligência Imobiliária no Litoral SP",
    description:
      "Guias de bairro, análises de mercado e dicas para quem quer comprar ou investir no litoral paulista.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
};

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export default async function BlogPage() {
  const posts = await getPublishedPosts();
  const [featured, ...rest] = posts;

  return (
    <>
      <Navbar />

      {/* ── Hero editorial ──────────────────────────────────────────────── */}
      <section className="bg-zinc-950 pb-0 pt-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 border-b border-white/10 pb-6">
            <p className="font-inter text-[10px] uppercase tracking-[0.25em] text-amber-400">
              Litoral Haus · Editorial
            </p>
            <h1 className="mt-2 font-cormorant text-4xl font-light text-white sm:text-5xl">
              Inteligência Imobiliária
              <br />
              <em className="font-light italic text-amber-300">no litoral que você ama</em>
            </h1>
            <p className="mt-4 max-w-xl font-inter text-sm leading-relaxed text-white/50">
              Guias de bairro, análises de mercado e tudo que você precisa saber antes de
              comprar ou investir no litoral de São Paulo.
            </p>
          </div>
        </div>

        {/* Post em destaque */}
        {featured && (
          <div className="mx-auto max-w-6xl px-6 pb-16">
            <Link href={`/blog/${featured.slug}`} className="group block">
              <div className="grid gap-8 lg:grid-cols-5">
                {/* Imagem */}
                <div className="relative h-64 overflow-hidden rounded-2xl bg-zinc-800 lg:col-span-3 lg:h-96">
                  {featured.coverImage ? (
                    <Image
                      src={featured.coverImage}
                      alt={featured.title}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="font-cormorant text-2xl italic text-zinc-600">
                        Litoral Haus
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full bg-amber-500 px-3 py-1 font-inter text-[10px] font-bold uppercase tracking-widest text-white">
                    Destaque
                  </span>
                </div>

                {/* Texto */}
                <div className="flex flex-col justify-center lg:col-span-2">
                  {featured.region && (
                    <p className="font-inter text-[10px] uppercase tracking-widest text-amber-400">
                      {REGION_LABELS[featured.region]}
                      {featured.neighborhood && ` · ${featured.neighborhood}`}
                    </p>
                  )}
                  <h2 className="mt-2 font-cormorant text-3xl font-semibold leading-tight text-white transition-colors group-hover:text-amber-300 lg:text-4xl">
                    {featured.title}
                  </h2>
                  <p className="mt-3 line-clamp-3 font-inter text-sm leading-relaxed text-white/60">
                    {featured.excerpt}
                  </p>
                  <div className="mt-5 flex items-center gap-4 font-inter text-xs text-white/40">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      {formatDate(featured.publishedAt)}
                    </span>
                    <span>·</span>
                    <span>{featured.authorName}</span>
                  </div>
                  <span className="mt-6 inline-flex w-fit items-center gap-2 border-b border-amber-400 pb-0.5 font-inter text-xs font-medium text-amber-400 transition group-hover:gap-3">
                    Ler artigo completo →
                  </span>
                </div>
              </div>
            </Link>
          </div>
        )}
      </section>

      {/* ── Grid de artigos ─────────────────────────────────────────────── */}
      {rest.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="mx-auto max-w-6xl px-6">
            <p className="mb-8 font-inter text-[10px] uppercase tracking-widest text-gray-400">
              Mais artigos
            </p>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md"
                >
                  {/* Capa */}
                  <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                    {post.coverImage ? (
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-zinc-100">
                        <span className="font-cormorant text-lg italic text-zinc-400">
                          Litoral Haus
                        </span>
                      </div>
                    )}
                    {post.region && (
                      <span className="absolute left-3 top-3 rounded-full bg-amber-500/90 px-2.5 py-0.5 font-inter text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                        {REGION_LABELS[post.region]}
                      </span>
                    )}
                  </div>

                  {/* Conteúdo */}
                  <div className="flex flex-1 flex-col p-5">
                    {post.tags.length > 0 && (
                      <div className="mb-2 flex flex-wrap gap-1.5">
                        {post.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-gray-200 px-2 py-0.5 font-inter text-[10px] text-gray-500"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <h2 className="font-cormorant text-xl font-semibold leading-snug text-gray-900 transition-colors group-hover:text-amber-700">
                      {post.title}
                    </h2>
                    <p className="mt-2 line-clamp-2 flex-1 font-inter text-sm leading-relaxed text-gray-500">
                      {post.excerpt}
                    </p>
                    <div className="mt-4 flex items-center gap-3 border-t border-gray-100 pt-4 font-inter text-[11px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {formatDate(post.publishedAt)}
                      </span>
                      <span>·</span>
                      <span>{post.authorName}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {posts.length === 0 && (
        <section className="flex min-h-[40vh] items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="font-cormorant text-2xl text-gray-400">
              Em breve, conteúdo exclusivo sobre o litoral.
            </p>
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}
