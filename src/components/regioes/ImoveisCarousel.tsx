"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import type { BairroCarouselProperty } from "@/lib/public-properties";
import { formatPrice } from "@/lib/property-config";
import { cn } from "@/lib/utils";

type Modo = "ALUGAR" | "COMPRAR";

function isNovo(createdAt: Date): boolean {
  const dias = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return dias <= 14;
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 font-inter text-[10px] font-bold uppercase tracking-wide text-stone-950 shadow-sm">
      <Sparkles size={10} />
      {children}
    </span>
  );
}

function Card({ p, modo }: { p: BairroCarouselProperty; modo: Modo }) {
  const cover = p.images[0];
  const specs = [
    p.areaTotal ? `${Number(p.areaTotal).toLocaleString("pt-BR")} m²` : null,
    p.bedrooms != null ? `${p.bedrooms} ${p.bedrooms === 1 ? "quarto" : "quartos"}` : null,
    p.parkingSpots != null ? `${p.parkingSpots} ${p.parkingSpots === 1 ? "vaga" : "vagas"}` : null,
  ].filter(Boolean).join(" · ");

  const precoPrincipal = modo === "ALUGAR" ? p.priceRent : p.priceAsk;
  const total = modo === "ALUGAR" && p.priceRent && p.condoFee
    ? Number(p.priceRent) + Number(p.condoFee)
    : null;

  return (
    <Link
      href={`/imoveis/${p.slug}`}
      className="group flex w-72 shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-amber-400/50 sm:w-80"
    >
      <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
        {cover ? (
          <Image
            src={cover}
            alt={p.title}
            fill
            sizes="320px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground/30">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </div>
        )}
        {(p.exclusive || isNovo(p.createdAt)) && (
          <div className="absolute left-3 top-3">
            <Tag>{p.exclusive ? "Exclusivo" : "Anúncio novo"}</Tag>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        {precoPrincipal ? (
          <>
            <p className="font-cormorant text-2xl font-bold text-foreground">
              {formatPrice(precoPrincipal)}
              {modo === "ALUGAR" && <span className="font-inter text-xs font-normal text-muted-foreground">/mês</span>}
            </p>
            {total && (
              <p className="font-inter text-xs text-muted-foreground">
                Total c/ condomínio: {formatPrice(total)}
              </p>
            )}
          </>
        ) : (
          <p className="font-inter text-sm text-muted-foreground">Consulte o valor</p>
        )}

        {specs && (
          <p className="mt-2 font-inter text-xs text-muted-foreground">{specs}</p>
        )}
        <p className="mt-1 font-inter text-xs text-muted-foreground/70">
          {p.neighborhood}, {p.city}
        </p>
      </div>
    </Link>
  );
}

export function ImoveisCarousel({ properties }: { properties: BairroCarouselProperty[] }) {
  const temAlugar  = properties.some((p) => p.purposes.includes("LOCACAO") && p.priceRent);
  const temComprar = properties.some((p) => p.purposes.includes("VENDA") && p.priceAsk);
  const [modo, setModo] = useState<Modo>(temComprar ? "COMPRAR" : "ALUGAR");
  const scrollerRef = useRef<HTMLDivElement>(null);

  const filtrados = useMemo(
    () =>
      properties.filter((p) =>
        modo === "ALUGAR"
          ? p.purposes.includes("LOCACAO") && p.priceRent
          : p.purposes.includes("VENDA") && p.priceAsk
      ),
    [properties, modo]
  );

  function scroll(dir: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.9), behavior: "smooth" });
  }

  if (properties.length === 0) return null;

  return (
    <div>
      {temAlugar && temComprar && (
        <div className="mb-6 inline-flex rounded-full border border-border p-1">
          {(["COMPRAR", "ALUGAR"] as Modo[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setModo(m)}
              className={cn(
                "rounded-full px-4 py-1.5 font-inter text-xs font-medium transition-colors",
                modo === m
                  ? "bg-amber-400 text-stone-950"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {m === "COMPRAR" ? "Comprar" : "Alugar"}
            </button>
          ))}
        </div>
      )}

      {filtrados.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-16 text-center font-cormorant text-xl font-light text-muted-foreground">
          Nenhum imóvel para {modo === "ALUGAR" ? "alugar" : "comprar"} neste bairro no momento.
        </p>
      ) : (
        <div className="relative">
          <div
            ref={scrollerRef}
            className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {filtrados.map((p) => (
              <Card key={p.id} p={p} modo={modo} />
            ))}
          </div>

          {filtrados.length > 2 && (
            <>
              <button
                type="button"
                onClick={() => scroll(-1)}
                aria-label="Anterior"
                className="absolute -left-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background shadow-md transition hover:border-amber-400 sm:flex"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => scroll(1)}
                aria-label="Próximo"
                className="absolute -right-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background shadow-md transition hover:border-amber-400 sm:flex"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
