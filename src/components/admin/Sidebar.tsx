"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/actions/auth";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import type { SessionPayload } from "@/lib/auth";

type NavItem = {
  label: string;
  href:  string;
  adminOnly?: boolean;
  icon:  React.ReactNode;
};

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href:  "/admin",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" />
        <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" />
        <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" />
        <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    label: "Kanban de Vendas",
    href:  "/admin/leads",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <rect x="1" y="2" width="4" height="12" rx="1" stroke="currentColor" strokeWidth="1.2" />
        <rect x="6" y="2" width="4" height="8"  rx="1" stroke="currentColor" strokeWidth="1.2" />
        <rect x="11" y="2" width="4" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    label: "Imóveis",
    href:  "/admin/properties",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path d="M1 7L8 1.5L15 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M2.5 6.5V13.5C2.5 14.05 2.95 14.5 3.5 14.5H6V10.5H10V14.5H12.5C13.05 14.5 13.5 14.05 13.5 13.5V6.5"
          stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label:     "Usuários",
    href:      "/admin/users",
    adminOnly: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <circle cx="6" cy="5" r="3" stroke="currentColor" strokeWidth="1.2" />
        <path d="M1 13c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M12 7v4M10 9h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
];

const ROLE_LABEL: Record<string, string> = {
  ADMIN:    "Administrador",
  CORRETOR: "Corretor",
};

export function Sidebar({ session }: { session: SessionPayload }) {
  const pathname = usePathname();

  const initials = session.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || session.role === "ADMIN"
  );

  return (
    <aside className="flex h-full w-56 flex-col border-r border-border bg-background">
      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center border-b border-border px-5">
        <span className="font-cormorant text-lg font-light tracking-wider text-foreground">
          Litoral Haus
        </span>
        <span className="ml-2 rounded bg-amber-400/10 px-1.5 py-0.5 font-inter text-[9px] font-medium uppercase tracking-widest text-amber-600 dark:text-amber-400">
          CRM
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3" aria-label="Navegação do admin">
        <ul className="space-y-0.5">
          {visibleItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded px-3 py-2 font-inter text-sm transition-colors duration-150",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <span className={cn(
                    "shrink-0 transition-colors",
                    isActive ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground/60"
                  )}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-border p-3 space-y-1">
        {/* Theme toggle */}
        <div className="px-1 pb-1">
          <ModeToggle variant="segmented" className="w-full" />
        </div>

        {/* Usuário logado */}
        <div className="flex items-center gap-3 rounded px-3 py-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted font-inter text-[10px] font-semibold text-foreground">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-inter text-xs font-medium text-foreground">
              {session.name.split(" ")[0]}
            </p>
            <p className="font-inter text-[10px] text-muted-foreground">
              {ROLE_LABEL[session.role]}
            </p>
          </div>
        </div>

        {/* Logout */}
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded px-3 py-2 font-inter text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M6 2H3C2.45 2 2 2.45 2 3V13C2 13.55 2.45 14 3 14H6"
                stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M10.5 5L14 8L10.5 11" stroke="currentColor" strokeWidth="1.2"
                strokeLinecap="round" strokeLinejoin="round" />
              <path d="M14 8H6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
