import type { GA4Stats } from "@/lib/ga4";

function num(n: number) {
  return n.toLocaleString("pt-BR");
}

const DEVICE_LABEL: Record<string, string> = {
  mobile:  "Mobile",
  desktop: "Desktop",
  tablet:  "Tablet",
};

const DEVICE_COLOR: Record<string, string> = {
  mobile:  "bg-amber-400",
  desktop: "bg-zinc-700",
  tablet:  "bg-zinc-400",
};

export function AnalyticsSection({ stats }: { stats: GA4Stats }) {
  const totalDeviceUsers = stats.devices.reduce((s, d) => s + d.users, 0);
  const maxViews = stats.topPages[0]?.views ?? 1;

  return (
    <div className="space-y-4">

      {/* Header com active users */}
      <div className="flex items-center justify-between">
        <p className="font-inter text-xs uppercase tracking-widest text-muted-foreground">
          Analytics — últimos 30 dias
        </p>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span className="font-inter text-xs text-green-600 dark:text-green-400">
            {stats.activeUsers} agora online
          </span>
        </div>
      </div>

      {/* KPIs GA4 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Usuários únicos",  value: num(stats.last30Days.users)    },
          { label: "Sessões",          value: num(stats.last30Days.sessions)  },
          { label: "Visualizações",    value: num(stats.last30Days.pageViews) },
          { label: "Duração média",    value: stats.last30Days.avgSessionDuration + " min" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded border border-border bg-card p-4">
            <p className="font-inter text-[10px] uppercase tracking-widest text-muted-foreground">
              {kpi.label}
            </p>
            <p className="mt-1.5 font-cormorant text-3xl font-light text-foreground">
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* Páginas + Dispositivos */}
      <div className="grid gap-4 sm:grid-cols-2">

        {/* Top páginas */}
        <div className="rounded border border-border bg-card p-4">
          <p className="mb-3 font-inter text-[10px] uppercase tracking-widest text-muted-foreground">
            Páginas mais visitadas
          </p>
          <div className="space-y-2">
            {stats.topPages.length === 0 && (
              <p className="font-inter text-xs text-muted-foreground/50">Sem dados</p>
            )}
            {stats.topPages.map((p) => (
              <div key={p.path} className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-center justify-between gap-2">
                    <span className="truncate font-inter text-xs text-foreground" title={p.path}>
                      {p.path === "/" ? "Home" : p.path}
                    </span>
                    <span className="shrink-0 font-inter text-[11px] tabular-nums text-muted-foreground">
                      {num(p.views)}
                    </span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{ width: `${Math.round((p.views / maxViews) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dispositivos */}
        <div className="rounded border border-border bg-card p-4">
          <p className="mb-3 font-inter text-[10px] uppercase tracking-widest text-muted-foreground">
            Dispositivos
          </p>
          {stats.devices.length === 0 ? (
            <p className="font-inter text-xs text-muted-foreground/50">Sem dados</p>
          ) : (
            <>
              {/* Barra empilhada */}
              <div className="mb-4 flex h-2 overflow-hidden rounded-full bg-muted">
                {stats.devices.map((d) => (
                  <div
                    key={d.device}
                    className={`h-full ${DEVICE_COLOR[d.device] ?? "bg-zinc-300"}`}
                    style={{ width: `${totalDeviceUsers > 0 ? Math.round((d.users / totalDeviceUsers) * 100) : 0}%` }}
                  />
                ))}
              </div>
              <div className="space-y-2">
                {stats.devices.map((d) => {
                  const pct = totalDeviceUsers > 0 ? Math.round((d.users / totalDeviceUsers) * 100) : 0;
                  return (
                    <div key={d.device} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${DEVICE_COLOR[d.device] ?? "bg-zinc-300"}`} />
                        <span className="font-inter text-xs text-foreground">
                          {DEVICE_LABEL[d.device] ?? d.device}
                        </span>
                      </div>
                      <span className="font-inter text-xs tabular-nums text-muted-foreground">
                        {num(d.users)} · {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
