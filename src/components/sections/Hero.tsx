import Link from "next/link";

export function Hero() {
  return (
    <section
      aria-label="Apresentação Litoral Haus"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-32 text-center"
    >
      {/* Gradient cinematográfico de fundo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-stone-950 via-stone-900/80 to-stone-950"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(180,140,80,0.15),transparent)]"
      />

      {/* Grid sutil de fundo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
          backgroundSize: "80px 80px",
        }}
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

        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="#captura"
            className="inline-flex min-w-[220px] items-center justify-center rounded-none border border-amber-400 bg-amber-400 px-8 py-4 font-inter text-sm font-medium uppercase tracking-widest text-stone-950 transition-all duration-300 hover:bg-transparent hover:text-amber-400"
          >
            Quero ser avisado primeiro
          </a>
          <a
            href="#diferenciais"
            className="inline-flex min-w-[220px] items-center justify-center rounded-none border border-stone-600 px-8 py-4 font-inter text-sm font-medium uppercase tracking-widest text-stone-300 transition-all duration-300 hover:border-stone-300 hover:text-stone-50"
          >
            Nossa inteligência
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
