"use client";

import { useRef, useState } from "react";
import { getUploadSignature } from "@/actions/cloudinary";
import { cn } from "@/lib/utils";
import { Loader2, X, Upload } from "lucide-react";

interface CoverImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
}

function cloudinaryThumb(url: string, w = 800): string {
  if (!url.includes("res.cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/c_fill,f_auto,q_auto,w_${w}/`);
}

export function CoverImageUploader({ value, onChange }: CoverImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver]   = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const sig = await getUploadSignature("litoralhaus/blog");
      const body = new FormData();
      body.append("file",      file);
      body.append("signature", sig.signature);
      body.append("timestamp", String(sig.timestamp));
      body.append("api_key",   sig.apiKey);
      body.append("folder",    sig.folder);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
        { method: "POST", body }
      );
      if (!res.ok) throw new Error(`Upload falhou: ${res.statusText}`);
      const data = await res.json();
      onChange(data.secure_url as string);
    } catch (err) {
      console.error("Cloudinary upload error:", err);
    } finally {
      setUploading(false);
    }
  }

  function handleFiles(files: FileList | null) {
    if (files?.[0]) uploadFile(files[0]);
  }

  if (value) {
    return (
      <div className="relative overflow-hidden rounded-lg border border-border bg-muted" style={{ aspectRatio: "16/9" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cloudinaryThumb(value)}
          alt="Capa do artigo"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/50 opacity-0 transition-opacity hover:opacity-100">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 font-inter text-xs text-white backdrop-blur-sm transition hover:bg-white/30"
          >
            <Upload size={13} />
            Trocar imagem
          </button>
          <button
            type="button"
            onClick={() => onChange("")}
            className="flex items-center gap-1.5 rounded-lg bg-red-500/80 px-3 py-1.5 font-inter text-xs text-white transition hover:bg-red-500"
          >
            <X size={13} />
            Remover
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <span className="absolute left-2 top-2 rounded bg-amber-400 px-1.5 py-0.5 font-inter text-[9px] font-bold uppercase tracking-wider text-black">
          Capa
        </span>
      </div>
    );
  }

  return (
    <div
      onClick={() => !uploading && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 transition-colors",
        "aspect-video",
        dragOver
          ? "border-amber-400 bg-amber-400/5"
          : "border-border hover:border-amber-400/50 hover:bg-muted/30"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {uploading ? (
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 size={24} className="animate-spin text-amber-500" />
          <span className="font-inter text-xs">Enviando para Cloudinary...</span>
        </div>
      ) : (
        <>
          <Upload size={24} className="text-muted-foreground/40" />
          <p className="font-inter text-sm text-muted-foreground">
            Arraste ou <span className="text-amber-600 dark:text-amber-400">clique para selecionar</span>
          </p>
          <p className="font-inter text-[11px] text-muted-foreground/50">
            JPG, PNG, WEBP — proporção 16:9 recomendada (1200×630 px)
          </p>
        </>
      )}
    </div>
  );
}
