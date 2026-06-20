import { z } from "zod";
import { PropertyType, PropertyStatus, PropertyPurpose, Region } from "@prisma/client";

// Campos numéricos chegam como string do input HTML.
// A Server Action faz a coerção — no schema do form ficam como string opcional.
const optNum = z.string().optional();

export const propertyFormSchema = z.object({
  // Identificação
  title:    z.string().min(5, "Mínimo 5 caracteres"),
  slug:     z.string().min(3, "Mínimo 3 caracteres")
              .regex(/^[a-z0-9-]+$/, "Apenas minúsculas, números e hífens"),
  type:     z.nativeEnum(PropertyType, { error: "Selecione o tipo" }),
  purposes: z.array(z.nativeEnum(PropertyPurpose)).min(1, "Selecione ao menos uma finalidade"),
  status:   z.nativeEnum(PropertyStatus),
  active:           z.boolean(),
  isIsca:           z.boolean(),
  featured:         z.boolean(),
  acceptsFinancing: z.boolean(),
  exclusive:        z.boolean(),

  // Categoria dinâmica
  categoryId: z.string().optional(),

  // Revisão periódica
  reviewIntervalDays: z.string().optional(),

  // Localização
  region:            z.nativeEnum(Region, { error: "Selecione a região" }),
  cep:               z.string().optional(),
  city:              z.string().min(2, "Obrigatório"),
  neighborhood:      z.string().min(2, "Obrigatório"),
  address:           z.string().optional(),
  addressNumber:     z.string().optional(),
  showAddressNumber: z.boolean(),

  // Características (string → Number na action)
  bedrooms:     optNum,
  bathrooms:    optNum,
  suites:       optNum,
  parkingSpots: optNum,
  areaTotal:    optNum,
  areaUsable:   optNum,

  // Financeiro (string → Number na action)
  priceAsk:  optNum,
  priceRent: optNum,
  condoFee:  optNum,
  iptu:      optNum,

  // Conteúdo
  description:  z.string().optional(),
  highlightIds: z.array(z.string()),
  amenityIds:   z.array(z.string()),

  // Dados privativos
  averbada:         z.boolean(),
  escritura:        z.boolean(),
  placaImobiliaria: z.boolean(),
  localChaves:      z.string().optional(),

  // Proximidades
  proximityIds: z.array(z.string()),

  // Responsáveis (somente admin)
  ownerId:    z.string().optional(),
  ownerName:  z.string().optional(),
  ownerPhone: z.string().optional(),
  agentId:    z.string().optional(),

  // Coordenadas (preenchidas automaticamente pelo geocoding do CEP)
  latitude:  z.number().optional(),
  longitude: z.number().optional(),

  // SEO
  seoTitle:       z.string().max(70, "Máximo 70 caracteres para SEO").optional(),
  seoDescription: z.string().max(160, "Máximo 160 caracteres para SEO").optional(),

  // Mídia (uma URL por linha)
  imagesRaw: z.string().optional(),
});

export type PropertyFormData = z.infer<typeof propertyFormSchema>;

export type PropertyActionResult =
  | { success: true; id: string }
  | { success: false; error: string };
