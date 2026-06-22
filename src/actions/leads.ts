"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { LeadStatus, LeadSource, LeadType } from "@prisma/client";
import { leadEditSchema } from "@/types/lead";
export type { LeadEditData } from "@/types/lead";

// ─── Criar lead ───────────────────────────────────────────────────────────────

export type CreateLeadResult = { success: true; id: string } | { success: false; error: string };

export async function createLead(raw: unknown): Promise<CreateLeadResult> {
  const parsed = leadEditSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  const d = parsed.data;
  try {
    const lead = await prisma.lead.create({
      data: {
        name:        d.name,
        phone:       d.phone,
        email:       d.email    || null,
        whatsapp:    d.whatsapp || null,
        type:        d.type,
        status:      d.status,
        source:      d.source,
        budgetRange: d.budgetRange || null,
        regions:     d.regions,
        notes:       d.notes || null,
      },
    });
    revalidatePath("/admin/leads");
    return { success: true, id: lead.id };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Erro ao criar lead" };
  }
}

// ─── Busca / listagem ─────────────────────────────────────────────────────────

export async function searchLeads(params: {
  q?:       string;
  status?:  LeadStatus;
  type?:    LeadType;
  source?:  LeadSource;
  take?:    number;
}) {
  const { q, status, type, source, take = 200 } = params;
  return prisma.lead.findMany({
    where: {
      ...(q && {
        OR: [
          { name:  { contains: q, mode: "insensitive" } },
          { phone: { contains: q } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      }),
      ...(status && { status }),
      ...(type   && { type   }),
      ...(source && { source }),
    },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true, name: true, phone: true, email: true,
      type: true, status: true, source: true,
      budgetRange: true, regions: true,
      createdAt: true, score: true,
      _count: { select: { interests: true, interactions: true } },
    },
  });
}

// ─── Detalhe completo ─────────────────────────────────────────────────────────

export async function getLeadById(id: string) {
  return prisma.lead.findUnique({
    where: { id },
    include: {
      interactions: { orderBy: { createdAt: "desc" } },
      interests: {
        include: {
          property: {
            select: {
              id: true, title: true, slug: true, type: true,
              status: true, city: true, neighborhood: true, priceAsk: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      assignedUser: { select: { id: true, name: true } },
    },
  });
}

export type LeadEditResult = { success: true } | { success: false; error: string };

// ─── Atualizar lead ───────────────────────────────────────────────────────────

export async function updateLead(id: string, raw: unknown): Promise<LeadEditResult> {
  const parsed = leadEditSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  const d = parsed.data;
  try {
    await prisma.lead.update({
      where: { id },
      data: {
        name:        d.name,
        phone:       d.phone,
        email:       d.email    || null,
        whatsapp:    d.whatsapp || null,
        type:        d.type,
        status:      d.status,
        source:      d.source,
        budgetRange: d.budgetRange || null,
        regions:     d.regions,
        notes:       d.notes || null,
      },
    });
    revalidatePath("/admin/leads");
    revalidatePath(`/admin/leads/${id}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Erro ao salvar" };
  }
}

// ─── Criar interação ──────────────────────────────────────────────────────────

const interactionSchema = z.object({
  leadId:      z.string().min(1),
  channel:     z.enum(["WHATSAPP", "EMAIL", "PHONE", "VISIT", "VIDEO_CALL", "NOTE"]),
  direction:   z.enum(["INBOUND", "OUTBOUND"]),
  summary:     z.string().min(3, "Descreva o contato"),
  nextStep:    z.string().optional(),
  nextStepAt:  z.string().optional(),
  performedBy: z.string().min(2, "Informe quem realizou"),
});

export type InteractionResult = { success: true } | { success: false; error: string };

export async function createInteraction(raw: unknown): Promise<InteractionResult> {
  const parsed = interactionSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  const d = parsed.data;
  try {
    await prisma.interaction.create({
      data: {
        leadId:      d.leadId,
        channel:     d.channel,
        direction:   d.direction,
        summary:     d.summary,
        nextStep:    d.nextStep    || undefined,
        nextStepAt:  d.nextStepAt  ? new Date(d.nextStepAt) : undefined,
        performedBy: d.performedBy,
      },
    });
    revalidatePath(`/admin/leads/${d.leadId}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Erro ao salvar" };
  }
}

// ─── Duplicados por telefone ──────────────────────────────────────────────────

export type DuplicateLead = {
  id:         string;
  name:       string;
  phone:      string;
  status:     LeadStatus;
  createdAt:  Date;
  interactions: {
    id:          string;
    channel:     string;
    direction:   string;
    summary:     string;
    nextStep:    string | null;
    nextStepAt:  Date   | null;
    performedBy: string;
    createdAt:   Date;
    completedAt: Date | null;
  }[];
};

export async function findLeadsByPhone(
  phone: string,
  excludeId?: string,
): Promise<DuplicateLead[]> {
  // usa os últimos 8 dígitos para tolerar variações de formatação
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 6) return [];
  const tail = digits.slice(-8);

  const leads = await prisma.lead.findMany({
    where: {
      phone:       { contains: tail },
      ...(excludeId && { id: { not: excludeId } }),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, phone: true, status: true, createdAt: true,
      interactions: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true, channel: true, direction: true, summary: true,
          nextStep: true, nextStepAt: true, performedBy: true, createdAt: true,
          completedAt: true,
        },
      },
    },
  });

  return leads;
}

// ─── Excluir lead ─────────────────────────────────────────────────────────────

export async function deleteLead(id: string): Promise<void> {
  await prisma.lead.delete({ where: { id } });
  revalidatePath("/admin/leads");
}
