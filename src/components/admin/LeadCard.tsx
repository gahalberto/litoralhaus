"use client";

import { useTransition } from "react";
import type { Lead } from "@prisma/client";
import { LeadStatus } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateLeadStatus } from "@/actions/update-lead-status";
import { LEAD_STATUS_CONFIG, BUDGET_LABELS, REGION_LABELS } from "@/lib/lead-config";
import { cn } from "@/lib/utils";

type LeadCardProps = {
  lead: Pick<Lead, "id" | "name" | "phone" | "status" | "budgetRange" | "regions" | "createdAt" | "score">;
};

export function LeadCard({ lead }: LeadCardProps) {
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(value: string | null) {
    if (!value) return;
    startTransition(() => updateLeadStatus(lead.id, value as LeadStatus));
  }

  const daysAgo = Math.floor(
    (Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <article
      className={cn(
        "group rounded border border-border bg-card p-4 transition-all duration-150 hover:border-border/60 hover:bg-accent/20",
        isPending && "opacity-60"
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <p className="font-inter text-sm font-medium leading-snug text-card-foreground">
          {lead.name}
        </p>
        {lead.score > 0 && (
          <span className="shrink-0 rounded bg-amber-100 px-1.5 py-0.5 font-inter text-[9px] font-medium tabular-nums text-amber-700 dark:bg-amber-400/10 dark:text-amber-400">
            {lead.score}pts
          </span>
        )}
      </div>

      {/* Meta */}
      <div className="mb-3 space-y-1">
        <p className="font-inter text-xs text-muted-foreground">
          {lead.budgetRange ? BUDGET_LABELS[lead.budgetRange] : "—"}
        </p>
        {lead.regions.length > 0 && (
          <p className="font-inter text-xs text-muted-foreground/60">
            {lead.regions.slice(0, 2).map((r) => REGION_LABELS[r]).join(", ")}
            {lead.regions.length > 2 && ` +${lead.regions.length - 2}`}
          </p>
        )}
      </div>

      {/* Phone / WhatsApp */}
      <a
        href={`https://wa.me/55${lead.phone}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mb-3 flex items-center gap-1.5 font-inter text-xs text-muted-foreground transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
          <path d="M6 0C2.686 0 0 2.686 0 6c0 1.06.277 2.053.762 2.912L0 12l3.176-.746A5.97 5.97 0 006 12c3.314 0 6-2.686 6-6S9.314 0 6 0zm2.94 8.373c-.12.337-.7.643-1.004.677-.27.03-.617.042-.994-.062a9.12 9.12 0 01-.9-.332C4.7 8.126 3.667 6.857 3.584 6.748c-.082-.11-.67-.892-.67-1.702 0-.81.424-1.208.574-1.372.15-.164.327-.205.437-.205l.312.006c.1.004.235-.038.368.28.137.325.464 1.127.505 1.209.04.082.068.178.013.288-.055.11-.082.178-.164.274-.082.096-.172.215-.246.289-.082.082-.167.17-.072.334.096.164.424.7.91 1.133.624.556 1.15.728 1.315.81.164.082.26.068.356-.04.096-.11.41-.48.52-.643.11-.164.22-.137.37-.082.15.055.95.448 1.114.53.164.082.274.123.315.192.04.07.04.397-.08.734z" />
        </svg>
        {lead.phone}
      </a>

      {/* Footer: status selector + age */}
      <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
        <Select value={lead.status} onValueChange={handleStatusChange} disabled={isPending}>
          <SelectTrigger className="h-7 w-full px-2 font-inter text-[11px] focus:ring-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.values(LeadStatus).map((s) => (
              <SelectItem key={s} value={s} className="font-inter text-[11px]">
                <span className="flex items-center gap-2">
                  <span className={cn("h-1.5 w-1.5 rounded-full", LEAD_STATUS_CONFIG[s].dot)} />
                  {LEAD_STATUS_CONFIG[s].label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="shrink-0 font-inter text-[10px] text-muted-foreground/40">
          {daysAgo === 0 ? "hoje" : `${daysAgo}d`}
        </span>
      </div>
    </article>
  );
}
