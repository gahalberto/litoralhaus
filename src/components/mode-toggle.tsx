"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light",  icon: Sun,     label: "Claro"   },
  { value: "dark",   icon: Moon,    label: "Escuro"  },
  { value: "system", icon: Monitor, label: "Sistema" },
] as const;

type Variant = "icon" | "segmented";

interface ModeToggleProps {
  variant?: Variant;
  className?: string;
}

/**
 * variant="icon"      → botão único que alterna light → dark → system
 * variant="segmented" → três botões lado a lado (padrão no admin)
 *
 * useMounted: adia qualquer comparação com `theme` para após hidratação,
 * eliminando o mismatch SSR ↔ cliente do next-themes.
 */
export function ModeToggle({ variant = "icon", className }: ModeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (variant === "segmented") {
    return (
      <div
        role="radiogroup"
        aria-label="Tema da interface"
        className={cn(
          "flex items-center rounded border border-border bg-muted/40 p-0.5",
          className
        )}
      >
        {OPTIONS.map(({ value, icon: Icon, label }) => {
          const isActive = mounted && theme === value;
          return (
            <button
              key={value}
              role="radio"
              aria-checked={isActive}
              aria-label={label}
              onClick={() => setTheme(value)}
              title={label}
              className={cn(
                "flex flex-1 items-center justify-center rounded-sm px-2.5 py-1.5 transition-colors duration-150",
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon size={13} strokeWidth={1.8} aria-hidden />
            </button>
          );
        })}
      </div>
    );
  }

  // variant="icon" — cicla entre os três modos
  function cycleTheme() {
    if (!mounted) return;
    const idx = OPTIONS.findIndex((o) => o.value === theme);
    const next = OPTIONS[(idx + 1) % OPTIONS.length];
    setTheme(next.value);
  }

  // Antes de montar renderiza um placeholder de mesma dimensão (sem flash de layout)
  if (!mounted) {
    return (
      <div
        aria-hidden
        className={cn(
          "flex h-7.75 w-7.75 items-center justify-center rounded",
          className
        )}
      />
    );
  }

  return (
    <button
      onClick={cycleTheme}
      aria-label="Alternar tema"
      title={`Tema atual: ${theme}`}
      className={cn(
        "relative flex items-center justify-center rounded p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
        className
      )}
    >
      <Sun
        size={15}
        strokeWidth={1.8}
        aria-hidden
        className="rotate-0 scale-100 transition-transform duration-300 dark:-rotate-90 dark:scale-0"
      />
      <Moon
        size={15}
        strokeWidth={1.8}
        aria-hidden
        className="absolute rotate-90 scale-0 transition-transform duration-300 dark:rotate-0 dark:scale-100"
      />
      <span className="sr-only">Alternar tema</span>
    </button>
  );
}
