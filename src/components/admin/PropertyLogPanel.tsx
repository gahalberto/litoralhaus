import { History } from "lucide-react";
import { Separator } from "@/components/ui/separator";

type LogEntry = {
  id:        string;
  createdAt: Date;
  userName:  string;
  action:    string;
  field:     string | null;
  oldValue:  string | null;
  newValue:  string | null;
  user:      { avatar: string | null } | null;
};

function formatDate(d: Date) {
  return new Date(d).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function Initials({ name }: { name: string }) {
  const ini = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-zinc-400 to-zinc-600 font-inter text-[10px] font-bold text-white">
      {ini}
    </div>
  );
}

export function PropertyLogPanel({ logs }: { logs: LogEntry[] }) {
  return (
    <div className="mt-12">
      <Separator className="mb-8" />
      <div className="mb-4 flex items-center gap-2">
        <History size={15} className="text-amber-600 dark:text-amber-400" />
        <h2 className="font-inter text-sm font-semibold text-foreground">
          Histórico de alterações
        </h2>
        <span className="ml-auto rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 font-inter text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
          {logs.length} registro{logs.length !== 1 ? "s" : ""}
        </span>
      </div>

      <ul className="space-y-0">
        {logs.map((log, i) => (
          <li key={log.id} className="relative flex gap-3">
            {/* Timeline line */}
            {i < logs.length - 1 && (
              <div className="absolute left-3.5 top-8 bottom-0 w-px bg-border" />
            )}
            <Initials name={log.userName} />
            <div className="flex-1 pb-5">
              <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                <span className="font-inter text-xs font-semibold text-foreground">
                  {log.userName}
                </span>
                {log.action === "CREATED" ? (
                  <span className="font-inter text-xs text-muted-foreground">
                    cadastrou este imóvel
                  </span>
                ) : (
                  <span className="font-inter text-xs text-muted-foreground">
                    alterou{log.field ? ` "${log.field}"` : ""}
                  </span>
                )}
                <span className="font-inter text-[10px] text-muted-foreground/60">
                  · {formatDate(log.createdAt)}
                </span>
              </div>

              {log.action !== "CREATED" && (log.oldValue || log.newValue) && (
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {log.oldValue && (
                    <span className="rounded bg-red-50 dark:bg-red-500/10 px-2 py-0.5 font-inter text-[11px] text-red-600 dark:text-red-400 line-through">
                      {log.oldValue}
                    </span>
                  )}
                  {log.oldValue && log.newValue && (
                    <span className="font-inter text-xs text-muted-foreground">→</span>
                  )}
                  {log.newValue && (
                    <span className="rounded bg-green-50 dark:bg-green-500/10 px-2 py-0.5 font-inter text-[11px] text-green-700 dark:text-green-400">
                      {log.newValue}
                    </span>
                  )}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
