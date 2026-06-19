import { LeadStatus } from "@prisma/client";

export const LEAD_STATUS_CONFIG: Record<
  LeadStatus,
  { label: string; dot: string; bar: string; badge: string; column: string }
> = {
  NOVO: {
    label: "Novo",
    dot: "bg-blue-400",
    bar: "bg-blue-400",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300",
    column: "border-t-blue-500",
  },
  EM_CONTATO: {
    label: "Em Contato",
    dot: "bg-indigo-400",
    bar: "bg-indigo-400",
    badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-300",
    column: "border-t-indigo-500",
  },
  QUALIFICADO: {
    label: "Qualificado",
    dot: "bg-violet-400",
    bar: "bg-violet-400",
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300",
    column: "border-t-violet-500",
  },
  VISITA_AGENDADA: {
    label: "Visita Agendada",
    dot: "bg-amber-400",
    bar: "bg-amber-400",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300",
    column: "border-t-amber-500",
  },
  PROPOSTA: {
    label: "Proposta",
    dot: "bg-orange-400",
    bar: "bg-orange-400",
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-400/10 dark:text-orange-300",
    column: "border-t-orange-500",
  },
  FECHADO_GANHO: {
    label: "Fechado (Ganho)",
    dot: "bg-emerald-400",
    bar: "bg-emerald-400",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300",
    column: "border-t-emerald-500",
  },
  FECHADO_PERDIDO: {
    label: "Fechado (Perdido)",
    dot: "bg-red-400",
    bar: "bg-red-400",
    badge: "bg-red-100 text-red-700 dark:bg-red-400/10 dark:text-red-300",
    column: "border-t-red-500",
  },
};

export const SOURCE_LABELS: Record<string, string> = {
  LANDING_PAGE: "Site",
  WHATSAPP: "WhatsApp",
  INSTAGRAM: "Instagram",
  GOOGLE_ADS: "Google Ads",
  REFERRAL: "Indicação",
  DIRECT: "Direto",
  MANUAL: "Cadastro Manual",
};

export const BUDGET_LABELS: Record<string, string> = {
  UP_TO_500K: "Até R$ 500k",
  RANGE_500K_1M: "R$ 500k – R$ 1M",
  RANGE_1M_2M: "R$ 1M – R$ 2M",
  RANGE_2M_5M: "R$ 2M – R$ 5M",
  ABOVE_5M: "Acima de R$ 5M",
};

export const REGION_LABELS: Record<string, string> = {
  GUARUJA: "Guarujá",
  SANTOS: "Santos",
  SAO_VICENTE: "São Vicente",
  PRAIA_GRANDE: "Praia Grande",
  BERTIOGA: "Bertioga",
  UBATUBA: "Ubatuba",
  CARAGUATATUBA: "Caraguatatuba",
  SAO_SEBASTIAO: "São Sebastião",
  ILHABELA: "Ilhabela",
};
