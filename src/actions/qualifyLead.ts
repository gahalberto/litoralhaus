"use server";

import { prisma } from "@/lib/prisma";
import { qualifyLeadSchema, type ActionResult } from "@/types/lead";

// Score simples: renda alta + entrada alta + comprador mais velho => mais qualificado
function computeStatus(income: number, downPayment: number): "NOVO" | "QUALIFICADO" {
  const hasIncome = income >= 4000;
  const hasDownPayment = downPayment > 0;
  return hasIncome && hasDownPayment ? "QUALIFICADO" : "NOVO";
}

export async function qualifyLead(formData: unknown): Promise<ActionResult> {
  const parsed = qualifyLeadSchema.safeParse(formData);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { name, whatsapp, goal, income, incomeTypes, incomeComposition, birthYear, downPayment } =
    parsed.data;

  try {
    await prisma.lead.create({
      data: {
        name,
        phone: whatsapp,
        whatsapp,
        source: "WHATSAPP",
        status: computeStatus(income, downPayment),
        goal,
        income,
        incomeTypes,
        incomeComposition,
        birthYear,
        downPayment,
      },
    });

    return {
      success: true,
      message: `Tudo certo, ${name.split(" ")[0]}! Recebi suas informações e vou analisar o seu perfil com cuidado. Te chamo no WhatsApp em breve.`,
    };
  } catch {
    return {
      success: false,
      error: "Erro ao registrar suas informações. Tente novamente ou fale via WhatsApp.",
    };
  }
}
