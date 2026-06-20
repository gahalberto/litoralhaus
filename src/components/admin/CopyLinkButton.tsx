"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyLinkButtonProps {
  url: string;
  className?: string;
}

export function CopyLinkButton({ url, className }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      title={copied ? "Copiado!" : "Copiar link"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded border px-3 py-1.5 font-inter text-xs transition-colors",
        copied
          ? "border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400"
          : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
        className
      )}
    >
      {copied ? <Check size={12} /> : <Link2 size={12} />}
      {copied ? "Copiado!" : "Copiar link"}
    </button>
  );
}
