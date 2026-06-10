"use client";

import { useState } from "react";
import Image from "next/image";

export function PropertyGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);

  if (!images.length) {
    return (
      <div className="flex aspect-[16/9] items-center justify-center bg-stone-900">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-stone-700">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Imagem principal */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-stone-900">
        <Image
          src={images[active]}
          alt={`${title} — foto ${active + 1}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 60vw"
          className="object-cover"
        />
        {/* Contador */}
        <span className="absolute bottom-3 right-3 rounded-none bg-stone-950/70 px-2 py-1 font-inter text-[10px] text-stone-400 backdrop-blur-sm">
          {active + 1} / {images.length}
        </span>
        {/* Setas */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setActive((a) => (a - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-none bg-stone-950/60 p-2 text-stone-300 backdrop-blur-sm transition hover:bg-stone-950/90 hover:text-white"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => setActive((a) => (a + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-none bg-stone-950/60 p-2 text-stone-300 backdrop-blur-sm transition hover:bg-stone-950/90 hover:text-white"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setActive(i)}
              className={`relative h-16 w-24 shrink-0 overflow-hidden border-2 transition-all ${
                i === active ? "border-amber-400" : "border-transparent opacity-50 hover:opacity-80"
              }`}
            >
              <Image src={src} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
