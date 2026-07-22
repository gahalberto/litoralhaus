"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "morar",    label: "Morar" },
  { id: "custo",    label: "Custo & Valores" },
  { id: "imoveis",  label: "Imóveis mais desejados" },
  { id: "proximos", label: "Bairros próximos" },
];

export function BairroNav() {
  const [active, setActive] = useState(SECTIONS[0].id);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const targets = SECTIONS
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => !!el);

    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-140px 0px -60% 0px", threshold: 0 }
    );

    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  function handleClick(e: React.MouseEvent, id: string) {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const navHeight = navRef.current?.offsetHeight ?? 0;
    const y = el.getBoundingClientRect().top + window.scrollY - navHeight - 72;
    window.scrollTo({ top: y, behavior: "smooth" });
    setActive(id);
  }

  return (
    <div
      ref={navRef}
      className="sticky top-16 z-30 border-b border-border bg-background/95 backdrop-blur-md"
    >
      <nav className="mx-auto flex max-w-5xl gap-6 overflow-x-auto px-6 font-inter text-sm">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            onClick={(e) => handleClick(e, s.id)}
            className={cn(
              "shrink-0 whitespace-nowrap border-b-2 py-4 transition-colors",
              active === s.id
                ? "border-amber-500 font-semibold text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {s.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
