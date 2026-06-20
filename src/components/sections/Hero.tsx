import Image from "next/image";
import { getAvailableRegions } from "@/lib/public-properties";
import { HeroSearch } from "@/components/hero-search";

export async function Hero() {
  const regions = await getAvailableRegions();
  return (
    <section
      aria-label="Apresentação Litoral Haus"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-32 text-center"
    >
      {/* Imagem de fundo */}
      <Image
        src="/background-fundo.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        quality={85}
        className="object-cover"
        aria-hidden
      />

      {/* Escurecimento sobre a imagem */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-stone-950/65"
      />

      {/* Gradiente nas bordas para suavizar */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-stone-950/40 via-transparent to-stone-950/70"
      />

      {/* Toque âmbar sutil */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(180,140,80,0.10),transparent)]"
      />

      <div className="relative z-10 mx-auto max-w-4xl">
        <p className="mb-6 font-inter text-xs font-medium uppercase tracking-[0.3em] text-amber-400/80">
          Litoral Paulista · Médio e Alto Padrão
        </p>

        <h1 className="font-cormorant text-5xl font-light leading-[1.1] text-stone-50 sm:text-6xl md:text-7xl">
          O litoral que você merece{" "}
          <em className="font-light not-italic text-amber-300">
            aguarda sua decisão.
          </em>
        </h1>

        <p className="mx-auto mt-8 max-w-2xl font-inter text-lg font-light leading-relaxed text-stone-300/80">
          Reunimos inteligência de mercado, curadoria rigorosa e atendimento
          personalizado para encontrar o imóvel certo no Guarujá, Santos e
          litoral paulista — do médio ao alto padrão.
        </p>

        <div className="mt-10 flex justify-center">
          <HeroSearch regions={regions} />
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href="#captura"
            className="font-inter text-xs uppercase tracking-widest text-stone-500 transition-colors hover:text-stone-300"
          >
            Cadastre seu perfil de investidor →
          </a>
        </div>

        <div className="mt-20 grid grid-cols-3 divide-x divide-stone-700/60 border-t border-stone-700/60 pt-10">
          {[
            { value: "R$ 300k+", label: "A partir de" },
            { value: "Guarujá · Santos", label: "Regiões prioritárias" },
            { value: "Acesso antecipado", label: "Antes do lançamento público" },
          ].map((stat) => (
            <div key={stat.label} className="px-6 text-center">
              <p className="font-cormorant text-2xl font-light text-amber-300 sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 font-inter text-xs uppercase tracking-widest text-stone-500">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Indicador de scroll */}
      <div
        aria-hidden
        className="absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-stone-600"
      >
        <span className="font-inter text-[10px] uppercase tracking-widest">scroll</span>
        <div className="h-10 w-px animate-pulse bg-gradient-to-b from-stone-600 to-transparent" />
      </div>
    </section>
  );
}
