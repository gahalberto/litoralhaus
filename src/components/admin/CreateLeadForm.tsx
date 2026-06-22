"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leadEditSchema, type LeadEditData } from "@/types/lead";
import { createLead, findLeadsByPhone, type DuplicateLead } from "@/actions/leads";
import { LeadStatus, LeadSource, LeadType, BudgetRange, Region } from "@prisma/client";
import { LEAD_STATUS_CONFIG, BUDGET_LABELS } from "@/lib/lead-config";
import { PhoneInput } from "@/components/admin/PhoneInput";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const inputCls =
  "w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 font-inter text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 outline-none transition-colors focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 disabled:opacity-50";
const selectCls = cn(inputCls, "cursor-pointer appearance-none");

function Field({ label, error, hint, children }: {
  label: string; error?: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="font-inter text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
        {label}
      </Label>
      {children}
      {hint  && !error && <p className="font-inter text-[10px] text-zinc-400">{hint}</p>}
      {error && <p className="font-inter text-[10px] text-red-500">{error}</p>}
    </div>
  );
}

const SOURCE_LABELS: Record<LeadSource, string> = {
  LANDING_PAGE: "Site", WHATSAPP: "WhatsApp", INSTAGRAM: "Instagram",
  GOOGLE_ADS: "Google Ads", REFERRAL: "Indicação", DIRECT: "Direto", MANUAL: "Cadastro Manual",
};
const TYPE_LABELS: Record<LeadType, string> = {
  BUYER: "Comprador", SELLER: "Proprietário/Vendedor",
};
const REGION_LABELS: Record<Region, string> = {
  GUARUJA: "Guarujá", SANTOS: "Santos", SAO_VICENTE: "São Vicente",
  PRAIA_GRANDE: "Praia Grande", BERTIOGA: "Bertioga", UBATUBA: "Ubatuba",
  CARAGUATATUBA: "Caraguatatuba", SAO_SEBASTIAO: "São Sebastião", ILHABELA: "Ilhabela",
};

export function CreateLeadForm() {
  const router = useRouter();
  const [isPending, start] = useTransition();
  const [serverError, setServerError] = useState("");
  const [duplicates, setDuplicates] = useState<DuplicateLead[]>([]);

  async function handlePhoneBlur(phone: string) {
    const found = await findLeadsByPhone(phone);
    setDuplicates(found);
  }

  const { register, handleSubmit, control, formState: { errors } } = useForm<LeadEditData>({
    resolver: zodResolver(leadEditSchema),
    defaultValues: {
      name: "", phone: "", email: "", whatsapp: "",
      type: "BUYER", status: "NOVO", source: "MANUAL",
      budgetRange: "", regions: [], notes: "",
    },
  });

  function onSubmit(data: LeadEditData) {
    start(async () => {
      const res = await createLead(data);
      if (res.success) {
        router.push(`/admin/leads/${res.id}`);
      } else {
        setServerError(res.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome *" error={errors.name?.message}>
          <input {...register("name")} placeholder="João Silva" className={inputCls} />
        </Field>
        <Field label="Telefone *" error={errors.phone?.message}>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <PhoneInput
                value={field.value}
                onChange={field.onChange}
                onBlur={() => handlePhoneBlur(field.value)}
              />
            )}
          />
        </Field>
        <Field label="E-mail" error={errors.email?.message}>
          <input {...register("email")} type="email" placeholder="joao@email.com" className={inputCls} />
        </Field>
        <Field label="WhatsApp" error={errors.whatsapp?.message} hint="Preencha se diferente do telefone">
          <Controller
            name="whatsapp"
            control={control}
            render={({ field }) => (
              <PhoneInput value={field.value ?? ""} onChange={field.onChange} />
            )}
          />
        </Field>
        <Field label="Tipo" error={errors.type?.message}>
          <select {...register("type")} className={selectCls}>
            {Object.entries(TYPE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
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
            {Object.entries(SOURCE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </Field>
        <Field label="Orçamento">
          <select {...register("budgetRange")} className={selectCls}>
            <option value="">— Não informado —</option>
            {Object.entries(BUDGET_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </Field>
      </div>

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
                      "rounded-full border px-3 py-1 font-inter text-xs transition-all duration-150",
                      active
                        ? "border-amber-400 bg-amber-50 dark:bg-amber-400/10 text-amber-700 dark:text-amber-400 font-medium"
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-amber-300 hover:text-zinc-800 dark:hover:text-zinc-200"
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
        <Textarea
          {...register("notes")}
          rows={3}
          placeholder="Preferências, contexto do contato, observações relevantes..."
          className="font-inter text-sm"
        />
      </Field>

      {duplicates.length > 0 && (
        <div className="rounded-lg border border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 px-4 py-3 space-y-2">
          <p className="font-inter text-xs font-semibold text-amber-800 dark:text-amber-400">
            ⚠ Este telefone já está cadastrado em {duplicates.length === 1 ? "1 lead" : `${duplicates.length} leads`}:
          </p>
          {duplicates.map((dup) => (
            <div key={dup.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="font-inter text-xs font-medium text-amber-900 dark:text-amber-300">{dup.name}</span>
                <span className="ml-2 font-inter text-[10px] text-amber-700 dark:text-amber-400">
                  {LEAD_STATUS_CONFIG[dup.status]?.label ?? dup.status}
                </span>
                {dup.interactions.length > 0 && (
                  <span className="ml-2 font-inter text-[10px] text-amber-600 dark:text-amber-500">
                    · {dup.interactions.length} interaç{dup.interactions.length === 1 ? "ão" : "ões"}
                  </span>
                )}
              </div>
              <a
                href={`/admin/leads/${dup.id}`}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 font-inter text-[11px] font-medium text-amber-700 dark:text-amber-400 underline underline-offset-2 hover:text-amber-900 dark:hover:text-amber-200"
              >
                Ver lead →
              </a>
            </div>
          ))}
          <p className="font-inter text-[10px] text-amber-600 dark:text-amber-500">
            Você pode continuar criando um novo lead ou acessar o existente para registrar um novo contato.
          </p>
        </div>
      )}

      {serverError && (
        <p className="rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-4 py-3 font-inter text-sm text-red-600 dark:text-red-400">
          {serverError}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={isPending} className="bg-amber-500 hover:bg-amber-600 text-white">
          {isPending ? "Criando..." : "Criar Lead"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/leads?view=list")}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
