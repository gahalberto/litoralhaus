"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { Bell, MessageSquare, TrendingUp, CalendarClock, X } from "lucide-react";

type Counts = {
  total:          number;
  unreadContacts: number;
  newLeads:       number;
  overdueTasks:   number;
};

const POLL_INTERVAL = 60_000; // 1 minuto

export function NotificationBell() {
  const [counts, setCounts]   = useState<Counts | null>(null);
  const [open,   setOpen]     = useState(false);
  const dropdownRef           = useRef<HTMLDivElement>(null);
  const prevTotalRef          = useRef<number>(0);

  const fetchCounts = useCallback(async () => {
    try {
      const res  = await fetch("/api/notifications/count", { cache: "no-store" });
      if (!res.ok) return;
      const data: Counts = await res.json();
      setCounts(data);

      // Atualiza o título da aba com o total de notificações
      const base = document.title.replace(/^\(\d+\)\s*/, "");
      document.title = data.total > 0 ? `(${data.total}) ${base}` : base;

      prevTotalRef.current = data.total;
    } catch {
      // silencioso — não quebra o admin se a API falhar
    }
  }, []);

  // Polling a cada minuto + busca imediata na montagem
  useEffect(() => {
    fetchCounts();
    const id = setInterval(fetchCounts, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchCounts]);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const total = counts?.total ?? 0;
  const hasNew = total > 0;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão do sino */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        aria-label={hasNew ? `${total} notificações pendentes` : "Notificações"}
      >
        <Bell size={16} strokeWidth={1.8} className={open ? "text-zinc-900 dark:text-zinc-100" : ""} />

        {/* Badge */}
        {hasNew ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 font-inter text-[9px] font-bold leading-none text-white ring-2 ring-white dark:ring-zinc-950">
            {total > 9 ? "9+" : total}
          </span>
        ) : (
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-zinc-950" />
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 origin-top-right rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl shadow-zinc-900/10 dark:shadow-zinc-950/60">
          {/* Header do dropdown */}
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 px-4 py-3">
            <p className="font-inter text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              Notificações
            </p>
            <div className="flex items-center gap-2">
              {hasNew && (
                <span className="rounded-full bg-red-100 dark:bg-red-500/20 px-2 py-0.5 font-inter text-[10px] font-bold text-red-600 dark:text-red-400">
                  {total} pendente{total !== 1 ? "s" : ""}
                </span>
              )}
              <button
                onClick={() => setOpen(false)}
                className="rounded p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Itens */}
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {/* Mensagens não lidas */}
            <Link
              href="/admin/contacts"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                (counts?.unreadContacts ?? 0) > 0
                  ? "bg-blue-100 dark:bg-blue-500/20"
                  : "bg-zinc-100 dark:bg-zinc-800"
              }`}>
                <MessageSquare size={14} className={
                  (counts?.unreadContacts ?? 0) > 0
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-zinc-400"
                } />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-inter text-xs font-medium text-zinc-900 dark:text-zinc-100">
                  Mensagens
                </p>
                <p className="font-inter text-[11px] text-zinc-500 dark:text-zinc-400">
                  {(counts?.unreadContacts ?? 0) > 0
                    ? `${counts!.unreadContacts} não ${counts!.unreadContacts === 1 ? "lida" : "lidas"}`
                    : "Todas lidas"}
                </p>
              </div>
              {(counts?.unreadContacts ?? 0) > 0 && (
                <span className="shrink-0 rounded-full bg-blue-500 px-2 py-0.5 font-inter text-[10px] font-bold text-white">
                  {counts!.unreadContacts}
                </span>
              )}
            </Link>

            {/* Leads novos */}
            <Link
              href="/admin/leads?status=NOVO"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                (counts?.newLeads ?? 0) > 0
                  ? "bg-amber-100 dark:bg-amber-500/20"
                  : "bg-zinc-100 dark:bg-zinc-800"
              }`}>
                <TrendingUp size={14} className={
                  (counts?.newLeads ?? 0) > 0
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-zinc-400"
                } />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-inter text-xs font-medium text-zinc-900 dark:text-zinc-100">
                  Leads novos
                </p>
                <p className="font-inter text-[11px] text-zinc-500 dark:text-zinc-400">
                  {(counts?.newLeads ?? 0) > 0
                    ? `${counts!.newLeads} aguardando atendimento`
                    : "Nenhum pendente"}
                </p>
              </div>
              {(counts?.newLeads ?? 0) > 0 && (
                <span className="shrink-0 rounded-full bg-amber-500 px-2 py-0.5 font-inter text-[10px] font-bold text-white">
                  {counts!.newLeads}
                </span>
              )}
            </Link>

            {/* Tarefas atrasadas */}
            <Link
              href="/admin/agenda"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                (counts?.overdueTasks ?? 0) > 0
                  ? "bg-red-100 dark:bg-red-500/20"
                  : "bg-zinc-100 dark:bg-zinc-800"
              }`}>
                <CalendarClock size={14} className={
                  (counts?.overdueTasks ?? 0) > 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-zinc-400"
                } />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-inter text-xs font-medium text-zinc-900 dark:text-zinc-100">
                  Tarefas atrasadas
                </p>
                <p className="font-inter text-[11px] text-zinc-500 dark:text-zinc-400">
                  {(counts?.overdueTasks ?? 0) > 0
                    ? `${counts!.overdueTasks} tarefa${counts!.overdueTasks !== 1 ? "s" : ""} em atraso`
                    : "Nenhuma em atraso"}
                </p>
              </div>
              {(counts?.overdueTasks ?? 0) > 0 && (
                <span className="shrink-0 rounded-full bg-red-500 px-2 py-0.5 font-inter text-[10px] font-bold text-white">
                  {counts!.overdueTasks}
                </span>
              )}
            </Link>
          </div>

          {/* Footer */}
          <div className="border-t border-zinc-100 dark:border-zinc-800 px-4 py-2.5">
            <button
              onClick={() => { fetchCounts(); }}
              className="font-inter text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              Atualizar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
