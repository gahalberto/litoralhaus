"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SellerLeadModal } from "@/components/seller-lead-modal";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-stone-800/80 bg-stone-950/90 backdrop-blur-md"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3">
            <span className="font-cormorant text-xl font-light tracking-wider text-stone-50">
              Litoral Haus
            </span>
            <span className="hidden rounded bg-amber-400/10 px-1.5 py-0.5 font-inter text-[9px] font-medium uppercase tracking-widest text-amber-400 sm:inline">
              Litoral SP
            </span>
          </a>

          {/* Nav links + CTA */}
          <div className="flex items-center gap-6">
            <Link
              href="/imoveis"
              className="hidden font-inter text-xs uppercase tracking-widest text-stone-400 transition-colors hover:text-stone-100 sm:block"
            >
              Imóveis
            </Link>
            <button
              onClick={() => setModalOpen(true)}
              className="rounded-none border border-stone-600 px-5 py-2 font-inter text-xs font-medium uppercase tracking-widest text-stone-300 transition-all duration-200 hover:border-amber-400 hover:text-amber-400"
            >
              Anuncie seu Imóvel
            </button>
          </div>
        </div>
      </header>

      <SellerLeadModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
