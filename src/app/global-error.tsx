"use client";

import { useEffect } from "react";

// Captura erros que o error.tsx não alcança (ex: no próprio layout raiz)
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (error.message?.includes("Failed to find Server Action")) {
      window.location.reload();
    }
  }, [error]);

  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, background: "#0a0a0a", color: "#fafafa", fontFamily: "sans-serif", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: "1rem", textAlign: "center", padding: "1.5rem" }}>
        <p style={{ fontSize: "1.5rem", fontWeight: 300 }}>Erro inesperado</p>
        <p style={{ fontSize: "0.875rem", color: "#aaa" }}>{error.message}</p>
        <button
          onClick={reset}
          style={{ border: "1px solid #555", padding: "0.5rem 1.5rem", background: "none", color: "#fafafa", cursor: "pointer", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase" }}
        >
          Recarregar
        </button>
      </body>
    </html>
  );
}
