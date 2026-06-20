import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/sections/Footer";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contato | Litoral Haus",
  description:
    "Entre em contato com a Litoral Haus. Atendimento personalizado para compra, venda e locação de imóveis no litoral de São Paulo.",
};

const contactItems = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6.07 5.82l.8-.8a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    label: "WhatsApp",
    value: "+55 (13) 99999-9999",
    href: "https://wa.me/5513999999999",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
    label: "E-mail",
    value: "contato@litoralhaus.com.br",
    href: "mailto:contato@litoralhaus.com.br",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    label: "Região de atuação",
    value: "Guarujá, Santos e Litoral SP",
    href: undefined,
  },
];

export default function ContatoPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-stone-950 pt-24 pb-24">
        <div className="mx-auto max-w-6xl px-6">

          {/* Header */}
          <div className="mb-16 text-center">
            <p className="mb-3 font-inter text-xs uppercase tracking-[0.25em] text-amber-400/70">
              Fale conosco
            </p>
            <h1 className="font-cormorant text-4xl font-light tracking-wide text-stone-50 sm:text-5xl">
              Entre em Contato
            </h1>
            <p className="mx-auto mt-4 max-w-md font-inter text-sm font-light leading-relaxed text-stone-400">
              Nossa equipe está pronta para ajudá-lo a encontrar o imóvel ideal
              ou a valorizar seu patrimônio no litoral paulista.
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-[1fr_420px]">
            {/* Formulário */}
            <div className="order-2 lg:order-1">
              <ContactForm />
            </div>

            {/* Informações de contato */}
            <div className="order-1 lg:order-2">
              <div className="space-y-6">
                {contactItems.map((item) => (
                  <div key={item.label} className="flex items-start gap-4 rounded-xl border border-stone-800 bg-stone-900/50 p-5">
                    <div className="mt-0.5 shrink-0 text-amber-400/70">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-inter text-xs uppercase tracking-widest text-stone-500">
                        {item.label}
                      </p>
                      {item.href ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 block font-inter text-sm text-stone-200 transition-colors hover:text-amber-400"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="mt-1 font-inter text-sm text-stone-200">
                          {item.value}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Horário */}
                <div className="rounded-xl border border-stone-800 bg-stone-900/50 p-5">
                  <p className="font-inter text-xs uppercase tracking-widest text-stone-500">
                    Horário de atendimento
                  </p>
                  <div className="mt-3 space-y-1.5">
                    {[
                      { dias: "Segunda a Sexta", hora: "09h – 18h" },
                      { dias: "Sábado",          hora: "09h – 13h" },
                      { dias: "Domingo",         hora: "Fechado"   },
                    ].map((h) => (
                      <div key={h.dias} className="flex justify-between font-inter text-sm">
                        <span className="text-stone-400">{h.dias}</span>
                        <span className="text-stone-200">{h.hora}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
