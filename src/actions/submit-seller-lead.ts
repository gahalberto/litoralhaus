"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

const sellerLeadSchema = z.object({
  name:     z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  whatsapp: z
    .string()
    .min(10, "WhatsApp inválido")
    .regex(/^\d+$/, "Somente números"),
  city: z.enum(["GUARUJA", "SANTOS", "OUTRA"], {
    error: "Selecione a cidade",
  }),
});

export type SellerLeadFormData = z.infer<typeof sellerLeadSchema>;
export type SellerLeadResult =
  | { success: true }
  | { success: false; error: string };

export async function submitSellerLead(raw: unknown): Promise<SellerLeadResult> {
  const parsed = sellerLeadSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { name, whatsapp, city } = parsed.data;

  const regionMap = {
    GUARUJA: "GUARUJA",
    SANTOS:  "SANTOS",
    OUTRA:   "GUARUJA", // fallback — sem região específica
  } as const;

  try {
    await prisma.lead.create({
      data: {
        name,
        phone:    whatsapp,
        whatsapp,
        type:     "SELLER",
        status:   "NOVO",
        source:   "LANDING_PAGE",
        regions:  [regionMap[city]],
      },
    });

    return { success: true };
  } catch {
    return { success: false, error: "Erro ao registrar. Tente novamente." };
  }
}
