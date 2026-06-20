"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type PendingTask = {
  id:          string;
  nextStep:    string;
  nextStepAt:  Date;
  completedAt: Date | null;
  performedBy: string;
  channel:     string;
  summary:     string;
  createdAt:   Date;
  lead: {
    id:    string;
    name:  string;
    phone: string;
    status: string;
  };
};

// Retorna todas as tarefas agendadas (não concluídas), mais as concluídas nos últimos 7 dias
export async function getPendingTasks(): Promise<PendingTask[]> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return prisma.interaction.findMany({
    where: {
      nextStepAt: { not: null },
      OR: [
        { completedAt: null },
        { completedAt: { gte: sevenDaysAgo } },
      ],
    },
    orderBy: { nextStepAt: "asc" },
    select: {
      id:          true,
      nextStep:    true,
      nextStepAt:  true,
      completedAt: true,
      performedBy: true,
      channel:     true,
      summary:     true,
      createdAt:   true,
      lead: {
        select: {
          id:     true,
          name:   true,
          phone:  true,
          status: true,
        },
      },
    },
  }) as unknown as PendingTask[];
}

export type CompleteTaskResult = { success: true } | { success: false; error: string };

export async function completeTask(interactionId: string): Promise<CompleteTaskResult> {
  try {
    const interaction = await prisma.interaction.findUnique({
      where: { id: interactionId },
      select: { leadId: true },
    });
    if (!interaction) return { success: false, error: "Tarefa não encontrada" };

    await prisma.interaction.update({
      where: { id: interactionId },
      data:  { completedAt: new Date() },
    });

    revalidatePath("/admin/agenda");
    revalidatePath(`/admin/leads/${interaction.leadId}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Erro ao concluir tarefa" };
  }
}

export async function reopenTask(interactionId: string): Promise<CompleteTaskResult> {
  try {
    const interaction = await prisma.interaction.findUnique({
      where: { id: interactionId },
      select: { leadId: true },
    });
    if (!interaction) return { success: false, error: "Tarefa não encontrada" };

    await prisma.interaction.update({
      where: { id: interactionId },
      data:  { completedAt: null },
    });

    revalidatePath("/admin/agenda");
    revalidatePath(`/admin/leads/${interaction.leadId}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Erro ao reabrir tarefa" };
  }
}
