"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, Bell, ChevronRight } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

const SEGMENT_LABELS: Record<string, string> = {
  admin:      "Dashboard",
  leads:      "Leads",
  properties: "Imóveis",
  owners:     "Proprietários",
  users:      "Usuários",
  new:        "Novo",
  edit:       "Editar",
  report:     "Relatório",
};

function useBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return segments.map((seg, i) => {
    const href  = "/" + segments.slice(0, i + 1).join("/");
    const label = SEGMENT_LABELS[seg] ?? (seg.length === 25 ? "Detalhe" : seg);
    const isLast = i === segments.length - 1;
    return { href, label, isLast };
  });
}

interface Props {
  onMenuClick:      () => void;
  sidebarCollapsed?: boolean;
  onSearchOpen:     () => void;
}

export function AdminHeader({ onMenuClick, sidebarCollapsed: _, onSearchOpen }: Props) {
  const crumbs = useBreadcrumbs();

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-4 sm:px-6">

      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu size={18} strokeWidth={1.8} />
      </button>

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
        {crumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-1 min-w-0">
            {i > 0 && (
              <ChevronRight size={12} className="shrink-0 text-zinc-300 dark:text-zinc-700" />
            )}
            {crumb.isLast ? (
              <span className="truncate font-inter text-xs font-medium text-zinc-900 dark:text-zinc-100">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="truncate font-inter text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      {/* Search trigger */}
      <button
        onClick={onSearchOpen}
        className="hidden sm:flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 w-56 xl:w-72 transition-colors hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
      >
        <Search size={13} strokeWidth={2} className="shrink-0 text-zinc-400" />
        <span className="flex-1 min-w-0 text-left font-inter text-xs text-zinc-400">
          Buscar imóvel, post, proprietário...
        </span>
        <kbd className="hidden xl:inline-flex shrink-0 items-center rounded border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.5 font-inter text-[9px] text-zinc-400 dark:text-zinc-600">
          ⌘K
        </kbd>
      </button>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Notifications */}
        <button
          className="relative flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Notificações"
        >
          <Bell size={16} strokeWidth={1.8} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 ring-2 ring-white dark:ring-zinc-950" />
        </button>

        {/* Theme toggle */}
        <ModeToggle variant="icon" />
      </div>
    </header>
  );
}
