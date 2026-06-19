"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leadEditSchema, type LeadEditData, updateLead } from "@/actions/leads";
import { LeadStatus, LeadSource, LeadType, BudgetRange, Region } from "@prisma/client";
import { LEAD_STATUS_CONFIG, BUDGET_LABELS } from "@/lib/lead-config";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const inputCls =
  "w-full rounded-md border border-input bg-background px-3 py-2 font-inter text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring disabled:opacity-50";
const selectCls = cn(inputCls, "cursor-pointer appearance-none");

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="font-inter text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
      {error && <p className="font-inter text-[10px] text-destructive">{error}</p>}
    </div>
  );
}

const SOURCE_LABELS: Record<LeadSource, string> = {
  LANDING_PAGE: "Landing Page", WHATSAPP: "WhatsApp", INSTAGRAM: "Instagram",
  GOOGLE_ADS: "Google Ads", REFERRAL: "Indicação", DIRECT: "Direto",
};
const TYPE_LABELS: Record<LeadType, string> = { BUYER: "Comprador", SELLER: "Proprietário/Vendedor" };
const REGION_LABELS: Record<Region, string> = {
  GUARUJA: "Guarujá", SANTOS: "Santos", SAO_VICENTE: "São Vicente",
  PRAIA_GRANDE: "Praia Grande", BERTIOGA: "Bertioga", UBATUBA: "Ubatuba",
  CARAGUATATUBA: "Caraguatatuba", SAO_SEBASTIAO: "São Sebastião", ILHABELA: "Ilhabela",
};

interface Props {
  leadId: string;
  defaultValues: LeadEditData;
}

export function LeadEditForm({ leadId, defaultValues }: Props) {
  const [isPending, start] = useTransition();
  const [saved, setSaved]  = useState(false);
  const [error, setError]  = useState("");

  const { register, handleSubmit, control, formState: { errors } } = useForm<LeadEditData>({
    resolver: zodResolver(leadEditSchema),
    defaultValues,
  });

  function onSubmit(data: LeadEditData) {
    start(async () => {
      const res = await updateLead(leadId, data);
      if (res.success) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
      else setError(res.error);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome *" error={errors.name?.message}>
          <input {...register("name")} className={inputCls} />
        </Field>
        <Field label="Telefone *" error={errors.phone?.message}>
          <input {...register("phone")} className={inputCls} />
        </Field>
        <Field label="E-mail" error={errors.email?.message}>
          <input {...register("email")} type="email" className={inputCls} />
        </Field>
        <Field label="WhatsApp" error={errors.whatsapp?.message}>
          <input {...register("whatsapp")} placeholder="Se diferente do telefone" className={inputCls} />
        </Field>
        <Field label="Tipo" error={errors.type?.message}>
          <select {...register("type")} className={selectCls}>
            {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </Field>
        <Field label="Status" error={errors.status?.message}>
          <select {...register("status")} className={selectCls}>
            {Object.values(LeadStatus).map((s) => (
              <option key={s} value={s}>{LEAD_STATUS_CONFIG[s].label}</option>
            ))}
          </select>
        </Field>
        <Field label="Origem" error={errors.source?.message}>
          <select {...register("source")} className={selectCls}>
            {Object.entries(SOURCE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </Field>
        <Field label="Orçamento" error={errors.budgetRange?.message}>
          <select {...register("budgetRange")} className={selectCls}>
            <option value="">— Não informado —</option>
            {Object.entries(BUDGET_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </Field>
      </div>

      {/* Regiões de interesse */}
      <Field label="Regiões de interesse">
        <Controller
          name="regions"
          control={control}
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {Object.entries(REGION_LABELS).map(([v, l]) => {
                const active = field.value.includes(v as Region);
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => {
                      const next = active
                        ? field.value.filter((r) => r !== v)
                        : [...field.value, v as Region];
                      field.onChange(next);
                    }}
                    className={cn(
                      "rounded-full border px-3 py-1 font-inter text-xs transition-colors",
                      active
                        ? "border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300"
                        : "border-border text-muted-foreground hover:border-amber-300"
                    )}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
          )}
        />
      </Field>

      <Field label="Observações">
        <Textarea {...register("notes")} rows={3} className="font-inter text-sm" />
      </Field>

      {error && <p className="font-inter text-sm text-destructive">{error}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : "Salvar"}
        </Button>
        {saved && <span className="font-inter text-xs text-emerald-600">✓ Salvo</span>}
      </div>
    </form>
  );
}
