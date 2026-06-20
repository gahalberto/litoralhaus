import Link from "next/link";

const WA_HREF = "https://wa.me/5513955422935";
const EMAIL   = "contato@litoralhaus.com.br";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer aria-label="Rodapé Litoral Haus" className="border-t border-gray-200 bg-white">
      {/* ── Corpo principal ──────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-12 sm:grid-cols-[1.5fr_1fr_1fr_1fr]">

          {/* Marca */}
          <div>
            <p className="font-cormorant text-2xl font-semibold tracking-wide text-gray-900">
              Litoral Haus
            </p>
            <p className="mt-1 font-inter text-xs text-gray-400">CRECI-SP 267769-F</p>
            <p className="mt-4 max-w-56 font-inter text-sm leading-relaxed text-gray-500">
              Curadoria de imóveis de médio e alto padrão no litoral de São Paulo.
            </p>
          </div>

          {/* Sobre nós */}
          <div>
            <p className="mb-4 font-inter text-sm font-semibold text-gray-900">Sobre nós</p>
            <ul className="space-y-3">
              {[
                { label: "Quem somos",   href: "/contato"         },
                { label: "Imóveis",      href: "/imoveis"         },
                { label: "Blog",         href: "/blog"            },
                { label: "Fale conosco", href: "/contato"         },
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="font-inter text-sm text-gray-500 transition-colors hover:text-gray-900"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <p className="mb-4 font-inter text-sm font-semibold text-gray-900">Contato</p>
            <ul className="space-y-3">
              <li>
                <a
                  href={`mailto:${EMAIL}`}
                  className="flex items-center gap-2 font-inter text-sm text-gray-500 transition-colors hover:text-gray-900"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-amber-500">
                    <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                  {EMAIL}
                </a>
              </li>
              <li>
                <a
                  href={WA_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 font-inter text-sm text-gray-500 transition-colors hover:text-gray-900"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.75 w-3.75 shrink-0 text-amber-500">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  (13) 95542-2935
                </a>
              </li>
            </ul>
          </div>

          {/* Siga-nos */}
          <div>
            <p className="mb-4 font-inter text-sm font-semibold text-gray-900">Siga-nos</p>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://instagram.com/litoralhaus"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 font-inter text-sm text-gray-500 transition-colors hover:text-gray-900"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.75 w-3.75 shrink-0 text-amber-500">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href={WA_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 font-inter text-sm text-gray-500 transition-colors hover:text-gray-900"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.75 w-3.75 shrink-0 text-amber-500">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* ── Barra inferior ───────────────────────────────────────────────── */}
      <div className="border-t border-gray-200">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-5 sm:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link href="/privacidade" className="font-inter text-xs text-gray-400 transition-colors hover:text-gray-700">
              Política de privacidade
            </Link>
            <Link href="/termos" className="font-inter text-xs text-gray-400 transition-colors hover:text-gray-700">
              Termos e condições de uso
            </Link>
          </div>
          <p className="font-inter text-xs text-gray-400">
            © {year} Litoral Haus. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
