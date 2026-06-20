import type { Metadata } from "next";
import Link from "next/link";
import { PropertyStatus, PropertyType, Region } from "@prisma/client";
import { getProperties } from "@/actions/properties";
import {
  PROPERTY_TYPE_LABELS,
  PROPERTY_STATUS_CONFIG,
  REGION_LABELS,
  formatPrice,
} from "@/lib/property-config";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Imóveis" };

const FILTER_ALL = "all";

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;

  const statusFilter  = sp.status  as PropertyStatus  | undefined;
  const typeFilter    = sp.type    as PropertyType    | undefined;
  const regionFilter  = sp.region  as Region          | undefined;
  const iscaFilter    = sp.isca === "1" ? true : sp.isca === "0" ? false : undefined;

  const properties = await getProperties({
    status: statusFilter && Object.values(PropertyStatus).includes(statusFilter) ? statusFilter : undefined,
    type:   typeFilter   && Object.values(PropertyType).includes(typeFilter)     ? typeFilter   : undefined,
    region: regionFilter && Object.values(Region).includes(regionFilter)         ? regionFilter : undefined,
    isIsca: iscaFilter,
  });

  function filterHref(key: string, value: string) {
    const p = new URLSearchParams(sp);
    if (value === FILTER_ALL) p.delete(key);
    else p.set(key, value);
    const q = p.toString();
    return `/admin/properties${q ? `?${q}` : ""}`;
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-8 py-4">
        <div>
          <h1 className="font-cormorant text-2xl font-light text-foreground">Imóveis</h1>
          <p className="mt-0.5 font-inter text-xs text-muted-foreground">
            {properties.length} {properties.length === 1 ? "imóvel" : "imóveis"}
          </p>
        </div>
        <Link
          href="/admin/properties/new"
          className="inline-flex items-center gap-2 rounded-none border border-amber-400 bg-amber-400 px-5 py-2 font-inter text-xs font-medium uppercase tracking-widest text-stone-950 transition-colors hover:bg-transparent hover:text-amber-600 dark:hover:text-amber-400"
        >
          + Cadastrar
        </Link>
      </div>

      {/* Filters */}
      <div className="flex shrink-0 items-center gap-6 border-b border-border px-8 py-3 overflow-x-auto">
        {/* Status */}
        <div className="flex items-center gap-1.5">
          <span className="font-inter text-[10px] uppercase tracking-widest text-muted-foreground/60 mr-1">Status</span>
          <FilterPill href={filterHref("status", FILTER_ALL)} active={!statusFilter}>Todos</FilterPill>
          {Object.values(PropertyStatus).map((s) => (
            <FilterPill key={s} href={filterHref("status", s)} active={statusFilter === s}>
              {PROPERTY_STATUS_CONFIG[s].label}
            </FilterPill>
          ))}
        </div>

        <div className="h-4 w-px shrink-0 bg-border" />

        {/* Tipo */}
        <div className="flex items-center gap-1.5">
          <span className="font-inter text-[10px] uppercase tracking-widest text-muted-foreground/60 mr-1">Tipo</span>
          <FilterPill href={filterHref("type", FILTER_ALL)} active={!typeFilter}>Todos</FilterPill>
          {Object.values(PropertyType).map((t) => (
            <FilterPill key={t} href={filterHref("type", t)} active={typeFilter === t}>
              {PROPERTY_TYPE_LABELS[t]}
            </FilterPill>
          ))}
        </div>

        <div className="h-4 w-px shrink-0 bg-border" />

        {/* Isca */}
        <div className="flex items-center gap-1.5">
          <span className="font-inter text-[10px] uppercase tracking-widest text-muted-foreground/60 mr-1">Isca</span>
          <FilterPill href={filterHref("isca", FILTER_ALL)} active={iscaFilter === undefined}>Todos</FilterPill>
          <FilterPill href={filterHref("isca", "1")} active={iscaFilter === true}>Ativa</FilterPill>
          <FilterPill href={filterHref("isca", "0")} active={iscaFilter === false}>Inativa</FilterPill>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {properties.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <p className="font-cormorant text-2xl font-light text-muted-foreground">
              Nenhum imóvel cadastrado
            </p>
            <p className="font-inter text-xs text-muted-foreground/60">
              Clique em &quot;Cadastrar&quot; para adicionar o primeiro imóvel ao portfólio.
            </p>
            <Link
              href="/admin/properties/new"
              className="mt-2 inline-flex items-center gap-2 border border-border px-5 py-2.5 font-inter text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
            >
              + Cadastrar primeiro imóvel
            </Link>
          </div>
        ) : (
          <table className="w-full min-w-215 border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Ref.", "Imóvel", "Tipo", "Localização", "Preço", "Status", "Isca", "Leads", ""].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left font-inter text-[10px] font-medium uppercase tracking-widest text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {properties.map((p) => {
                const statusCfg = PROPERTY_STATUS_CONFIG[p.status];
                return (
                  <tr
                    key={p.id}
                    className="group transition-colors hover:bg-muted/20"
                  >
                    {/* Ref */}
                    <td className="px-5 py-3">
                      {p.refCode ? (
                        <span className="rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-1 font-mono text-[11px] font-semibold tracking-wider text-zinc-600 dark:text-zinc-300">
                          {p.refCode}
                        </span>
                      ) : (
                        <span className="font-inter text-xs text-muted-foreground/40">—</span>
                      )}
                    </td>

                    {/* Imóvel */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {p.featured && (
                          <span title="Destaque" className="text-amber-500 dark:text-amber-400 text-sm">★</span>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={cn(
                              "inline-block h-1.5 w-1.5 shrink-0 rounded-full",
                              p.active ? "bg-emerald-400" : "bg-zinc-300 dark:bg-zinc-600"
                            )} title={p.active ? "Ativo" : "Inativo"} />
                            <Link
                              href={`/admin/properties/${p.id}`}
                              className={cn(
                                "font-inter text-sm font-medium transition-colors hover:text-amber-600 dark:hover:text-amber-400",
                                p.active ? "text-foreground" : "text-muted-foreground/60"
                              )}
                            >
                              {p.title}
                            </Link>
                          </div>
                          <p className="font-inter text-[10px] text-muted-foreground/60">
                            {p.neighborhood}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Tipo */}
                    <td className="px-5 py-3 font-inter text-xs text-muted-foreground">
                      {PROPERTY_TYPE_LABELS[p.type]}
                    </td>

                    {/* Localização */}
                    <td className="px-5 py-3 font-inter text-xs text-muted-foreground">
                      {REGION_LABELS[p.region]} · {p.city}
                    </td>

                    {/* Preço */}
                    <td className="px-5 py-3 font-inter text-sm tabular-nums text-foreground">
                      {formatPrice(p.priceAsk)}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded px-2 py-0.5 font-inter text-[10px] uppercase tracking-wider",
                          statusCfg.badge
                        )}
                      >
                        <span className={cn("h-1.5 w-1.5 rounded-full", statusCfg.dot)} />
                        {statusCfg.label}
                      </span>
                    </td>

                    {/* Isca */}
                    <td className="px-5 py-3">
                      {p.isIsca ? (
                        <span className="rounded bg-violet-100 px-2 py-0.5 font-inter text-[10px] uppercase tracking-wider text-violet-700 dark:bg-violet-400/10 dark:text-violet-300">
                          Isca
                        </span>
                      ) : (
                        <span className="font-inter text-xs text-muted-foreground/40">—</span>
                      )}
                    </td>

                    {/* Leads interessados */}
                    <td className="px-5 py-3">
                      <span className="font-inter text-xs tabular-nums text-muted-foreground">
                        {p._count.interests}
                      </span>
                    </td>

                    {/* Ações */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/properties/${p.id}`}
                          className="font-inter text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Visualizar
                        </Link>
                        <Link
                          href={`/admin/properties/${p.id}/report`}
                          className="font-inter text-xs text-amber-600 hover:text-amber-500 transition-colors"
                        >
                          Relatório
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function FilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded px-2.5 py-1 font-inter text-[11px] transition-colors",
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </Link>
  );
}
