import { z } from "zod";
import { LeadStatus, LeadSource, LeadType, BudgetRange, Region } from "@prisma/client";

export const leadEditSchema = z.object({
  name:        z.string().min(2, "Nome obrigatório"),
  phone:       z.string().min(8, "Telefone obrigatório"),
  email:       z.string().optional().or(z.literal("")),
  whatsapp:    z.string().optional(),
  type:        z.nativeEnum(LeadType),
  status:      z.nativeEnum(LeadStatus),
  source:      z.nativeEnum(LeadSource),
  budgetRange: z.union([z.nativeEnum(BudgetRange), z.literal("")]).optional(),
  regions:     z.array(z.nativeEnum(Region)),
  notes:       z.string().optional(),
});

export type LeadEditData = z.infer<typeof leadEditSchema>;

export const leadFormSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  phone: z
    .string()
    .min(10, "Telefone inválido")
    .regex(/^\d+$/, "Somente números"),
  budgetRange: z.enum(
    ["UP_TO_500K", "RANGE_500K_1M", "RANGE_1M_2M", "RANGE_2M_5M", "ABOVE_5M"],
    { error: "Selecione um orçamento" }
  ),
  regions: z
    .array(
      z.enum([
        "GUARUJA",
        "SANTOS",
        "SAO_VICENTE",
        "PRAIA_GRANDE",
        "BERTIOGA",
        "UBATUBA",
        "CARAGUATATUBA",
        "SAO_SEBASTIAO",
        "ILHABELA",
      ])
    )
    .min(1, "Selecione ao menos uma região"),
  notes: z.string().optional(),
});

export type LeadFormData = z.infer<typeof leadFormSchema>;

export type ActionResult =
  | { success: true; message: string }
  | { success: false; error: string };
