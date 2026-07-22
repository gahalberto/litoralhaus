"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bairroSchema, type BairroFormData } from "@/types/bairro";
import { createBairro, updateBairro, getBairrosParaSelecao } from "@/actions/bairros";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { slugify } from "@/lib/slugify";

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

interface Props {
  cidades: { id: string; nome: string }[];
  initialData?: BairroFormData & { id: string };
}

export function BairroForm({ cidades, initialData }: Props) {
  const router = useRouter();
  const [isPending, start] = useTransition();
  const [serverError, setServerError] = useState("");
  const isEdit = !!initialData;
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [proximos, setProximos] = useState<{ id: string; nome: string }[]>([]);

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<BairroFormData>({
    resolver: zodResolver(bairroSchema),
    defaultValues: initialData ?? {
      cidadeId: cidades[0]?.id ?? "",
      nome: "", slug: "", textoMorar: "",
      aluguelMedio: "", vendaMedia: "", metaTitle: "", metaDescription: "",
      latitude: "", longitude: "", ativo: false, bairrosProximosIds: [],
    },
  });

  const nome     = watch("nome");
  const cidadeId = watch("cidadeId");

  useEffect(() => {
    if (!cidadeId) { setProximos([]); return; }
    getBairrosParaSelecao(cidadeId, initialData?.id).then(setProximos);
  }, [cidadeId, initialData?.id]);

  function onSubmit(data: BairroFormData) {
    start(async () => {
      const res = isEdit
        ? await updateBairro(initialData.id, data)
        : await createBairro(data);
      if (res.success) {
        router.push(`/admin/bairros/${res.id}/edit`);
      } else {
        setServerError(res.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Cidade *" error={errors.cidadeId?.message}>
          <select {...register("cidadeId")} className={inputCls}>
            {cidades.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </Field>
        <div className="flex items-end gap-3 pb-2">
          <Controller
            name="ativo"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <Switch checked={field.value} onCheckedChange={field.onChange} />
                <Label className="font-inter text-sm text-foreground">Ativo (visível ao público)</Label>
              </div>
            )}
          />
        </div>
        <Field label="Nome *" error={errors.nome?.message}>
          <input
            {...register("nome")}
            placeholder="Astúrias"
            className={inputCls}
            onChange={(e) => {
              setValue("nome", e.target.value);
              if (!slugTouched) setValue("slug", slugify(e.target.value), { shouldValidate: true });
            }}
          />
        </Field>
        <Field label="Slug" error={errors.slug?.message} hint="Gerado automaticamente a partir do nome, se vazio.">
          <input
            {...register("slug")}
            placeholder="asturias"
            className={inputCls}
            onChange={(e) => { setSlugTouched(true); setValue("slug", e.target.value); }}
          />
        </Field>
        <Field label="Aluguel médio (R$)" error={errors.aluguelMedio?.message}>
          <input {...register("aluguelMedio")} inputMode="decimal" placeholder="3500" className={inputCls} />
        </Field>
        <Field label="Venda média (R$)" error={errors.vendaMedia?.message}>
          <input {...register("vendaMedia")} inputMode="decimal" placeholder="850000" className={inputCls} />
        </Field>
        <Field label="Latitude" error={errors.latitude?.message}>
          <input {...register("latitude")} placeholder="-23.9935" className={inputCls} />
        </Field>
        <Field label="Longitude" error={errors.longitude?.message}>
          <input {...register("longitude")} placeholder="-46.2564" className={inputCls} />
        </Field>
      </div>

      <Field label={`Como é morar em ${nome || "bairro"}`} error={errors.textoMorar?.message}>
        <Controller
          name="textoMorar"
          control={control}
          render={({ field }) => (
            <RichTextEditor
              value={field.value ?? ""}
              onChange={field.onChange}
              placeholder="Descreva o bairro: perfil de quem mora, infraestrutura, praia, comércio, mobilidade..."
              minHeight={200}
            />
          )}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Meta title" error={errors.metaTitle?.message} hint="Se vazio, usa o padrão gerado automaticamente.">
          <input {...register("metaTitle")} placeholder={`${nome || "Bairro"}, Cidade/SP - Como é morar no bairro?`} className={inputCls} />
        </Field>
        <Field label="Meta description" error={errors.metaDescription?.message} hint="Até 160 caracteres.">
          <textarea {...register("metaDescription")} rows={2} maxLength={200} className={`${inputCls} resize-none`} />
        </Field>
      </div>

      <Field label="Bairros próximos" hint="Usado na seção de linkagem interna da página do bairro.">
        {proximos.length === 0 ? (
          <p className="font-inter text-xs text-muted-foreground/60">Nenhum outro bairro cadastrado nessa cidade ainda.</p>
        ) : (
          <Controller
            name="bairrosProximosIds"
            control={control}
            render={({ field }) => (
              <div className="flex flex-wrap gap-2">
                {proximos.map((b) => {
                  const checked = (field.value ?? []).includes(b.id);
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        const current = field.value ?? [];
                        field.onChange(
                          checked ? current.filter((id) => id !== b.id) : [...current, b.id]
                        );
                      }}
                      className={`rounded-full border px-3 py-1 font-inter text-xs transition-colors ${
                        checked
                          ? "border-amber-400 bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-400"
                          : "border-input text-muted-foreground hover:border-amber-300"
                      }`}
                    >
                      {b.nome}
                    </button>
                  );
                })}
              </div>
            )}
          />
        )}
      </Field>

      {serverError && <p className="font-inter text-sm text-destructive">{serverError}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar bairro"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/bairros")}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
