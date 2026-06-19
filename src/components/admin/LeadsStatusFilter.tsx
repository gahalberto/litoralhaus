"use client";

import { useRouter } from "next/navigation";
import { LeadStatus } from "@prisma/client";
import { LEAD_STATUS_CONFIG } from "@/lib/lead-config";

interface Props {
  current?: string;
  baseParams: Record<string, string>;
}

export function LeadsStatusFilter({ current, baseParams }: Props) {
  const router = useRouter();

  function handleChange(value: string) {
    const p = new URLSearchParams(baseParams);
    if (value) p.set("status", value);
    else p.delete("status");
    router.push(`/admin/leads?${p.toString()}`);
  }

  return (
    <select
      defaultValue={current ?? ""}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded-md border border-input bg-background px-2 py-1.5 font-inter text-sm text-foreground outline-none focus:border-ring cursor-pointer appearance-none"
    >
      <option value="">Todos os status</option>
      {Object.values(LeadStatus).map((s) => (
        <option key={s} value={s}>{LEAD_STATUS_CONFIG[s].label}</option>
      ))}
    </select>
  );
}
