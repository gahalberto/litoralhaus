"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { LeadStatus } from "@prisma/client";

export async function updateLeadStatus(leadId: string, status: LeadStatus) {
  if (!Object.values(LeadStatus).includes(status)) {
    throw new Error("Status inválido");
  }

  await prisma.lead.update({
    where: { id: leadId },
    data: { status },
  });

  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}
