import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { ValueProposition } from "@/components/sections/ValueProposition";
import { LeadCaptureForm } from "@/components/sections/LeadCaptureForm";
import { FeaturedProperties } from "@/components/sections/FeaturedProperties";
import { Footer } from "@/components/sections/Footer";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "Imóveis no Guarujá e Litoral de São Paulo | Médio e Alto Padrão",
  description:
    "Curadoria de imóveis de médio e alto padrão no litoral paulista. Inteligência de mercado e assessoria completa para compradores, famílias e investidores.",
  openGraph: {
    title: "Litoral Haus | Imóveis no Guarujá e Litoral SP",
    description:
      "Imóveis de médio e alto padrão no litoral paulista. Encontre seu imóvel ideal com curadoria e atendimento personalizado.",
  },
};

const landingPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Litoral Haus — Imóveis no Litoral Paulista",
  description:
    "Curadoria de imóveis de médio e alto padrão no Guarujá, Santos e litoral de São Paulo.",
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
