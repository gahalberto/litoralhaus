"use client";

import { useEffect } from "react";

export function ViewTracker({ type, slug }: { type: "blog" | "property"; slug: string }) {
  useEffect(() => {
    fetch("/api/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, slug }),
    }).catch(() => {});
    // Dispara uma vez por montagem — sem dependências que re-disparem
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
