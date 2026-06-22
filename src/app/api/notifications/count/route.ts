import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  // Só retorna para usuários autenticados
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token || !(await verifySession(token))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const [unreadContacts, newLeads, overdueTasks] = await Promise.all([
    // Mensagens não lidas no formulário de contato
    prisma.contact.count({ where: { read: false } }),

    // Leads novos (status NOVO)
    prisma.lead.count({ where: { status: "NOVO" } }),

    // Tarefas atrasadas na agenda (nextStepAt < agora, não concluídas)
    prisma.interaction.count({
      where: {
        nextStepAt:  { not: null, lt: now },
        completedAt: null,
      },
    }),
  ]);

  const total = unreadContacts + newLeads + overdueTasks;

  return NextResponse.json({
    total,
    unreadContacts,
    newLeads,
    overdueTasks,
  });
}
