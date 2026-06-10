"use client";

import { useState } from "react";
import Image from "next/image";

/** Injeta transformações automáticas do Cloudinary na URL.
 *  Ex: .../upload/v123/file.jpg  →  .../upload/c_fill,f_auto,q_auto,w_1200/v123/file.jpg
 */
function cloudinaryOptimized(url: string, width = 1200): string {
  if (!url.includes("res.cloudinary.com")) return url;
  return url.replace(
    "/upload/",
    `/upload/c_fill,f_auto,q_auto,w_${width}/`
  );
}

export function PropertyGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);

  if (!images.length) {
    return (
      <div className="flex h-72 items-center justify-center bg-stone-100 dark:bg-stone-900">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-stone-400">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Imagem principal */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-stone-100 dark:bg-stone-900">
        <Image
          src={cloudinaryOptimized(images[active], 1200)}
          alt={`${title} — foto ${active + 1}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 60vw"
          className="object-cover"
        />

        {/* Contador */}
        <span className="absolute bottom-3 right-3 bg-black/50 px-2 py-1 font-inter text-[10px] text-white backdrop-blur-sm">
          {active + 1} / {images.length}
        </span>

        {/* Setas */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setActive((a) => (a - 1 + images.length) % images.length)}
              aria-label="Foto anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/80"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => setActive((a) => (a + 1) % images.length)}
              aria-label="Próxima foto"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/80"
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
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setActive(i)}
              className={`relative h-16 w-24 shrink-0 overflow-hidden transition-all ${
                i === active
                  ? "ring-2 ring-amber-400 ring-offset-1"
                  : "opacity-55 hover:opacity-90"
              }`}
            >
              <Image
                src={cloudinaryOptimized(src, 200)}
                alt=""
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
