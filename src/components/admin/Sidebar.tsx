"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  Building2,
  UserCheck,
  Users,
  ShieldCheck,
  LayoutList,
  LogOut,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  MessageSquare,
  BookOpen,
  CalendarClock,
  Map,
  MapPin,
} from "lucide-react";
import { logout } from "@/actions/auth";
import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";
import type { SessionPayload } from "@/lib/auth";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  soon?: boolean;
};

const NAV_MAIN: NavItem[] = [
  { label: "Dashboard",     href: "/admin",             icon: LayoutDashboard },
  { label: "Leads",         href: "/admin/leads",       icon: TrendingUp      },
  { label: "Agenda",        href: "/admin/agenda",      icon: CalendarClock   },
  { label: "Imóveis",       href: "/admin/properties",  icon: Building2       },
  { label: "Blog",          href: "/admin/blog",        icon: BookOpen        },
  { label: "Proprietários", href: "/admin/owners",      icon: UserCheck       },
  { label: "Mensagens",     href: "/admin/contacts",    icon: MessageSquare   },
  { label: "Equipe",        href: "/admin/team",        icon: Users, soon: true },
];

const NAV_SETTINGS: NavItem[] = [
  { label: "Tipos de Imóvel", href: "/admin/property-types", icon: LayoutList,  adminOnly: true },
  { label: "Cidades",         href: "/admin/cidades",        icon: Map,         adminOnly: true },
  { label: "Bairros",         href: "/admin/bairros",        icon: MapPin,      adminOnly: true },
  { label: "Usuários",        href: "/admin/users",          icon: ShieldCheck, adminOnly: true },
];

const ROLE_LABEL: Record<string, string> = {
  ADMIN:    "Admin · CEO",
  CORRETOR: "Corretor",
};

interface Props {
  session:          SessionPayload;
  mobileOpen:       boolean;
  collapsed:        boolean;
  onClose:          () => void;
  onToggleCollapse: () => void;
}

export function Sidebar({ session, mobileOpen, collapsed, onClose, onToggleCollapse }: Props) {
  const pathname = usePathname();

  const initials = session.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  function isActive(item: NavItem) {
    if (item.href === "/admin") return pathname === "/admin";
    return pathname.startsWith(item.href);
  }

  function handleNavClick(item: NavItem) {
    if (item.soon) return;
    onClose(); // fecha no mobile
  }

  const visibleMain     = NAV_MAIN.filter((i) => !i.adminOnly || session.role === "ADMIN");
  const visibleSettings = NAV_SETTINGS.filter((i) => !i.adminOnly || session.role === "ADMIN");

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col",
          "bg-white dark:bg-zinc-950",
          "border-r border-zinc-200 dark:border-zinc-800",
          "transition-all duration-300 ease-in-out",
          // desktop: always visible, width controlled by collapsed
          "lg:static lg:z-auto lg:translate-x-0",
          collapsed ? "lg:w-16" : "lg:w-64",
          // mobile: full width sidebar, controlled by mobileOpen
          "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center justify-between px-3 border-b border-zinc-100 dark:border-zinc-800">
          {!collapsed && (
            <Link href="/admin" className="flex items-center gap-2.5 flex-1 min-w-0" onClick={onClose}>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-400">
                <span className="font-cormorant text-sm font-bold text-zinc-950">L</span>
              </div>
              <div className="leading-none min-w-0">
                <span className="font-cormorant text-base font-semibold tracking-wide text-zinc-900 dark:text-zinc-100">
                  Litoral Haus
                </span>
                <span className="ml-2 rounded-md bg-amber-400/15 px-1.5 py-0.5 font-inter text-[9px] font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                  CRM
                </span>
              </div>
            </Link>
          )}

          {collapsed && (
            <Link href="/admin" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-400 mx-auto" onClick={onClose}>
              <span className="font-cormorant text-sm font-bold text-zinc-950">L</span>
            </Link>
          )}

          {/* Mobile close */}
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 lg:hidden ml-1 shrink-0"
          >
            <X size={16} />
          </button>

          {/* Desktop collapse toggle */}
          <button
            onClick={onToggleCollapse}
            className={cn(
              "hidden lg:flex rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 shrink-0 transition-colors",
              collapsed && "mx-auto"
            )}
            title={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            {collapsed
              ? <PanelLeftOpen  size={15} />
              : <PanelLeftClose size={15} />
            }
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4 space-y-6">
          {/* Main group */}
          <div>
            {!collapsed && (
              <p className="mb-1.5 px-3 font-inter text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
                Principal
              </p>
            )}
            <ul className="space-y-0.5">
              {visibleMain.map((item) => {
                const active = isActive(item);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.soon ? "#" : item.href}
                      onClick={() => handleNavClick(item)}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "group flex items-center rounded-xl font-inter text-sm transition-all duration-150",
                        collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
                        active
                          ? "bg-amber-50 dark:bg-amber-400/10 text-amber-700 dark:text-amber-400 font-medium"
                          : item.soon
                          ? "cursor-default text-zinc-300 dark:text-zinc-700"
                          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-900 dark:hover:text-zinc-100"
                      )}
                    >
                      <Icon
                        size={17}
                        strokeWidth={active ? 2 : 1.7}
                        className={cn(
                          "shrink-0 transition-colors",
                          active
                            ? "text-amber-600 dark:text-amber-400"
                            : item.soon
                            ? "text-zinc-300 dark:text-zinc-700"
                            : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300"
                        )}
                      />
                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.soon && (
                            <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 font-inter text-[9px] font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
                              Em breve
                            </span>
                          )}
                          {active && !item.soon && (
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                          )}
                        </>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Settings group */}
          {visibleSettings.length > 0 && (
            <div>
              {!collapsed && (
                <p className="mb-1.5 px-3 font-inter text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
                  Configurações
                </p>
              )}
              <ul className="space-y-0.5">
                {visibleSettings.map((item) => {
                  const active = isActive(item);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => handleNavClick(item)}
                        title={collapsed ? item.label : undefined}
                        className={cn(
                          "group flex items-center rounded-xl font-inter text-sm transition-all duration-150",
                          collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
                          active
                            ? "bg-amber-50 dark:bg-amber-400/10 text-amber-700 dark:text-amber-400 font-medium"
                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-900 dark:hover:text-zinc-100"
                        )}
                      >
                        <Icon
                          size={17}
                          strokeWidth={active ? 2 : 1.7}
                          className={cn(
                            "shrink-0",
                            active
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300"
                          )}
                        />
                        {!collapsed && (
                          <>
                            <span className="flex-1 truncate">{item.label}</span>
                            {active && (
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                            )}
                          </>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="shrink-0 border-t border-zinc-100 dark:border-zinc-800 p-2 space-y-1">
          {!collapsed && (
            <div className="mb-2 px-1">
              <ModeToggle variant="segmented" className="w-full" />
            </div>
          )}

          {collapsed && (
            <div className="flex justify-center py-1">
              <ModeToggle variant="icon" />
            </div>
          )}

          {/* User card */}
          {!collapsed ? (
            <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-amber-400 to-amber-600 font-inter text-[11px] font-bold text-white shadow-sm">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-inter text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  {session.name.split(" ")[0]}
                </p>
                <p className="font-inter text-[10px] text-zinc-400 dark:text-zinc-500">
                  {ROLE_LABEL[session.role] ?? session.role}
                </p>
              </div>
            </div>
          ) : (
            <div
              title={session.name}
              className="flex justify-center py-1"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-amber-400 to-amber-600 font-inter text-[11px] font-bold text-white shadow-sm">
                {initials}
              </div>
            </div>
          )}

          {/* Logout */}
          <form action={logout}>
            <button
              type="submit"
              title="Sair"
              className={cn(
                "group flex w-full items-center rounded-xl font-inter text-sm text-zinc-500 dark:text-zinc-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400",
                collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"
              )}
            >
              <LogOut size={15} strokeWidth={1.7} className="shrink-0 transition-colors group-hover:text-red-500" />
              {!collapsed && "Sair"}
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
