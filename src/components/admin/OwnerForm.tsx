"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ownerSchema, type OwnerFormData } from "@/types/owner";
import { createOwner, updateOwner } from "@/actions/owners";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const inputCls =
  "w-full rounded-md border border-input bg-background px-3 py-2 font-inter text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring disabled:opacity-50";

function Field({ label, error, hint, children }: {
  label: string; error?: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="font-inter text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
      {hint && !error && <p className="font-inter text-[10px] text-muted-foreground/60">{hint}</p>}
      {error && <p className="font-inter text-[10px] text-destructive">{error}</p>}
    </div>
  );
}

// Formata telefone igual ao PropertyForm
function formatPhone(digits: string, cc: string): string {
  const d = digits.slice(0, 13);
  if (cc !== "55") return d;
  const br = d.slice(0, 11);
  if (br.length === 0)  return "";
  if (br.length <= 2)   return br;
  if (br.length <= 6)   return `${br.slice(0, 2)} ${br.slice(2)}`;
  if (br.length <= 10)  return `${br.slice(0, 2)} ${br.slice(2, 6)}-${br.slice(6)}`;
  return `${br.slice(0, 2)} ${br.slice(2, 7)}-${br.slice(7)}`;
}

function parsePhone(stored: string): { cc: string; local: string } {
  const s = stored.trim();
  if (!s) return { cc: "55", local: "" };
  const m = s.match(/^\+?(\d{1,4})(\d*)$/);
  if (m) return { cc: m[1], local: m[2] };
  return { cc: "55", local: s.replace(/\D/g, "") };
}

// Classe do campo de código do país — sem w-full para não conflitar com a largura explícita
const ccInputCls =
  "rounded-md border border-input bg-background py-2 font-inter text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring disabled:opacity-50";

function PhoneField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const parsed = parsePhone(value);
  const [cc, setCc]       = useState(parsed.cc);
  const [local, setLocal] = useState(parsed.local);

  function save(newCc: string, newLocal: string) {
    const digits = newLocal.replace(/\D/g, "");
    onChange(digits.length > 0 ? `+${newCc}${digits}` : "");
  }

  return (
    <div className="flex gap-2">
      {/* Código do país — largura fixa, sem w-full */}
      <div className="relative shrink-0">
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 select-none font-inter text-sm text-muted-foreground">
          +
        </span>
        <input
          type="text"
          inputMode="numeric"
          value={cc}
          placeholder="55"
          onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 4); setCc(v); save(v, local); }}
          className={`${ccInputCls} w-14 pl-6 pr-1 text-center`}
        />
      </div>
      {/* Número — ocupa todo o espaço restante */}
      <input
        type="tel"
        inputMode="numeric"
        value={formatPhone(local, cc)}
        onChange={(e) => { const r = e.target.value.replace(/\D/g, ""); setLocal(r); save(cc, r); }}
        placeholder={cc === "55" ? "13 99999-9999" : "número"}
        className={`${inputCls} flex-1 min-w-0`}
      />
    </div>
  );
}

interface Props {
  initialData?: OwnerFormData & { id: string };
}

export function OwnerForm({ initialData }: Props) {
  const router = useRouter();
  const [isPending, start] = useTransition();
  const [serverError, setServerError] = useState("");
  const isEdit = !!initialData;

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<OwnerFormData>({
    resolver: zodResolver(ownerSchema),
    defaultValues: initialData ?? { name: "", phone: "", email: "", cpf: "", notes: "" },
  });

  const phone = watch("phone") ?? "";

  function onSubmit(data: OwnerFormData) {
    start(async () => {
      const res = isEdit
        ? await updateOwner(initialData.id, data)
        : await createOwner(data);
      if (res.success) {
        router.push(`/admin/owners/${res.id}/edit`);
      } else {
        setServerError(res.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nome *" error={errors.name?.message}>
          <input {...register("name")} placeholder="João Silva" className={inputCls} />
        </Field>
        <Field label="Telefone / WhatsApp *" error={errors.phone?.message} hint="Código do país + DDD + número">
          <PhoneField value={phone} onChange={(v) => setValue("phone", v, { shouldValidate: true })} />
        </Field>
        <Field label="E-mail" error={errors.email?.message}>
          <input {...register("email")} type="email" placeholder="joao@email.com" className={inputCls} />
        </Field>
        <Field label="CPF / CNPJ" error={errors.cpf?.message}>
          <input {...register("cpf")} placeholder="000.000.000-00" className={inputCls} />
        </Field>
      </div>
      <Field label="Observações">
        <Textarea {...register("notes")} rows={3} placeholder="Preferências, disponibilidade, observações..." className="font-inter text-sm" />
      </Field>

      {serverError && <p className="font-inter text-sm text-destructive">{serverError}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar proprietário"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/owners")}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
