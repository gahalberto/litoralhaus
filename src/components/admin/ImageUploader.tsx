"use client";

import { useCallback, useRef, useState } from "react";
import { getUploadSignature } from "@/actions/cloudinary";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
}

function cloudinaryThumb(url: string, w = 400): string {
  if (!url.includes("res.cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/c_fill,f_auto,q_auto,w_${w}/`);
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
    uploadFiles(Array.from(files).filter((f) => f.type.startsWith("image/")));
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [value]
  );

  function removeImage(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function setCover(index: number) {
    if (index === 0) return;
    const next = [...value];
    const [picked] = next.splice(index, 1);
    next.unshift(picked);
    onChange(next);
  }

  function moveLeft(index: number) {
    if (index === 0) return;
    const next = [...value];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  }

  function moveRight(index: number) {
    if (index === value.length - 1) return;
    const next = [...value];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next);
  }

  const cover = value[0];

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-6 py-8 transition-colors",
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

      {value.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_220px]">

          {/* Grade de miniaturas */}
          <div className="space-y-2">
            <p className="font-inter text-[10px] uppercase tracking-widest text-muted-foreground">
              {value.length} {value.length === 1 ? "foto" : "fotos"} — arraste para reordenar
            </p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {value.map((url, i) => (
                <div
                  key={url}
                  className={cn(
                    "group relative overflow-hidden rounded-md border-2 bg-muted transition-colors",
                    i === 0 ? "border-amber-400" : "border-border hover:border-border/60"
                  )}
                  style={{ aspectRatio: "4/3" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cloudinaryThumb(url, 300)}
                    alt=""
                    className="h-full w-full object-cover"
                  />

                  {/* Badge capa */}
                  {i === 0 && (
                    <span className="absolute left-1.5 top-1.5 rounded bg-amber-400 px-1.5 py-0.5 font-inter text-[9px] font-bold uppercase tracking-wider text-black shadow">
                      Capa
                    </span>
                  )}

                  {/* Número da foto */}
                  {i > 0 && (
                    <span className="absolute left-1.5 top-1.5 rounded bg-black/50 px-1.5 py-0.5 font-inter text-[9px] text-white">
                      {i + 1}
                    </span>
                  )}

                  {/* Overlay de ações */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                    {i !== 0 && (
                      <button
                        type="button"
                        onClick={() => setCover(i)}
                        className="w-[90%] rounded bg-amber-400 px-2 py-1 font-inter text-[10px] font-bold text-black transition hover:bg-amber-300"
                      >
                        ★ Definir capa
                      </button>
                    )}
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => moveLeft(i)}
                        disabled={i === 0}
                        title="Mover para esquerda"
                        className="rounded bg-white/20 px-2 py-1 font-inter text-[10px] text-white transition hover:bg-white/40 disabled:opacity-30"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={() => moveRight(i)}
                        disabled={i === value.length - 1}
                        title="Mover para direita"
                        className="rounded bg-white/20 px-2 py-1 font-inter text-[10px] text-white transition hover:bg-white/40 disabled:opacity-30"
                      >
                        →
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="w-[90%] rounded bg-red-500/80 px-2 py-1 font-inter text-[10px] text-white transition hover:bg-red-500"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preview da capa */}
          <div className="space-y-2">
            <p className="font-inter text-[10px] uppercase tracking-widest text-muted-foreground">
              Preview do card
            </p>
            <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
              {/* Imagem no aspect 4:3 */}
              <div className="relative overflow-hidden bg-muted" style={{ aspectRatio: "4/3" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cloudinaryThumb(cover, 440)}
                  alt="Preview capa"
                  className="h-full w-full object-cover"
                />
                <span className="absolute left-2 top-2 rounded bg-amber-400 px-1.5 py-0.5 font-inter text-[9px] font-bold uppercase tracking-wider text-black">
                  Capa
                </span>
                {value.length > 1 && (
                  <span className="absolute bottom-2 right-2 rounded bg-black/55 px-1.5 py-0.5 font-inter text-[9px] text-white">
                    +{value.length - 1} foto{value.length - 1 > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              {/* Rodapé simulado do card */}
              <div className="p-3">
                <div className="mb-1 h-2.5 w-3/4 rounded bg-muted-foreground/20" />
                <div className="mb-2 h-2 w-1/2 rounded bg-muted-foreground/10" />
                <div className="flex gap-3 border-t border-border pt-2">
                  <div className="h-2 w-8 rounded bg-muted-foreground/10" />
                  <div className="h-2 w-8 rounded bg-muted-foreground/10" />
                  <div className="h-2 w-10 rounded bg-muted-foreground/10" />
                </div>
              </div>
            </div>
            <p className="font-inter text-[10px] text-muted-foreground/60">
              Passe o mouse nas fotos e clique em "Definir capa"
            </p>
          </div>

        </div>
      )}
    </div>
  );
}
