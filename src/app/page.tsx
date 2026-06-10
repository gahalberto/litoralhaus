import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { ValueProposition } from "@/components/sections/ValueProposition";
import { LeadCaptureForm } from "@/components/sections/LeadCaptureForm";
import { FeaturedProperties } from "@/components/sections/FeaturedProperties";
import { Footer } from "@/components/sections/Footer";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "Imóveis de Alto Padrão no Guarujá e Litoral de São Paulo",
  description:
    "Acesso antecipado aos imóveis mais exclusivos do litoral paulista. Curadoria, inteligência de mercado e assessoria completa para compradores e investidores exigentes.",
  openGraph: {
    title: "Litoral Haus | Imóveis de Alto Padrão no Guarujá e Litoral SP",
    description:
      "Acesso antecipado aos imóveis mais exclusivos do litoral paulista. Cadastre seu perfil de investidor.",
  },
};

const landingPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Litoral Haus — Imóveis de Alto Padrão no Litoral Paulista",
  description:
    "Landing page de captação de leads para imóveis de alto padrão no Guarujá, Santos e litoral de São Paulo.",
  url: "https://litoralhaus.com.br",
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: ["h1", "h2", "blockquote"],
  },
  mainEntity: {
    "@type": "RealEstateAgent",
    name: "Litoral Haus",
    url: "https://litoralhaus.com.br",
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(landingPageSchema) }}
      />
      <Navbar />
      <main>
        <Hero />
        <ValueProposition />
        <FeaturedProperties />
        <LeadCaptureForm />
      </main>
      <Footer />
    </>
  );
}
