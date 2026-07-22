"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cidadeSchema, type CidadeFormData } from "@/types/cidade";
import { createCidade, updateCidade } from "@/actions/cidades";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { CoverImageUploader } from "@/components/admin/CoverImageUploader";
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
  initialData?: CidadeFormData & { id: string };
}

export function CidadeForm({ initialData }: Props) {
  const router = useRouter();
  const [isPending, start] = useTransition();
  const [serverError, setServerError] = useState("");
  const isEdit = !!initialData;
  const [slugTouched, setSlugTouched] = useState(isEdit);

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<CidadeFormData>({
    resolver: zodResolver(cidadeSchema),
    defaultValues: initialData ?? {
      nome: "", slug: "", uf: "SP", imagemUrl: "", textoIntro: "", metaDescription: "",
      latitude: "", longitude: "", ativo: true,
    },
  });

  const nome = watch("nome");

  function onSubmit(data: CidadeFormData) {
    start(async () => {
      const res = isEdit
        ? await updateCidade(initialData.id, data)
        : await createCidade(data);
      if (res.success) {
        router.push(`/admin/cidades/${res.id}/edit`);
      } else {
        setServerError(res.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nome *" error={errors.nome?.message}>
          <input
            {...register("nome")}
            placeholder="Guarujá"
            className={inputCls}
            onChange={(e) => {
              setValue("nome", e.target.value);
              if (!slugTouched) setValue("slug", slugify(e.target.value), { shouldValidate: true });
            }}
          />
        </Field>
        <Field label="Slug *" error={errors.slug?.message} hint={`/regioes/${watch("slug") || "..."}`}>
          <input
            {...register("slug")}
            placeholder="guaruja"
            className={inputCls}
            onChange={(e) => { setSlugTouched(true); setValue("slug", e.target.value, { shouldValidate: true }); }}
          />
        </Field>
        <Field label="UF *" error={errors.uf?.message}>
          <input {...register("uf")} placeholder="SP" maxLength={2} className={inputCls} />
        </Field>
        <div className="flex items-end gap-3 pb-2">
          <Controller
            name="ativo"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <Switch checked={field.value} onCheckedChange={field.onChange} />
                <Label className="font-inter text-sm text-foreground">Ativo (visível em /regioes)</Label>
              </div>
            )}
          />
        </div>
        <Field label="Latitude" error={errors.latitude?.message}>
          <input {...register("latitude")} placeholder="-23.9935" className={inputCls} />
        </Field>
        <Field label="Longitude" error={errors.longitude?.message}>
          <input {...register("longitude")} placeholder="-46.2564" className={inputCls} />
        </Field>
      </div>

      <Field label="Foto principal da cidade" error={errors.imagemUrl?.message} hint="Usada como fundo da página /regioes/[cidade]. Proporção larga (16:9) recomendada.">
        <Controller
          name="imagemUrl"
          control={control}
          render={({ field }) => (
            <CoverImageUploader
              value={field.value ?? ""}
              onChange={field.onChange}
              folder="litoralhaus/cidades"
              label="Foto da cidade"
            />
          )}
        />
      </Field>

      <Field label={`Texto de introdução (${nome || "cidade"})`} error={errors.textoIntro?.message}>
        <Controller
          name="textoIntro"
          control={control}
          render={({ field }) => (
            <RichTextEditor
              value={field.value ?? ""}
              onChange={field.onChange}
              placeholder="Apresente a cidade: características, praias, perfil de quem mora..."
              minHeight={160}
            />
          )}
        />
      </Field>

      <Field label="Meta description" error={errors.metaDescription?.message} hint="Até 160 caracteres — usada no Google e no Open Graph.">
        <textarea
          {...register("metaDescription")}
          rows={2}
          maxLength={200}
          placeholder="Encontre os melhores imóveis em..."
          className={`${inputCls} resize-none`}
        />
      </Field>

      {serverError && <p className="font-inter text-sm text-destructive">{serverError}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar cidade"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/cidades")}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
