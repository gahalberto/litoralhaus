"use server";

import { prisma } from "@/lib/prisma";
import { leadFormSchema, type ActionResult } from "@/types/lead";
import { headers } from "next/headers";

export async function submitLead(formData: unknown): Promise<ActionResult> {
  const parsed = leadFormSchema.safeParse(formData);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { name, email, phone, budgetRange, regions, notes } = parsed.data;

  const headersList = await headers();
  const referrerUrl = headersList.get("referer") ?? undefined;
  const utmSource = headersList.get("x-utm-source") ?? undefined;

  try {
    await prisma.lead.upsert({
      where: { email },
      update: {
        name,
        phone,
        budgetRange,
        regions,
        notes,
        status: "NOVO",
      },
      create: {
        name,
        email,
        phone,
        budgetRange,
        regions,
        notes,
        source: "LANDING_PAGE",
        referrerUrl,
        utmSource,
      },
    });

    return {
      success: true,
      message: "Recebemos seu contato! Nossa equipe entrará em contato em breve.",
    };
  } catch {
    return {
      success: false,
      error: "Erro ao registrar contato. Tente novamente ou fale via WhatsApp.",
    };
  }
}
