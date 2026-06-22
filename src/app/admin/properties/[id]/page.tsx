import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, Pencil, ExternalLink, FileBarChart2,
  Bed, Bath, Car, Maximize2, MapPin, User, Phone,
  Mail, Calendar, Tag, CheckCircle2, XCircle,
} from "lucide-react";
import { getPropertyById } from "@/actions/properties";
import { getSession } from "@/lib/session";
import {
  PROPERTY_TYPE_LABELS, PROPERTY_STATUS_CONFIG,
  REGION_LABELS, PURPOSE_CONFIG, formatPrice,
} from "@/lib/property-config";
import { CopyLinkButton } from "@/components/admin/CopyLinkButton";
import { cn } from "@/lib/utils";

const BASE = "https://litoralhaus.com.br";

export const metadata: Metadata = { title: "Visualizar Imóvel" };

const CAN_EDIT: Array<"ADMIN" | "CORRETOR"> = ["ADMIN", "CORRETOR"];

function fmt(d: Date | string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short" }).format(
    new Date(d)
  );
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value == null || value === "") return null;
  return (
    <div className="flex items-baseline justify-between gap-4 py-2 border-b border-border/50 last:border-0">
      <span className="shrink-0 font-inter text-xs text-muted-foreground">{label}</span>
      <span className="font-inter text-xs font-medium text-foreground text-right">{value}</span>
    </div>
  );
}

function BoolRow({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-border/50 last:border-0">
      <span className="font-inter text-xs text-muted-foreground">{label}</span>
      {value
        ? <CheckCircle2 size={14} className="text-emerald-500" />
        : <XCircle size={14} className="text-muted-foreground/30" />
      }
    </div>
  );
}

export default async function PropertyViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [property, session] = await Promise.all([getPropertyById(id), getSession()]);

  if (!property) notFound();

  const canEdit   = session && CAN_EDIT.includes(session.role);
  const statusCfg = PROPERTY_STATUS_CONFIG[property.status];
  const images    = property.images;
  const mainImage = images[0] ?? null;

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950 pb-16">

      {/* ── Topbar ─────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-white/90 dark:bg-zinc-950/90 backdrop-blur px-6 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/properties"
            className="flex items-center gap-1.5 font-inter text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={13} />
            Imóveis
          </Link>
          <span className="text-muted-foreground/30">/</span>
          {property.refCode && (
            <>
              <span className="rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 font-mono text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">
                {property.refCode}
              </span>
              <span className="text-muted-foreground/30">/</span>
            </>
          )}
          <span className="max-w-xs truncate font-inter text-xs text-foreground">{property.title}</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/admin/properties/${id}/report`}
            className="inline-flex items-center gap-1.5 rounded border border-border px-3 py-1.5 font-inter text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            <FileBarChart2 size={12} />
            Relatório
          </Link>
          <CopyLinkButton url={`${BASE}/imoveis/${property.slug}`} />
          <a
            href={`/imoveis/${property.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded border border-border px-3 py-1.5 font-inter text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            <ExternalLink size={12} />
            Ver no site
          </a>
          {canEdit && (
            <Link
              href={`/admin/properties/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded border border-amber-400 bg-amber-400 px-3 py-1.5 font-inter text-xs font-medium text-stone-950 transition-colors hover:bg-amber-300"
            >
              <Pencil size={12} />
              Editar
            </Link>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">

          {/* ── Coluna principal ─────────────────────────────────────────── */}
          <div className="min-w-0 space-y-6">

            {/* Galeria */}
            {images.length > 0 && (
              <div className="overflow-hidden rounded-2xl">
                <div className="grid grid-cols-4 gap-1.5">
                  {/* Imagem principal */}
                  <div className={cn(
                    "relative overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800",
                    images.length === 1 ? "col-span-4 h-80" : "col-span-3 h-72"
                  )}>
                    <Image
                      src={mainImage!}
                      alt={property.title}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 700px"
                      className="object-cover"
                    />
                  </div>

                  {/* Miniaturas */}
                  {images.length > 1 && (
                    <div className="col-span-1 flex flex-col gap-1.5">
                      {images.slice(1, 4).map((img, i) => (
                        <div
                          key={i}
                          className="relative flex-1 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800"
                        >
                          <Image
                            src={img}
                            alt={`${property.title} ${i + 2}`}
                            fill
                            sizes="150px"
                            className="object-cover"
                          />
                          {i === 2 && images.length > 4 && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                              <span className="font-inter text-sm font-semibold text-white">
                                +{images.length - 4}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Cabeçalho */}
            <div>
              {/* Badges de status e finalidade */}
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className={cn(
                  "inline-flex items-center gap-1.5 rounded px-2 py-0.5 font-inter text-[10px] uppercase tracking-wider",
                  statusCfg.badge
                )}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", statusCfg.dot)} />
                  {statusCfg.label}
                </span>

                {property.purposes.map((p) => {
                  const cfg = PURPOSE_CONFIG[p];
                  return (
                    <span
                      key={p}
                      className={cn(
                        "inline-flex items-center gap-1 rounded px-2 py-0.5 font-inter text-[10px] uppercase tracking-wider",
                        cfg.badge
                      )}
                    >
                      {cfg.icon} {cfg.label}
                    </span>
                  );
                })}

                {property.isIsca && (
                  <span className="rounded bg-violet-100 px-2 py-0.5 font-inter text-[10px] uppercase tracking-wider text-violet-700 dark:bg-violet-400/10 dark:text-violet-300">
                    Isca
                  </span>
                )}
                {property.featured && (
                  <span className="rounded bg-amber-100 px-2 py-0.5 font-inter text-[10px] uppercase tracking-wider text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">
                    ★ Destaque
                  </span>
                )}
                {!property.active && (
                  <span className="rounded bg-zinc-100 px-2 py-0.5 font-inter text-[10px] uppercase tracking-wider text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                    Inativo
                  </span>
                )}
              </div>

              <h1 className="font-cormorant text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
                {property.title}
              </h1>

              <div className="mt-2 flex items-center gap-1.5 font-inter text-sm text-muted-foreground">
                <MapPin size={13} />
                {[property.address, property.neighborhood, property.city, REGION_LABELS[property.region]]
                  .filter(Boolean)
                  .join(", ")}
              </div>

              {/* Tipo */}
              <p className="mt-1 font-inter text-xs text-muted-foreground/60">
                {PROPERTY_TYPE_LABELS[property.type]}
              </p>
            </div>

            {/* Preços */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {property.priceAsk && (
                <div className="rounded-xl border border-border bg-white p-4 dark:bg-zinc-900">
                  <p className="font-inter text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-1">Venda</p>
                  <p className="font-cormorant text-xl font-semibold text-foreground">{formatPrice(String(property.priceAsk))}</p>
                </div>
              )}
              {property.priceRent && (
                <div className="rounded-xl border border-border bg-white p-4 dark:bg-zinc-900">
                  <p className="font-inter text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-1">Locação</p>
                  <p className="font-cormorant text-xl font-semibold text-foreground">{formatPrice(String(property.priceRent))}<span className="font-inter text-xs font-normal text-muted-foreground">/mês</span></p>
                </div>
              )}
              {property.condoFee && (
                <div className="rounded-xl border border-border bg-white p-4 dark:bg-zinc-900">
                  <p className="font-inter text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-1">Condomínio</p>
                  <p className="font-cormorant text-xl font-semibold text-foreground">{formatPrice(String(property.condoFee))}</p>
                </div>
              )}
              {property.iptu && (
                <div className="rounded-xl border border-border bg-white p-4 dark:bg-zinc-900">
                  <p className="font-inter text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-1">IPTU/ano</p>
                  <p className="font-cormorant text-xl font-semibold text-foreground">{formatPrice(String(property.iptu))}</p>
                </div>
              )}
            </div>

            {/* Características */}
            <div className="rounded-xl border border-border bg-white p-5 dark:bg-zinc-900">
              <p className="mb-4 font-inter text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Características
              </p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {property.bedrooms != null && (
                  <div className="flex flex-col items-center gap-1 rounded-lg bg-zinc-50 dark:bg-zinc-800 p-3 text-center">
                    <Bed size={18} className="text-muted-foreground" />
                    <span className="font-cormorant text-2xl font-semibold text-foreground">{property.bedrooms}</span>
                    <span className="font-inter text-[10px] text-muted-foreground">Quartos</span>
                  </div>
                )}
                {property.suites != null && (
                  <div className="flex flex-col items-center gap-1 rounded-lg bg-zinc-50 dark:bg-zinc-800 p-3 text-center">
                    <Bed size={18} className="text-amber-500" />
                    <span className="font-cormorant text-2xl font-semibold text-foreground">{property.suites}</span>
                    <span className="font-inter text-[10px] text-muted-foreground">Suítes</span>
                  </div>
                )}
                {property.bathrooms != null && (
                  <div className="flex flex-col items-center gap-1 rounded-lg bg-zinc-50 dark:bg-zinc-800 p-3 text-center">
                    <Bath size={18} className="text-muted-foreground" />
                    <span className="font-cormorant text-2xl font-semibold text-foreground">{property.bathrooms}</span>
                    <span className="font-inter text-[10px] text-muted-foreground">Banheiros</span>
                  </div>
                )}
                {property.parkingSpots != null && (
                  <div className="flex flex-col items-center gap-1 rounded-lg bg-zinc-50 dark:bg-zinc-800 p-3 text-center">
                    <Car size={18} className="text-muted-foreground" />
                    <span className="font-cormorant text-2xl font-semibold text-foreground">{property.parkingSpots}</span>
                    <span className="font-inter text-[10px] text-muted-foreground">Vagas</span>
                  </div>
                )}
                {property.areaTotal != null && (
                  <div className="flex flex-col items-center gap-1 rounded-lg bg-zinc-50 dark:bg-zinc-800 p-3 text-center">
                    <Maximize2 size={18} className="text-muted-foreground" />
                    <span className="font-cormorant text-2xl font-semibold text-foreground">{Number(property.areaTotal)}</span>
                    <span className="font-inter text-[10px] text-muted-foreground">m² total</span>
                  </div>
                )}
                {property.areaUsable != null && (
                  <div className="flex flex-col items-center gap-1 rounded-lg bg-zinc-50 dark:bg-zinc-800 p-3 text-center">
                    <Maximize2 size={18} className="text-emerald-500" />
                    <span className="font-cormorant text-2xl font-semibold text-foreground">{Number(property.areaUsable)}</span>
                    <span className="font-inter text-[10px] text-muted-foreground">m² útil</span>
                  </div>
                )}
              </div>
            </div>

            {/* Descrição */}
            {property.description && (
              <div className="rounded-xl border border-border bg-white p-5 dark:bg-zinc-900">
                <p className="mb-3 font-inter text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Descrição
                </p>
                <div
                  className="article-content max-w-none"
                  dangerouslySetInnerHTML={{ __html: property.description }}
                />
              </div>
            )}

            {/* Diferenciais, amenidades, proximidades */}
            {property.highlights.length > 0 && (
              <div className="rounded-xl border border-border bg-white p-5 dark:bg-zinc-900">
                <p className="mb-3 font-inter text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Diferenciais
                </p>
                <div className="flex flex-wrap gap-2">
                  {property.highlights.map((h) => (
                    <span
                      key={h.highlightId}
                      className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 font-inter text-xs text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-400"
                    >
                      <Tag size={10} />
                      {h.highlight?.label ?? h.highlightId}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {property.amenities.length > 0 && (
              <div className="rounded-xl border border-border bg-white p-5 dark:bg-zinc-900">
                <p className="mb-3 font-inter text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Comodidades
                </p>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((a) => (
                    <span
                      key={a.amenityId}
                      className="rounded-full border border-border px-3 py-1 font-inter text-xs text-muted-foreground"
                    >
                      {a.amenity?.label ?? a.amenityId}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {property.proximities.length > 0 && (
              <div className="rounded-xl border border-border bg-white p-5 dark:bg-zinc-900">
                <p className="mb-3 font-inter text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Proximidades
                </p>
                <div className="flex flex-wrap gap-2">
                  {property.proximities.map((p) => (
                    <span
                      key={p.proximityId}
                      className="rounded-full border border-border px-3 py-1 font-inter text-xs text-muted-foreground"
                    >
                      {p.proximity?.label ?? p.proximityId}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar ──────────────────────────────────────────────────── */}
          <aside className="space-y-5">

            {/* Ações */}
            <div className="rounded-xl border border-border bg-white p-4 dark:bg-zinc-900">
              <p className="mb-3 font-inter text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Ações
              </p>
              <div className="flex flex-col gap-2">
                {canEdit && (
                  <Link
                    href={`/admin/properties/${id}/edit`}
                    className="flex items-center justify-center gap-2 rounded border border-amber-400 bg-amber-400 px-4 py-2 font-inter text-xs font-medium text-stone-950 transition-colors hover:bg-amber-300"
                  >
                    <Pencil size={12} />
                    Editar imóvel
                  </Link>
                )}
                <Link
                  href={`/admin/properties/${id}/report`}
                  className="flex items-center justify-center gap-2 rounded border border-border px-4 py-2 font-inter text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                >
                  <FileBarChart2 size={12} />
                  Relatório
                </Link>
                <a
                  href={`/imoveis/${property.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded border border-border px-4 py-2 font-inter text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                >
                  <ExternalLink size={12} />
                  Ver no site
                </a>
                <CopyLinkButton
                  url={`${BASE}/imoveis/${property.slug}`}
                  className="w-full justify-center"
                />
              </div>
            </div>

            {/* Visualizações */}
            <div className="rounded-xl border border-border bg-white p-4 dark:bg-zinc-900">
              <p className="mb-3 font-inter text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Visualizações no site
              </p>
              <p className="font-cormorant text-3xl font-semibold text-foreground">
                {property.viewCount.toLocaleString("pt-BR")}
              </p>
              {property.lastViewedAt && (
                <p className="mt-1 font-inter text-[11px] text-muted-foreground">
                  Último acesso: {fmt(property.lastViewedAt)}
                </p>
              )}
            </div>

            {/* Leads */}
            <div className="rounded-xl border border-border bg-white p-4 dark:bg-zinc-900">
              <p className="mb-3 font-inter text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Leads interessados
              </p>
              <p className="font-cormorant text-3xl font-semibold text-foreground">
                {property._count.interests}
              </p>
            </div>

            {/* Proprietário */}
            {property.owner && (
              <div className="rounded-xl border border-border bg-white p-4 dark:bg-zinc-900">
                <p className="mb-3 font-inter text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Proprietário
                </p>
                <div className="space-y-1.5">
                  <p className="flex items-center gap-2 font-inter text-sm font-medium text-foreground">
                    <User size={13} className="text-muted-foreground" />
                    {property.owner.name}
                  </p>
                  {property.owner.phone && (
                    <p className="flex items-center gap-2 font-inter text-xs text-muted-foreground">
                      <Phone size={11} />
                      {property.owner.phone}
                    </p>
                  )}
                  {property.owner.email && (
                    <p className="flex items-center gap-2 font-inter text-xs text-muted-foreground">
                      <Mail size={11} />
                      {property.owner.email}
                    </p>
                  )}
                  <Link
                    href={`/admin/owners/${property.owner.id}/edit`}
                    className="mt-2 inline-block font-inter text-[11px] text-amber-600 hover:text-amber-500"
                  >
                    Ver ficha →
                  </Link>
                </div>
              </div>
            )}

            {/* Corretor */}
            {property.agent && (
              <div className="rounded-xl border border-border bg-white p-4 dark:bg-zinc-900">
                <p className="mb-3 font-inter text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Corretor responsável
                </p>
                <p className="flex items-center gap-2 font-inter text-sm font-medium text-foreground">
                  <User size={13} className="text-muted-foreground" />
                  {property.agent.name}
                </p>
                {property.agent.email && (
                  <p className="mt-1 flex items-center gap-2 font-inter text-xs text-muted-foreground">
                    <Mail size={11} />
                    {property.agent.email}
                  </p>
                )}
              </div>
            )}

            {/* Detalhes internos */}
            <div className="rounded-xl border border-border bg-white p-4 dark:bg-zinc-900">
              <p className="mb-2 font-inter text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Detalhes internos
              </p>
              <BoolRow label="Financiamento"  value={property.acceptsFinancing} />
              <BoolRow label="Exclusivo"      value={property.exclusive} />
              <BoolRow label="Averbada"       value={property.averbada} />
              <BoolRow label="Escritura"      value={property.escritura} />
              <BoolRow label="Placa"          value={property.placaImobiliaria} />
              {property.localChaves && (
                <InfoRow label="Local das chaves" value={property.localChaves} />
              )}
              {property.reviewIntervalDays != null && (
                <InfoRow label="Revisão a cada" value={`${property.reviewIntervalDays} dias`} />
              )}
            </div>

            {/* SEO */}
            {(property.seoTitle || property.seoDescription) && (
              <div className="rounded-xl border border-border bg-white p-4 dark:bg-zinc-900">
                <p className="mb-2 font-inter text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  SEO
                </p>
                {property.seoTitle && (
                  <div className="mb-2">
                    <p className="font-inter text-[10px] text-muted-foreground/60">Título</p>
                    <p className="font-inter text-xs text-foreground">{property.seoTitle}</p>
                  </div>
                )}
                {property.seoDescription && (
                  <div>
                    <p className="font-inter text-[10px] text-muted-foreground/60">Descrição</p>
                    <p className="font-inter text-xs leading-relaxed text-foreground">{property.seoDescription}</p>
                  </div>
                )}
              </div>
            )}

            {/* Datas */}
            <div className="rounded-xl border border-border bg-white p-4 dark:bg-zinc-900">
              <p className="mb-2 font-inter text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Datas
              </p>
              <InfoRow label="Criado" value={fmt(property.createdAt)} />
              <InfoRow label="Atualizado" value={fmt(property.updatedAt)} />
              {property.createdBy && (
                <InfoRow label="Por" value={property.createdBy.name} />
              )}
            </div>

            {/* URL */}
            <div className="rounded-xl border border-border bg-white p-4 dark:bg-zinc-900">
              <p className="mb-1.5 font-inter text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                URL
              </p>
              <p className="break-all font-mono text-[10px] text-muted-foreground">
                /imoveis/{property.slug}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
