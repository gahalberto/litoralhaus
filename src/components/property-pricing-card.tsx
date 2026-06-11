"use client";

import { PROPERTY_TYPE_LABELS } from "@/lib/property-config";
import type { PropertyType } from "@prisma/client";

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

interface Props {
  type:        PropertyType;
  priceAsk:    string | null;
  priceRent:   string | null;
  city:        string;
  neighborhood: string;
  whatsappHref: string;
}

function formatBRL(value: string | number | null) {
  if (!value) return null;
  const num = Number(value);
  if (isNaN(num)) return null;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency", currency: "BRL",
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(num);
}

export function PropertyPricingCard({ type, priceAsk, priceRent, city, neighborhood, whatsappHref }: Props) {
  const price    = priceAsk ?? priceRent;
  const priceNum = price ? Number(price) : null;

  // Preço "de" simulado (+30% se não tiver outro dado)
  const originalPrice = priceNum ? Math.round(priceNum * 1.3) : null;

  return (
    <div className="relative">

      {/* ── Tooltip flutuante ─────────────────────────────────────────── */}
      <div className="relative z-10 mx-3 -mb-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Dot verde piscando */}
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
            </span>
            <span className="font-inter text-xs font-semibold text-green-600">Especialista online</span>
          </div>
          <span className="text-sm">🔥</span>
        </div>
        <p className="mt-1 font-inter text-[11px] leading-relaxed text-gray-500">
          Atendimento imediato para {neighborhood}, {city}.{" "}
          <span className="font-semibold text-gray-700">Últimas unidades disponíveis.</span>
        </p>
      </div>

      {/* ── Card escuro ───────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-zinc-950 p-6 pt-8 text-white shadow-2xl">

        {/* Brilho sutil no topo */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-amber-400/40 to-transparent" />

        {/* Tag tipo */}
        <span className="mb-5 inline-block rounded-full border border-white/20 px-3 py-0.5 font-inter text-[11px] uppercase tracking-widest text-white/60">
          {PROPERTY_TYPE_LABELS[type]}
        </span>

        {/* Preço riscado */}
        {originalPrice && (
          <p className="font-inter text-sm text-white/40 line-through">
            De {formatBRL(originalPrice)} por
          </p>
        )}

        {/* Preço real */}
        {price ? (
          <p className="font-inter text-3xl font-black tracking-tight text-amber-400">
            {formatBRL(price)}
            {!priceAsk && priceRent && (
              <span className="ml-1 text-base font-normal text-white/50">/mês</span>
            )}
          </p>
        ) : (
          <p className="font-inter text-xl font-semibold text-white/50">Consulte o preço</p>
        )}

        {/* Label preço */}
        <p className="mt-1 font-inter text-[11px] text-white/40">
          Preço da Litoral Haus
        </p>

        {/* Divisor */}
        <div className="my-5 h-px bg-white/10" />

        {/* Botão WhatsApp */}
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#25D366] py-4 font-inter text-sm font-bold text-white shadow-lg shadow-green-900/30 transition hover:bg-[#20b958] hover:shadow-green-900/50"
        >
          <WhatsAppIcon />
          Fale com especialista
        </a>

        {/* Ligação */}
        <button className="mt-3 w-full rounded-xl border border-white/15 py-3 font-inter text-sm text-white/60 transition hover:border-white/30 hover:text-white">
          Solicitar visita
        </button>

        {/* Segurança */}
        <p className="mt-4 text-center font-inter text-[10px] text-white/25">
          🔒 Seus dados estão protegidos
        </p>
      </div>
    </div>
  );
}
