"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { PropertyType, PropertyStatus, Region } from "@prisma/client";

import { propertyFormSchema, type PropertyFormData } from "@/types/property";
import { createProperty } from "@/actions/properties";
import { slugify } from "@/lib/slugify";
import { fetchCep, formatCep } from "@/lib/cep";
import {
  PROPERTY_TYPE_LABELS,
  PROPERTY_STATUS_CONFIG,
  REGION_LABELS,
} from "@/lib/property-config";

import { Button }        from "@/components/ui/button";
import { Label }         from "@/components/ui/label";
import { Textarea }      from "@/components/ui/textarea";
import { Switch }        from "@/components/ui/switch";
import { Separator }     from "@/components/ui/separator";
import { CatalogPicker } from "@/components/admin/CatalogPicker";
import { createHighlight, createAmenity, type CatalogItem } from "@/actions/catalog";
import { cn }            from "@/lib/utils";

// ─── Helpers de layout ────────────────────────────────────────────────────────

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-[200px_1fr]">
      <div className="pt-1">
        <p className="font-inter text-sm font-medium text-foreground">{title}</p>
        {description && (
          <p className="mt-1 font-inter text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function FieldGroup({ children, cols = 2 }: { children: React.ReactNode; cols?: 2 | 3 | 4 }) {
  return (
    <div
      className={cn("grid gap-4", {
        "grid-cols-2": cols === 2,
        "grid-cols-3": cols === 3,
        "grid-cols-4": cols === 4,
      })}
    >
      {children}
    </div>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="font-inter text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      {children}
      {hint && !error && (
        <p className="font-inter text-[10px] text-muted-foreground/60">{hint}</p>
      )}
      {error && (
        <p className="font-inter text-[10px] text-destructive">{error}</p>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-md border border-input bg-background px-3 py-2 font-inter text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring disabled:opacity-50";

const selectCls = cn(inputCls, "cursor-pointer appearance-none");

// ─── Componente principal ──────────────────────────────────────────────────────

interface PropertyFormProps {
  highlights: CatalogItem[];
  amenities:  CatalogItem[];
}

export function PropertyForm({ highlights, amenities }: PropertyFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      status:   PropertyStatus.DISPONIVEL,
      type:     PropertyType.APARTMENT,
      region:   Region.GUARUJA,
      isIsca:   false,
      featured: false,
    },
  });

  // Auto-gera slug a partir do título
  const title = watch("title");
  useEffect(() => {
    if (title) setValue("slug", slugify(title), { shouldValidate: false });
  }, [title, setValue]);

  // CEP auto-fill
  const [cepStatus, setCepStatus] = useState<"idle" | "loading" | "error">("idle");
  const cepValue = watch("cep");
  useEffect(() => {
    const digits = (cepValue ?? "").replace(/\D/g, "");
    if (digits.length !== 8) {
      setCepStatus("idle");
      return;
    }
    setCepStatus("loading");
    fetchCep(digits).then((data) => {
      if (!data) {
        setCepStatus("error");
        return;
      }
      setValue("city",         data.localidade,  { shouldValidate: true });
      setValue("neighborhood", data.bairro,       { shouldValidate: true });
      setValue("address",      data.logradouro,   { shouldValidate: true });
      setCepStatus("idle");
    });
  }, [cepValue, setValue]);

  // Seleção de destaques e comodidades
  const [selectedHighlights, setSelectedHighlights] = useState<string[]>([]);
  const [selectedAmenities,  setSelectedAmenities]  = useState<string[]>([]);

  const isIsca   = watch("isIsca");
  const featured = watch("featured");
  const seoTitle       = watch("seoTitle") ?? "";
  const seoDescription = watch("seoDescription") ?? "";

  function onSubmit(data: PropertyFormData) {
    startTransition(async () => {
      const result = await createProperty({
        ...data,
        highlightIds: selectedHighlights,
        amenityIds:   selectedAmenities,
      });
      if (!result.success) {
        setError("root", { message: result.error });
        return;
      }
      router.push("/admin/properties");
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 pb-20">

      {/* ── Identificação ── */}
      <Section
        title="Identificação"
        description="Dados principais e visibilidade do imóvel."
      >
        <FieldGroup cols={2}>
          <div className="col-span-2">
            <Field label="Título *" error={errors.title?.message}>
              <input
                {...register("title")}
                placeholder="Ex: Cobertura Duplex Frente Mar — Enseada"
                className={inputCls}
              />
            </Field>
          </div>
          <Field
            label="Slug (URL) *"
            error={errors.slug?.message}
            hint="Gerado automaticamente — editável"
          >
            <input {...register("slug")} className={inputCls} />
          </Field>
          <FieldGroup cols={2}>
            <Field label="Tipo *" error={errors.type?.message}>
              <select {...register("type")} className={selectCls}>
                {Object.values(PropertyType).map((t) => (
                  <option key={t} value={t} className="bg-background">
                    {PROPERTY_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Status *" error={errors.status?.message}>
              <select {...register("status")} className={selectCls}>
                {Object.values(PropertyStatus).map((s) => (
                  <option key={s} value={s} className="bg-background">
                    {PROPERTY_STATUS_CONFIG[s].label}
                  </option>
                ))}
              </select>
            </Field>
          </FieldGroup>
        </FieldGroup>

        <FieldGroup cols={2}>
          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/50">
            <div>
              <p className="font-inter text-sm font-medium text-foreground">Imóvel Isca</p>
              <p className="font-inter text-xs text-muted-foreground">
                Exibe na Landing Page como ativo de captação
              </p>
            </div>
            <Switch
              checked={isIsca}
              onCheckedChange={(v) => setValue("isIsca", v)}
            />
          </label>
          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/50">
            <div>
              <p className="font-inter text-sm font-medium text-foreground">Destaque</p>
              <p className="font-inter text-xs text-muted-foreground">
                Aparece primeiro nas listagens
              </p>
            </div>
            <Switch
              checked={featured}
              onCheckedChange={(v) => setValue("featured", v)}
            />
          </label>
        </FieldGroup>
      </Section>

      <Separator />

      {/* ── Localização ── */}
      <Section
        title="Localização"
        description="Digite o CEP para preencher automaticamente."
      >
        {/* CEP + Região */}
        <FieldGroup cols={2}>
          <Field
            label="CEP"
            error={cepStatus === "error" ? "CEP não encontrado" : undefined}
          >
            <div className="relative">
              <input
                {...register("cep")}
                placeholder="00000-000"
                maxLength={9}
                className={inputCls}
                onChange={(e) => {
                  const formatted = formatCep(e.target.value);
                  e.target.value = formatted;
                  register("cep").onChange(e);
                }}
              />
              {cepStatus === "loading" && (
                <div className="absolute inset-y-0 right-3 flex items-center">
                  <svg
                    className="h-3.5 w-3.5 animate-spin text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                  </svg>
                </div>
              )}
              {cepStatus === "error" && (
                <div className="absolute inset-y-0 right-3 flex items-center text-destructive">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              )}
            </div>
          </Field>
          <Field label="Região *" error={errors.region?.message}>
            <select {...register("region")} className={selectCls}>
              {Object.values(Region).map((r) => (
                <option key={r} value={r} className="bg-background">
                  {REGION_LABELS[r]}
                </option>
              ))}
            </select>
          </Field>
        </FieldGroup>

        {/* Campos preenchidos pelo CEP */}
        <FieldGroup cols={2}>
          <Field label="Cidade *" error={errors.city?.message}>
            <input
              {...register("city")}
              placeholder="Preenchido via CEP"
              className={cn(inputCls, cepStatus === "loading" && "animate-pulse")}
            />
          </Field>
          <Field label="Bairro *" error={errors.neighborhood?.message}>
            <input
              {...register("neighborhood")}
              placeholder="Preenchido via CEP"
              className={cn(inputCls, cepStatus === "loading" && "animate-pulse")}
            />
          </Field>
          <div className="col-span-2">
            <Field label="Logradouro">
              <input
                {...register("address")}
                placeholder="Preenchido via CEP — edite para adicionar número"
                className={cn(inputCls, cepStatus === "loading" && "animate-pulse")}
              />
            </Field>
          </div>
        </FieldGroup>
      </Section>

      <Separator />

      {/* ── Características ── */}
      <Section
        title="Características"
        description="Áreas e cômodos do imóvel."
      >
        <FieldGroup cols={4}>
          {(
            [
              { name: "bedrooms",     label: "Quartos"     },
              { name: "suites",       label: "Suítes"      },
              { name: "bathrooms",    label: "Banheiros"   },
              { name: "parkingSpots", label: "Vagas"       },
            ] as const
          ).map(({ name, label }) => (
            <Field key={name} label={label} error={errors[name]?.message}>
              <input
                {...register(name)}
                type="number"
                min={0}
                placeholder="0"
                className={inputCls}
              />
            </Field>
          ))}
        </FieldGroup>
        <FieldGroup cols={2}>
          <Field label="Área Total (m²)" error={errors.areaTotal?.message}>
            <input {...register("areaTotal")} type="number" step="0.01" placeholder="0,00" className={inputCls} />
          </Field>
          <Field label="Área Útil (m²)" error={errors.areaUsable?.message}>
            <input {...register("areaUsable")} type="number" step="0.01" placeholder="0,00" className={inputCls} />
          </Field>
        </FieldGroup>
      </Section>

      <Separator />

      {/* ── Financeiro ── */}
      <Section
        title="Financeiro"
        description="Valores em Reais (R$), sem formatação."
      >
        <FieldGroup cols={2}>
          <Field label="Preço de Venda (R$)" error={errors.priceAsk?.message}>
            <input {...register("priceAsk")} type="number" step="1000" placeholder="Ex: 2500000" className={inputCls} />
          </Field>
          <Field label="Preço de Locação (R$)">
            <input {...register("priceRent")} type="number" step="100" placeholder="Ex: 12000" className={inputCls} />
          </Field>
          <Field label="Condomínio (R$)">
            <input {...register("condoFee")} type="number" step="10" className={inputCls} />
          </Field>
          <Field label="IPTU/ano (R$)">
            <input {...register("iptu")} type="number" step="100" className={inputCls} />
          </Field>
        </FieldGroup>
      </Section>

      <Separator />

      {/* ── Descrição ── */}
      <Section
        title="Descrição"
        description="Texto de venda exibido no anúncio."
      >
        <Field label="Descrição" error={errors.description?.message}>
          <Textarea
            {...register("description")}
            rows={5}
            placeholder="Descreva o imóvel com detalhes que convertem: vista, acabamento, localização..."
            className="font-inter text-sm"
          />
        </Field>
      </Section>

      <Separator />

      {/* ── Destaques ── */}
      <Section
        title="Destaques"
        description="Atributos exclusivos do imóvel. Selecione os que se aplicam ou adicione novos."
      >
        <CatalogPicker
          label="Destaque"
          items={highlights}
          selected={selectedHighlights}
          onChange={setSelectedHighlights}
          onAdd={createHighlight}
        />
      </Section>

      <Separator />

      {/* ── Comodidades ── */}
      <Section
        title="Comodidades"
        description="Infraestrutura do condomínio ou da propriedade."
      >
        <CatalogPicker
          label="Comodidade"
          items={amenities}
          selected={selectedAmenities}
          onChange={setSelectedAmenities}
          onAdd={createAmenity}
        />
      </Section>

      <Separator />

      {/* ── SEO ── */}
      <Section
        title="SEO"
        description="Controle o que o Google indexa. Impacto direto no ranqueamento."
      >
        <Field
          label={`SEO Title — ${seoTitle.length}/70`}
          error={errors.seoTitle?.message}
          hint="Palavra-chave principal no início. Ex: Cobertura Frente Mar Guarujá"
        >
          <input
            {...register("seoTitle")}
            maxLength={70}
            placeholder="Cobertura Duplex Frente Mar — Enseada, Guarujá | Litoral Haus"
            className={inputCls}
          />
        </Field>
        <Field
          label={`SEO Description — ${seoDescription.length}/160`}
          error={errors.seoDescription?.message}
          hint="Tom de urgência + diferencial + CTA. Máx. 160 caracteres."
        >
          <Textarea
            {...register("seoDescription")}
            maxLength={160}
            rows={3}
            placeholder="Cobertura duplex de 380m² com vista 360° para o mar. 4 suítes, 4 vagas, piscina privativa. Exclusividade total. Consulte disponibilidade."
            className="font-inter text-sm"
          />
        </Field>
      </Section>

      <Separator />

      {/* ── Mídia ── */}
      <Section
        title="Mídia"
        description="URLs das imagens. A primeira será a capa."
      >
        <Field
          label="URLs das Imagens"
          hint="Uma URL por linha. A primeira imagem será a capa do anúncio."
        >
          <Textarea
            {...register("imagesRaw")}
            rows={5}
            placeholder={"https://cdn.exemplo.com/foto1.jpg\nhttps://cdn.exemplo.com/foto2.jpg"}
            className="font-mono text-xs"
          />
        </Field>
      </Section>

      {/* ── Erros globais + Submit ── */}
      {errors.root && (
        <p className="rounded border border-destructive/30 bg-destructive/5 px-4 py-3 font-inter text-xs text-destructive">
          {errors.root.message}
        </p>
      )}

      <div className="sticky bottom-0 flex items-center justify-between border-t border-border bg-background/95 px-0 py-4 backdrop-blur">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/properties")}
          disabled={isPending}
          className="font-inter text-xs"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="min-w-40 rounded-none border border-amber-400 bg-amber-400 font-inter text-xs font-medium uppercase tracking-widest text-stone-950 hover:bg-transparent hover:text-amber-600 dark:hover:text-amber-400"
        >
          {isPending ? "Salvando..." : "Cadastrar Imóvel"}
        </Button>
      </div>
    </form>
  );
}
