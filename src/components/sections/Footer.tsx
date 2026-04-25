export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      aria-label="Rodapé Litoral Haus"
      className="border-t border-stone-800 bg-stone-950 px-6 py-16"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 sm:grid-cols-3">
          {/* Brand */}
          <div>
            <p className="font-cormorant text-2xl font-light tracking-wider text-stone-50">
              Litoral Haus
            </p>
            <p className="mt-3 font-inter text-xs font-light leading-relaxed text-stone-500">
              Curadoria de imóveis de alto padrão no litoral de São Paulo.
              Inteligência de mercado para decisões de investimento exigentes.
            </p>
          </div>

          {/* Regiões */}
          <div>
            <p className="mb-4 font-inter text-xs uppercase tracking-widest text-amber-400/70">
              Regiões atendidas
            </p>
            <ul className="space-y-2 font-inter text-xs text-stone-500">
              {[
                "Guarujá",
                "Santos",
                "Bertioga",
                "São Vicente",
                "Ubatuba",
                "Ilhabela",
                "São Sebastião",
              ].map((city) => (
                <li key={city}>{city}</li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <p className="mb-4 font-inter text-xs uppercase tracking-widest text-amber-400/70">
              Contato
            </p>
            <ul className="space-y-3 font-inter text-xs text-stone-500">
              <li>
                <a
                  href="https://wa.me/55"
                  className="transition-colors hover:text-amber-400"
                  aria-label="Falar no WhatsApp"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href="mailto:contato@litoralhaus.com.br"
                  className="transition-colors hover:text-amber-400"
                >
                  contato@litoralhaus.com.br
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/litoralhaus"
                  className="transition-colors hover:text-amber-400"
                  aria-label="Instagram Litoral Haus"
                >
                  @litoralhaus
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-stone-800 pt-8 sm:flex-row">
          <p className="font-inter text-xs text-stone-600">
            © {year} Litoral Haus. Todos os direitos reservados.
          </p>
          <p className="font-inter text-xs text-stone-600">
            CRECI 267769-F · Corretor responsável: Gabriel Alberto
          </p>
          <div className="flex gap-6 font-inter text-xs text-stone-600">
            <a href="/privacidade" className="hover:text-stone-400">
              Privacidade
            </a>
            <a href="/termos" className="hover:text-stone-400">
              Termos
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
