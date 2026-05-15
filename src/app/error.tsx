"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isStaleAction =
    error.message?.includes("Failed to find Server Action") ||
    error.digest?.includes("NEXT_NOT_FOUND");

  // Stale client após novo deploy — recarrega automaticamente uma vez
  useEffect(() => {
    if (isStaleAction) {
      window.location.reload();
    }
  }, [isStaleAction]);

  if (isStaleAction) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <p className="font-cormorant text-2xl font-light text-foreground">
          Nova versão disponível
        </p>
        <p className="font-inter text-sm text-muted-foreground">
          Atualizando a página...
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <p className="font-cormorant text-3xl font-light text-foreground">
        Algo deu errado
      </p>
      <p className="font-inter text-sm text-muted-foreground">
        {error.message ?? "Erro inesperado."}
      </p>
      <button
        onClick={reset}
        className="border border-border px-6 py-2.5 font-inter text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
      >
        Tentar novamente
      </button>
    </div>
  );
}
