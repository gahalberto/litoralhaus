"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ─── Relatório completo do imóvel ─────────────────────────────────────────────

export async function getPropertyReport(propertyId: string) {
  const [property, leads, visits] = await Promise.all([
    prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true, title: true, slug: true, type: true, status: true,
        region: true, city: true, neighborhood: true,
        priceAsk: true, priceRent: true,
        _count: { select: { interests: true, visits: true } },
      },
    }),

    prisma.propertyInterest.findMany({
      where: { propertyId },
      orderBy: { createdAt: "desc" },
      include: {
        lead: {
          select: {
            id: true, name: true, phone: true, email: true,
            type: true, status: true, source: true, createdAt: true,
          },
        },
      },
    }),

    prisma.visit.findMany({
      where: { propertyId },
      orderBy: { visitedAt: "desc" },
      include: {
        lead: { select: { id: true, name: true, phone: true } },
      },
    }),
  ]);

  return { property, leads, visits };
}

// ─── Registrar visita ─────────────────────────────────────────────────────────

const visitSchema = z.object({
  propertyId:  z.string().min(1),
  leadId:      z.string().optional(),
  visitedAt:   z.string().min(1, "Informe a data da visita"),
  conductedBy: z.string().min(2, "Informe quem realizou a visita"),
  notes:       z.string().optional(),
});

export type VisitFormData = z.infer<typeof visitSchema>;
export type VisitResult = { success: true } | { success: false; error: string };

export async function createVisit(raw: unknown): Promise<VisitResult> {
  const parsed = visitSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const d = parsed.data;
  try {
    await prisma.visit.create({
      data: {
        propertyId:  d.propertyId,
        leadId:      d.leadId || undefined,
        visitedAt:   new Date(d.visitedAt),
        conductedBy: d.conductedBy,
        notes:       d.notes || undefined,
      },
    });
    revalidatePath(`/admin/properties/${d.propertyId}/report`);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Erro ao salvar" };
  }
}

export async function deleteVisit(visitId: string, propertyId: string): Promise<void> {
  await prisma.visit.delete({ where: { id: visitId } });
  revalidatePath(`/admin/properties/${propertyId}/report`);
}

// ─── Cadastrar lead e vincular ao imóvel ──────────────────────────────────────

const linkLeadSchema = z.object({
  propertyId: z.string().min(1),
  name:       z.string().min(2, "Nome obrigatório"),
  phone:      z.string().min(8, "Telefone obrigatório"),
  email:      z.string().email("E-mail inválido").optional().or(z.literal("")),
  type:       z.enum(["BUYER", "SELLER"]),
  notes:      z.string().optional(),
});

export type LinkLeadResult = { success: true } | { success: false; error: string };

export async function linkLeadToProperty(raw: unknown): Promise<LinkLeadResult> {
  const parsed = linkLeadSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const d = parsed.data;
  try {
    // Reutiliza lead existente pelo telefone ou cria novo
    const existing = await prisma.lead.findFirst({ where: { phone: d.phone } });

    const lead = existing ?? await prisma.lead.create({
      data: {
        name:   d.name,
        phone:  d.phone,
        email:  d.email || undefined,
        type:   d.type,
        notes:  d.notes || undefined,
        source: "DIRECT",
      },
    });

    // Vincula ao imóvel (ignora se já existir)
    await prisma.propertyInterest.upsert({
      where:  { leadId_propertyId: { leadId: lead.id, propertyId: d.propertyId } },
      create: { leadId: lead.id, propertyId: d.propertyId, notes: d.notes },
      update: {},
    });

    revalidatePath(`/admin/properties/${d.propertyId}/report`);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Erro ao salvar" };
  }
}
