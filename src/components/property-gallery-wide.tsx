"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

function cloudinaryOpt(url: string, w = 1400) {
  if (!url.includes("res.cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/c_fill,f_auto,q_auto,w_${w}/`);
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({
  images,
  title,
  initialIndex,
  onClose,
}: {
  images: string[];
  title: string;
  initialIndex: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(initialIndex);

  const prev = useCallback(() => setCurrent((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setCurrent((i) => (i + 1) % images.length), [images.length]);

  // Teclado: ← → Esc
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape")     onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, onClose]);

  // Travar scroll do body
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-9999 flex flex-col bg-black/95 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Header */}
      <div
        className="flex shrink-0 items-center justify-between px-5 py-4"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-inter text-sm text-white/60">
          <span className="font-semibold text-white">{current + 1}</span>
          <span className="mx-1">/</span>
          {images.length} fotos
        </p>
        <p className="hidden max-w-sm truncate font-inter text-xs text-white/40 sm:block">{title}</p>
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          aria-label="Fechar galeria"
        >
          <X size={18} />
        </button>
      </div>

      {/* Imagem principal */}
      <div
        className="relative min-h-0 flex-1"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          key={current}
          src={cloudinaryOpt(images[current], 1800)}
          alt={`${title} — foto ${current + 1}`}
          fill
          sizes="100vw"
          className="object-contain"
          priority
        />

        {/* Seta esquerda */}
        {images.length > 1 && (
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/80 hover:scale-105 sm:left-6"
            aria-label="Foto anterior"
          >
            <ChevronLeft size={22} />
          </button>
        )}

        {/* Seta direita */}
        {images.length > 1 && (
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/80 hover:scale-105 sm:right-6"
            aria-label="Próxima foto"
          >
            <ChevronRight size={22} />
          </button>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div
          className="shrink-0 overflow-x-auto px-5 py-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex gap-2">
            {images.map((src, i) => (
              <button
                key={src}
                onClick={() => setCurrent(i)}
                className={`relative h-14 w-20 shrink-0 overflow-hidden rounded transition-all sm:h-16 sm:w-24 ${
                  i === current
                    ? "ring-2 ring-amber-400 ring-offset-1 ring-offset-black opacity-100"
                    : "opacity-40 hover:opacity-70"
                }`}
              >
                <Image
                  src={cloudinaryOpt(src, 200)}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}

// ─── Galeria hero (wide) ──────────────────────────────────────────────────────

export function PropertyGalleryWide({ images, title }: { images: string[]; title: string }) {
  const [active, setActive]       = useState(0);
  const [lightboxOpen, setLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  function openLightbox(index: number) {
    setLightboxIndex(index);
    setLightbox(true);
  }

  if (images.length === 0) {
    return (
      <div className="flex w-full items-center justify-center bg-zinc-800" style={{ aspectRatio: "21/9" }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-zinc-600">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>
    );
  }

  return (
    <>
      <div
        className="group relative w-full cursor-zoom-in overflow-hidden bg-zinc-900"
        style={{ aspectRatio: "21/9" }}
        onClick={() => openLightbox(active)}
      >
        <Image
          key={images[active]}
          src={cloudinaryOpt(images[active])}
          alt={`${title} — foto ${active + 1}`}
          fill
          priority
          sizes="100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />

        {/* Hint "abrir galeria" */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 backdrop-blur-sm">
            <ZoomIn size={16} className="text-white" />
            <span className="font-inter text-sm text-white">Ver galeria</span>
          </div>
        </div>

        {/* Gradientes laterais */}
        {images.length > 1 && (
          <>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-linear-to-r from-black/30 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-linear-to-l from-black/30 to-transparent" />

            {/* Seta esquerda */}
            <button
              onClick={(e) => { e.stopPropagation(); setActive((a) => (a - 1 + images.length) % images.length); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900/80 text-white shadow-xl backdrop-blur-sm transition hover:scale-105 hover:bg-zinc-900"
              aria-label="Foto anterior"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Seta direita */}
            <button
              onClick={(e) => { e.stopPropagation(); setActive((a) => (a + 1) % images.length); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900/80 text-white shadow-xl backdrop-blur-sm transition hover:scale-105 hover:bg-zinc-900"
              aria-label="Próxima foto"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Contador + botão galeria */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); openLightbox(active); }}
            className="flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 font-inter text-xs text-white backdrop-blur-sm transition hover:bg-black/80"
          >
            <ZoomIn size={12} />
            {images.length > 1 ? `${active + 1} / ${images.length} fotos` : "Ver foto"}
          </button>
        </div>

        {/* Dots */}
        {images.length > 1 && images.length <= 10 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setActive(i); }}
                className={`h-1.5 rounded-full transition-all ${i === active ? "w-5 bg-white" : "w-1.5 bg-white/40"}`}
                aria-label={`Foto ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          images={images}
          title={title}
          initialIndex={lightboxIndex}
          onClose={() => setLightbox(false)}
        />
      )}
    </>
  );
}
