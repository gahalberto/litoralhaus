const pillars = [
  {
    number: "01",
    title: "Inteligência de Mercado",
    description:
      "Monitoramos preço por m², absorção de estoque, sazonalidade e tendências de valorização em cada microlocal do litoral paulista. Você decide com dados, não com emoção.",
  },
  {
    number: "02",
    title: "Curadoria Rigorosa",
    description:
      "Menos de 10% dos ativos que analisamos chegam ao nosso portfólio. Avaliamos localização, documentação, potencial de valorização e liquidez antes de qualquer apresentação.",
  },
  {
    number: "03",
    title: "Acesso Antecipado",
    description:
      "Nossa rede de relacionamento com construtoras, incorporadoras e proprietários nos permite oferecer oportunidades antes da divulgação pública — preços de pré-lançamento, condições exclusivas.",
  },
  {
    number: "04",
    title: "Assessoria Completa",
    description:
      "Do primeiro contato à entrega das chaves: análise jurídica, due diligence documental, assessoria tributária e suporte na negociação. Você cuida do investimento, nós cuidamos do processo.",
  },
];

export function ValueProposition() {
  return (
    <section
      id="diferenciais"
      aria-labelledby="diferenciais-heading"
      className="relative bg-stone-950 px-6 py-32"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(180,140,80,0.06),transparent)]"
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-20 text-center">
          <p className="mb-4 font-inter text-xs font-medium uppercase tracking-[0.3em] text-amber-400/80">
            Por que o litoral com a Litoral Haus
          </p>
          <h2
            id="diferenciais-heading"
            className="font-cormorant text-4xl font-light text-stone-50 sm:text-5xl"
          >
            Inteligência que transforma{" "}
            <em className="font-light not-italic text-amber-300">
              beira-mar em patrimônio.
            </em>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl font-inter text-base font-light leading-relaxed text-stone-400">
            O litoral de São Paulo concentra uma das maiores demandas por imóveis
            residenciais do país. Nossa missão é conectar compradores, famílias e
            investidores às melhores oportunidades do médio e alto padrão — com a
            inteligência e a agilidade que esse mercado exige.
          </p>
        </div>

        <div className="grid gap-px border border-stone-800 bg-stone-800 sm:grid-cols-2">
          {pillars.map((pillar) => (
            <article
              key={pillar.number}
              className="group bg-stone-950 p-10 transition-colors duration-300 hover:bg-stone-900"
            >
              <span className="mb-6 block font-cormorant text-4xl font-light text-amber-400/40 transition-colors duration-300 group-hover:text-amber-400/70">
                {pillar.number}
              </span>
              <h3 className="mb-4 font-cormorant text-2xl font-light text-stone-50">
                {pillar.title}
              </h3>
              <p className="font-inter text-sm font-light leading-relaxed text-stone-400">
                {pillar.description}
              </p>
            </article>
          ))}
        </div>

        {/* Bloco de prova social textual */}
        <div className="mt-20 border-t border-stone-800 pt-20 text-center">
          <blockquote className="mx-auto max-w-3xl">
            <p className="font-cormorant text-2xl font-light italic leading-relaxed text-stone-300 sm:text-3xl">
              &ldquo;No litoral paulista, os melhores imóveis nunca chegam a um portal.
              Eles são negociados entre quem conhece o mercado de verdade.&rdquo;
            </p>
            <footer className="mt-6">
              <p className="font-inter text-xs uppercase tracking-widest text-amber-400/70">
                Gabriel Alberto · CRECI 267769-F · Fundador, Litoral Haus
              </p>
            </footer>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
