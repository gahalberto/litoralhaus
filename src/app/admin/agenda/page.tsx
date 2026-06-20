import type { Metadata } from "next";
import Link from "next/link";
import { getPendingTasks } from "@/actions/agenda";
import { CompleteTaskButton } from "@/components/admin/TaskActions";
import { LEAD_STATUS_CONFIG } from "@/lib/lead-config";

export const metadata: Metadata = { title: "Agenda" };

const CHANNEL_ICON: Record<string, string> = {
  WHATSAPP:   "💬",
  EMAIL:      "✉️",
  PHONE:      "📞",
  VISIT:      "🏠",
  VIDEO_CALL: "📹",
  NOTE:       "📝",
};

const CHANNEL_LABEL: Record<string, string> = {
  WHATSAPP:   "WhatsApp",
  EMAIL:      "E-mail",
  PHONE:      "Telefone",
  VISIT:      "Visita",
  VIDEO_CALL: "Videochamada",
  NOTE:       "Anotação",
};

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(d));
}

function fmtDateShort(d: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short", day: "2-digit", month: "2-digit",
  }).format(new Date(d));
}

function getDateGroup(date: Date): string {
  const now    = new Date();
  const target = new Date(date);

  const todayStart    = new Date(now); todayStart.setHours(0,0,0,0);
  const tomorrowStart = new Date(todayStart); tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  const tomorrowEnd   = new Date(tomorrowStart); tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
  const weekEnd       = new Date(todayStart); weekEnd.setDate(weekEnd.getDate() + 7);

  if (target < todayStart) return "overdue";
  if (target < tomorrowStart) return "today";
  if (target < tomorrowEnd) return "tomorrow";
  if (target < weekEnd) return "week";
  return "later";
}

const GROUP_META: Record<string, { label: string; badge: string; dot: string }> = {
  overdue:  { label: "Atrasadas",         badge: "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400",     dot: "bg-red-500" },
  today:    { label: "Hoje",              badge: "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
  tomorrow: { label: "Amanhã",            badge: "bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400", dot: "bg-blue-500"  },
  week:     { label: "Esta semana",       badge: "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400",     dot: "bg-zinc-400"  },
  later:    { label: "Próximas semanas",  badge: "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400",     dot: "bg-zinc-400"  },
};

const GROUP_ORDER = ["overdue", "today", "tomorrow", "week", "later"];

export default async function AgendaPage() {
  const tasks = await getPendingTasks();

  const pending   = tasks.filter((t) => !t.completedAt);
  const completed = tasks.filter((t) => !!t.completedAt);

  // Agrupa tarefas pendentes por data
  const groups: Record<string, typeof pending> = {};
  for (const task of pending) {
    const group = getDateGroup(task.nextStepAt);
    if (!groups[group]) groups[group] = [];
    groups[group].push(task);
  }

  const overdueCount = (groups["overdue"] ?? []).length;
  const todayCount   = (groups["today"]   ?? []).length;

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-cormorant text-3xl font-light text-foreground">Agenda</h1>
          <p className="mt-1 font-inter text-sm text-muted-foreground">
            Tarefas e próximos passos com leads
          </p>
        </div>
        <div className="flex items-center gap-3">
          {overdueCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 dark:bg-red-500/10 px-2.5 py-1 font-inter text-xs font-semibold text-red-700 dark:text-red-400">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              {overdueCount} atrasada{overdueCount !== 1 ? "s" : ""}
            </span>
          )}
          {todayCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-500/10 px-2.5 py-1 font-inter text-xs font-semibold text-amber-700 dark:text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              {todayCount} para hoje
            </span>
          )}
        </div>
      </div>

      {/* Tarefas pendentes */}
      {pending.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-20 text-center">
          <p className="font-cormorant text-2xl font-light text-muted-foreground">
            Nenhuma tarefa pendente
          </p>
          <p className="mt-2 font-inter text-sm text-muted-foreground">
            Agende próximos passos ao registrar um contato com um lead.
          </p>
          <Link
            href="/admin/leads"
            className="mt-4 inline-block font-inter text-sm text-amber-600 hover:text-amber-500 transition-colors"
          >
            Ver leads →
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {GROUP_ORDER.map((groupKey) => {
            const groupTasks = groups[groupKey];
            if (!groupTasks?.length) return null;
            const meta = GROUP_META[groupKey];

            return (
              <section key={groupKey}>
                <div className="mb-3 flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-inter text-[11px] font-semibold uppercase tracking-widest ${meta.badge}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                    {meta.label}
                  </span>
                  <span className="font-inter text-xs text-muted-foreground">
                    {groupTasks.length} tarefa{groupTasks.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="space-y-3">
                  {groupTasks.map((task) => {
                    const leadCfg = LEAD_STATUS_CONFIG[task.lead.status as keyof typeof LEAD_STATUS_CONFIG];
                    const isOverdue = getDateGroup(task.nextStepAt) === "overdue";

                    return (
                      <div
                        key={task.id}
                        className={`rounded-xl border bg-card p-4 ${isOverdue ? "border-red-200 dark:border-red-500/30" : "border-border"}`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Ícone do canal */}
                          <span className="mt-0.5 text-lg leading-none shrink-0">
                            {CHANNEL_ICON[task.channel] ?? "📌"}
                          </span>

                          <div className="flex-1 min-w-0 space-y-2">
                            {/* Linha 1: lead + status */}
                            <div className="flex flex-wrap items-center gap-2">
                              <Link
                                href={`/admin/leads/${task.lead.id}`}
                                className="font-inter text-sm font-semibold text-foreground hover:text-amber-600 transition-colors"
                              >
                                {task.lead.name}
                              </Link>
                              {leadCfg && (
                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-inter text-[10px] font-medium ${leadCfg.badge}`}>
                                  <span className={`h-1 w-1 rounded-full ${leadCfg.dot}`} />
                                  {leadCfg.label}
                                </span>
                              )}
                              <span className="font-inter text-xs text-muted-foreground">
                                {task.lead.phone}
                              </span>
                            </div>

                            {/* Tarefa agendada */}
                            <div className={`flex items-start gap-2 rounded-lg px-3 py-2 ${isOverdue ? "bg-red-50 dark:bg-red-500/10" : "bg-amber-50 dark:bg-amber-500/10"}`}>
                              <span className={`mt-0.5 shrink-0 font-inter text-sm ${isOverdue ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"}`}>
                                →
                              </span>
                              <div className="min-w-0">
                                <p className={`font-inter text-sm font-medium ${isOverdue ? "text-red-800 dark:text-red-300" : "text-amber-800 dark:text-amber-300"}`}>
                                  {task.nextStep}
                                </p>
                                <p className={`font-inter text-xs mt-0.5 ${isOverdue ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-500"}`}>
                                  {isOverdue ? "⚠ " : ""}{fmtDate(task.nextStepAt)}
                                  {isOverdue && " — Atrasada"}
                                </p>
                              </div>
                            </div>

                            {/* Contexto: último contato */}
                            <p className="font-inter text-xs text-muted-foreground line-clamp-1">
                              <span className="text-muted-foreground/60">{CHANNEL_LABEL[task.channel] ?? task.channel} · </span>
                              {task.summary}
                            </p>

                            {/* Linha inferior: por quem + ações */}
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-inter text-[10px] text-muted-foreground/60">
                                Agendado por {task.performedBy} · {fmtDateShort(task.createdAt)}
                              </p>
                              <div className="flex items-center gap-3">
                                <a
                                  href={`https://wa.me/55${task.lead.phone.replace(/\D/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-inter text-[11px] text-emerald-600 hover:text-emerald-500 transition-colors"
                                >
                                  WhatsApp ↗
                                </a>
                                <Link
                                  href={`/admin/leads/${task.lead.id}`}
                                  className="font-inter text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  Ver lead
                                </Link>
                                <CompleteTaskButton id={task.id} completed={false} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Tarefas concluídas recentemente */}
      {completed.length > 0 && (
        <section>
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center gap-2 py-2 font-inter text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
              <svg className="h-3.5 w-3.5 transition-transform group-open:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 18 6-6-6-6"/>
              </svg>
              Concluídas nos últimos 7 dias ({completed.length})
            </summary>

            <div className="mt-3 space-y-2">
              {completed.map((task) => (
                <div key={task.id} className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-4 opacity-60">
                  <span className="mt-0.5 text-base leading-none shrink-0 grayscale">
                    {CHANNEL_ICON[task.channel] ?? "📌"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/admin/leads/${task.lead.id}`}
                        className="font-inter text-sm font-medium text-foreground hover:text-amber-600 transition-colors"
                      >
                        {task.lead.name}
                      </Link>
                      <span className="flex items-center gap-1 font-inter text-[10px] text-emerald-600 dark:text-emerald-400">
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M20 6 9 17l-5-5"/>
                        </svg>
                        Concluída {task.completedAt ? fmtDateShort(task.completedAt) : ""}
                      </span>
                    </div>
                    <p className="mt-0.5 font-inter text-xs text-muted-foreground">→ {task.nextStep}</p>
                  </div>
                  <CompleteTaskButton id={task.id} completed={true} />
                </div>
              ))}
            </div>
          </details>
        </section>
      )}
    </div>
  );
}
