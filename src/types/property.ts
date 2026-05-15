import { z } from "zod";
import { PropertyType, PropertyStatus, Region } from "@prisma/client";

// Campos numéricos chegam como string do input HTML.
// A Server Action faz a coerção — no schema do form ficam como string opcional.
const optNum = z.string().optional();

export const propertyFormSchema = z.object({
  // Identificação
  title:    z.string().min(5, "Mínimo 5 caracteres"),
  slug:     z.string().min(3, "Mínimo 3 caracteres")
              .regex(/^[a-z0-9-]+$/, "Apenas minúsculas, números e hífens"),
  type:     z.nativeEnum(PropertyType, { error: "Selecione o tipo" }),
  status:   z.nativeEnum(PropertyStatus),
  isIsca:   z.boolean(),
  featured: z.boolean(),

  // Localização
  region:       z.nativeEnum(Region, { error: "Selecione a região" }),
  cep:          z.string().optional(),
  city:         z.string().min(2, "Obrigatório"),
  neighborhood: z.string().min(2, "Obrigatório"),
  address:      z.string().optional(),

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
