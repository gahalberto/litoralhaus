"use client";

import { useState } from "react";
import Image from "next/image";

function cloudinaryOpt(url: string, w = 1400) {
  if (!url.includes("res.cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/c_fill,f_auto,q_auto,w_${w}/`);
}

export function PropertyGalleryWide({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);

  const placeholder = (
    <div className="flex h-full w-full items-center justify-center bg-zinc-800">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-zinc-600">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1" />
      </svg>
    </div>
  );

  return (
    <div className="relative w-full overflow-hidden bg-zinc-900" style={{ aspectRatio: "21/9" }}>
      {images.length > 0 ? (
        <Image
          key={images[active]}
          src={cloudinaryOpt(images[active])}
          alt={`${title} — foto ${active + 1}`}
          fill
          priority
          sizes="100vw"
          className="object-cover transition-opacity duration-300"
        />
      ) : placeholder}

      {/* Gradient lateral para os botões */}
      {images.length > 1 && (
        <>
          <div className="absolute inset-y-0 left-0 w-24 bg-linear-to-r from-black/30 to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 bg-linear-to-l from-black/30 to-transparent pointer-events-none" />

          <button
            onClick={() => setActive((a) => (a - 1 + images.length) % images.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900/80 text-white shadow-xl backdrop-blur-sm transition hover:bg-zinc-900 hover:scale-105"
            aria-label="Foto anterior"
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button
            onClick={() => setActive((a) => (a + 1) % images.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900/80 text-white shadow-xl backdrop-blur-sm transition hover:bg-zinc-900 hover:scale-105"
            aria-label="Próxima foto"
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      )}

      {/* Contador */}
      {images.length > 1 && (
        <span className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1 font-inter text-xs text-white backdrop-blur-sm">
          {active + 1} / {images.length}
        </span>
      )}

      {/* Dots */}
      {images.length > 1 && images.length <= 10 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-1.5 rounded-full transition-all ${i === active ? "w-5 bg-white" : "w-1.5 bg-white/40"}`}
              aria-label={`Foto ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
