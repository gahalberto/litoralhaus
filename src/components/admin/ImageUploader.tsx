"use client";

import { useCallback, useRef, useState } from "react";
import { getUploadSignature } from "@/actions/cloudinary";
import { cn } from "@/lib/utils";

type UploadedImage = { url: string; publicId: string };

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
}

export function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver]   = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFiles(files: File[]) {
    if (!files.length) return;
    setUploading(true);
    try {
      const sig = await getUploadSignature();
      const uploaded: string[] = [];

      for (const file of files) {
        const body = new FormData();
        body.append("file", file);
        body.append("signature",  sig.signature);
        body.append("timestamp",  String(sig.timestamp));
        body.append("api_key",    sig.apiKey);
        body.append("folder",     "litoralhaus/properties");

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
          { method: "POST", body }
        );

        if (!res.ok) throw new Error(`Upload falhou: ${res.statusText}`);
        const data = await res.json();
        uploaded.push(data.secure_url as string);
      }

      onChange([...value, ...uploaded]);
    } catch (err) {
      console.error("Cloudinary upload error:", err);
    } finally {
      setUploading(false);
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const images = Array.from(files).filter((f) => f.type.startsWith("image/"));
    uploadFiles(images);
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [value]
  );

  function removeImage(url: string) {
    onChange(value.filter((u) => u !== url));
  }

  function moveUp(index: number) {
    if (index === 0) return;
    const next = [...value];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  }

  function moveDown(index: number) {
    if (index === value.length - 1) return;
    const next = [...value];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-6 py-10 transition-colors",
          dragOver
            ? "border-amber-400 bg-amber-400/5"
            : "border-border hover:border-amber-400/50 hover:bg-muted/30"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
            </svg>
            <span className="font-inter text-xs">Enviando...</span>
          </div>
        ) : (
          <>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-muted-foreground/40">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="font-inter text-xs text-muted-foreground">
              Arraste fotos ou <span className="text-amber-600 dark:text-amber-400">clique para selecionar</span>
            </p>
            <p className="font-inter text-[10px] text-muted-foreground/50">JPG, PNG, WEBP — múltiplos arquivos</p>
          </>
        )}
      </div>

      {/* Preview grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {value.map((url, i) => (
            <div key={url} className="group relative aspect-square overflow-hidden rounded-md border border-border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />

              {/* Capa badge */}
              {i === 0 && (
                <span className="absolute left-1 top-1 rounded bg-amber-400 px-1.5 py-0.5 font-inter text-[9px] font-medium uppercase tracking-wider text-stone-950">
                  Capa
                </span>
              )}

              {/* Overlay controls */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveUp(i)}
                    disabled={i === 0}
                    className="rounded bg-white/20 p-1 text-white transition hover:bg-white/40 disabled:opacity-30"
                    title="Mover para esquerda"
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                      <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(i)}
                    disabled={i === value.length - 1}
                    className="rounded bg-white/20 p-1 text-white transition hover:bg-white/40 disabled:opacity-30"
                    title="Mover para direita"
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="rounded bg-red-500/80 px-2 py-0.5 font-inter text-[10px] text-white transition hover:bg-red-500"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
