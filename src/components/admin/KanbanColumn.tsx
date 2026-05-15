import type { Lead } from "@prisma/client";
import { LeadCard } from "./LeadCard";
import { LEAD_STATUS_CONFIG } from "@/lib/lead-config";
import { cn } from "@/lib/utils";
import type { LeadStatus } from "@prisma/client";

type ColumnLead = Pick<
  Lead,
  "id" | "name" | "phone" | "status" | "budgetRange" | "regions" | "createdAt" | "score"
>;

type KanbanColumnProps = {
  status: LeadStatus;
  leads: ColumnLead[];
};

export function KanbanColumn({ status, leads }: KanbanColumnProps) {
  const cfg = LEAD_STATUS_CONFIG[status];

  return (
    <div
      className={cn(
        "flex w-72 shrink-0 flex-col rounded border-t-2 border-border bg-background",
        cfg.column
      )}
    >
      {/* Column header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", cfg.dot)} />
          <span className="font-inter text-xs font-medium text-foreground">{cfg.label}</span>
        </div>
        <span className="rounded-full bg-muted px-2 py-0.5 font-inter text-[10px] tabular-nums text-muted-foreground">
          {leads.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {leads.length === 0 ? (
          <div className="rounded border border-dashed border-border py-8 text-center">
            <p className="font-inter text-xs text-muted-foreground/40">Sem leads</p>
          </div>
        ) : (
          leads.map((lead) => <LeadCard key={lead.id} lead={lead} />)
        )}
      </div>
    </div>
  );
}
