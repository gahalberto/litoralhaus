import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/sections/Footer";
import { BreadcrumbJsonLd } from "@/components/json-ld";

const BASE = "https://litoralhaus.com.br";

const TITLE = "Regiões atendidas";
const DESCRIPTION =
  "Conheça os bairros do Guarujá, Santos e região da Baixada Santista onde a Litoral Haus atua — como é morar em cada um, preços médios e imóveis disponíveis.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${BASE}/regioes` },
  openGraph: {
    type: "website",
    url: `${BASE}/regioes`,
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default async function RegioesPage() {
  const cidades = await prisma.cidade.findMany({
    where: { ativo: true },
    orderBy: { nome: "asc" },
    include: {
      bairros: { where: { ativo: true }, orderBy: { nome: "asc" }, select: { slug: true, nome: true } },
    },
  });

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Início",  url: BASE },
          { name: "Regiões", url: `${BASE}/regioes` },
        ]}
      />
      <Navbar />
      <div className="min-h-screen bg-background text-foreground">
        <div className="border-b border-border px-6 pt-28 pb-10">
          <div className="mx-auto max-w-5xl">
            <p className="mb-2 font-inter text-[10px] uppercase tracking-[0.3em] text-amber-500/80">
              Regiões atendidas
            </p>
            <h1 className="font-cormorant text-4xl font-light sm:text-5xl">
              Onde a LitoralHaus atua
            </h1>
            <p className="mt-3 max-w-2xl font-inter text-sm text-muted-foreground">
              Guarujá, Santos e a Baixada Santista, bairro a bairro. Escolha uma cidade para
              entender como é morar em cada região.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-6 py-12 space-y-12">
          {cidades.length === 0 ? (
            <p className="py-20 text-center font-cormorant text-2xl font-light text-muted-foreground">
              Em breve novas regiões.
            </p>
          ) : (
            cidades.map((cidade) => (
              <section key={cidade.id}>
                <div className="mb-4 flex items-baseline justify-between gap-4">
                  <h2 className="font-cormorant text-2xl font-light">
                    <Link href={`/regioes/${cidade.slug}`} className="hover:text-amber-500 transition-colors">
                      {cidade.nome}/{cidade.uf}
                    </Link>
                  </h2>
                  <span className="font-inter text-xs text-muted-foreground">
                    {cidade.bairros.length} {cidade.bairros.length === 1 ? "bairro" : "bairros"}
                  </span>
                </div>
                {cidade.bairros.length === 0 ? (
                  <p className="font-inter text-sm text-muted-foreground">Bairros em breve.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {cidade.bairros.map((b) => (
                      <Link
                        key={b.slug}
                        href={`/regioes/${cidade.slug}/${b.slug}`}
                        className="rounded-full border border-border px-3.5 py-1.5 font-inter text-xs text-foreground transition-colors hover:border-amber-400 hover:text-amber-600"
                      >
                        {b.nome}
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            ))
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
