/**
 * Mapeamento bidirecional entre slugs de URL e enums do Prisma.
 * URL: /comprar/guaruja/apartamentos
 * DB:  region=GUARUJA, type=APARTMENT
 */

import type { PropertyType, Region } from "@prisma/client";

export const REGION_SLUG: Record<string, Region> = {
  "guaruja":        "GUARUJA",
  "santos":         "SANTOS",
  "sao-vicente":    "SAO_VICENTE",
  "praia-grande":   "PRAIA_GRANDE",
  "bertioga":       "BERTIOGA",
  "ubatuba":        "UBATUBA",
  "caraguatatuba":  "CARAGUATATUBA",
  "sao-sebastiao":  "SAO_SEBASTIAO",
  "ilhabela":       "ILHABELA",
};

export const TYPE_SLUG: Record<string, PropertyType> = {
  "apartamentos": "APARTMENT",
  "casas":        "HOUSE",
  "coberturas":   "PENTHOUSE",
  "terrenos":     "LAND",
  "comercial":    "COMMERCIAL",
  "condominios":  "CONDO",
};

// Inversos para montar URLs
export const REGION_TO_SLUG = Object.fromEntries(
  Object.entries(REGION_SLUG).map(([k, v]) => [v, k])
) as Record<Region, string>;

export const TYPE_TO_SLUG = Object.fromEntries(
  Object.entries(TYPE_SLUG).map(([k, v]) => [v, k])
) as Record<PropertyType, string>;

// Labels legíveis para headings
export const TYPE_LABEL_PLURAL: Record<PropertyType, string> = {
  APARTMENT: "Apartamentos",
  HOUSE:     "Casas",
  PENTHOUSE: "Coberturas",
  LAND:      "Terrenos",
  COMMERCIAL:"Imóveis Comerciais",
  CONDO:     "Condomínios",
};
