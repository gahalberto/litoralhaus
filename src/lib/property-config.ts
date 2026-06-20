import { PropertyType, PropertyStatus, PropertyPurpose, Region } from "@prisma/client";

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  APARTMENT: "Apartamento",
  HOUSE:     "Casa",
  PENTHOUSE: "Cobertura",
  LAND:      "Terreno",
  COMMERCIAL:"Comercial",
  CONDO:     "Condomínio",
};

export const PROPERTY_TYPE_PLURAL: Record<PropertyType, string> = {
  APARTMENT: "Apartamentos",
  HOUSE:     "Casas",
  PENTHOUSE: "Coberturas",
  LAND:      "Terrenos",
  COMMERCIAL:"Imóveis Comerciais",
  CONDO:     "Condomínios",
};

export const PROPERTY_STATUS_CONFIG: Record<
  PropertyStatus,
  { label: string; badge: string; dot: string }
> = {
  DISPONIVEL: {
    label: "Disponível",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300",
    dot:   "bg-emerald-400",
  },
  RESERVADO: {
    label: "Reservado",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300",
    dot:   "bg-amber-400",
  },
  VENDIDO: {
    label: "Vendido",
    badge: "bg-stone-100 text-stone-500 dark:bg-stone-700/40 dark:text-stone-400",
    dot:   "bg-stone-400",
  },
  ALUGADO: {
    label: "Alugado",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300",
    dot:   "bg-blue-400",
  },
  DESISTENCIA: {
    label: "Desistência",
    badge: "bg-red-100 text-red-700 dark:bg-red-400/10 dark:text-red-300",
    dot:   "bg-red-400",
  },
  OUTROS: {
    label: "Outros",
    badge: "bg-zinc-100 text-zinc-500 dark:bg-zinc-700/40 dark:text-zinc-400",
    dot:   "bg-zinc-400",
  },
};

export const REGION_LABELS: Record<Region, string> = {
  GUARUJA:       "Guarujá",
  SANTOS:        "Santos",
  SAO_VICENTE:   "São Vicente",
  PRAIA_GRANDE:  "Praia Grande",
  BERTIOGA:      "Bertioga",
  UBATUBA:       "Ubatuba",
  CARAGUATATUBA: "Caraguatatuba",
  SAO_SEBASTIAO: "São Sebastião",
  ILHABELA:      "Ilhabela",
};

export const PURPOSE_CONFIG: Record<
  PropertyPurpose,
  { label: string; badge: string; dot: string; icon: string }
> = {
  VENDA: {
    label: "Venda",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300",
    dot:   "bg-blue-400",
    icon:  "🏷️",
  },
  LOCACAO: {
    label: "Locação",
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300",
    dot:   "bg-violet-400",
    icon:  "🔑",
  },
  TEMPORADA: {
    label: "Temporada",
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-400/10 dark:text-orange-300",
    dot:   "bg-orange-400",
    icon:  "🌴",
  },
};

export const PRICE_RANGES = [
  { label: "Até R$ 500k",     min: 0,       max: 500_000   },
  { label: "R$ 500k – R$ 1M", min: 500_000, max: 1_000_000 },
  { label: "R$ 1M – R$ 2M",   min: 1_000_000, max: 2_000_000 },
  { label: "R$ 2M – R$ 5M",   min: 2_000_000, max: 5_000_000 },
  { label: "Acima de R$ 5M",  min: 5_000_000, max: undefined },
] as const;

export function formatPrice(value: number | string | null | undefined): string {
  if (value == null || value === "") return "—";
  const num = typeof value === "string" ? parseFloat(value) : Number(value);
  if (isNaN(num)) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}
