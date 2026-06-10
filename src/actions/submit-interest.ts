"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  propertyId: z.string().cuid(),
  name:       z.string().min(2, "Nome obrigatório"),
  whatsapp:   z.string().min(10, "WhatsApp inválido").regex(/^\d+$/, "Somente números"),
  message:    z.string().optional(),
});

export type InterestResult = { success: true } | { success: false; error: string };

export async function submitInterest(raw: unknown): Promise<InterestResult> {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const { propertyId, name, whatsapp, message } = parsed.data;

  try {
    const lead = await prisma.lead.create({
      data: {
        name,
        phone:    whatsapp,
        whatsapp,
        type:     "BUYER",
        status:   "NOVO",
        source:   "LANDING_PAGE",
        regions:  [],
        notes:    message,
      },
    });

    // Associa o interesse ao imóvel (ignora se já existir)
    await prisma.propertyInterest.upsert({
      where:  { leadId_propertyId: { leadId: lead.id, propertyId } },
      update: {},
      create: { leadId: lead.id, propertyId, notes: message },
    });

    return { success: true };
  } catch {
    return { success: false, error: "Erro ao registrar. Tente novamente." };
  }
}
