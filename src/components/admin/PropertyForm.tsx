"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { PropertyType, PropertyStatus, Region } from "@prisma/client";

import { propertyFormSchema, type PropertyFormData } from "@/types/property";
import { createProperty, updateProperty } from "@/actions/properties";
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
import { CatalogPicker }   from "@/components/admin/CatalogPicker";
import { ImageUploader }   from "@/components/admin/ImageUploader";
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

function formatBRL(raw: string) {
  const n = Number(raw);
  if (!raw || isNaN(n)) return "";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function CurrencyInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string | undefined;
  onChange: (v: string | undefined) => void;
  placeholder?: string;
  className?: string;
}) {
  const [display, setDisplay] = useState(() => formatBRL(value ?? ""));

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "");
    setDisplay(raw === "" ? "" : Number(raw).toLocaleString("pt-BR"));
    onChange(raw === "" ? undefined : raw);
  }

  function handleBlur() {
    setDisplay(formatBRL(value ?? ""));
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      value={display}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
    />
  );
}

// ─── PhoneInput: código do país editável + número formatado ─────────────────

function formatLocalPhone(digits: string, countryCode: string): string {
  const d = digits.slice(0, 13); // limite seguro
  if (countryCode !== "55") return d; // fora do BR: sem formatação automática
  // Brasil: DDD(2) + número(8 ou 9)
  const br = d.slice(0, 11);
  if (br.length === 0)  return "";
  if (br.length <= 2)   return br;
  if (br.length <= 6)   return `${br.slice(0, 2)} ${br.slice(2)}`;
  if (br.length <= 10)  return `${br.slice(0, 2)} ${br.slice(2, 6)}-${br.slice(6)}`;
  return `${br.slice(0, 2)} ${br.slice(2, 7)}-${br.slice(7)}`;
}

function parseStored(stored: string): { countryCode: string; local: string } {
  const s = stored.trim();
  if (!s) return { countryCode: "55", local: "" };
  // formato canônico: +CCNUMBER  ex: +5513955422935 ou +12125551234
  const m = s.match(/^\+?(\d{1,4})(\d*)$/);
  if (m) return { countryCode: m[1], local: m[2] };
  return { countryCode: "55", local: s.replace(/\D/g, "") };
}

function PhoneInput({
  value,
  onChange,
  className,
}: {
  value: string | undefined;
  onChange: (v: string) => void;
  className?: string;
}) {
  const parsed = parseStored(value ?? "");
  const [countryCode, setCountryCode] = useState(parsed.countryCode);
  const [local, setLocal]             = useState(parsed.local);

  function saveValue(cc: string, loc: string) {
    const digits = loc.replace(/\D/g, "");
    onChange(digits.length > 0 ? `+${cc}${digits}` : "");
  }

  function handleCountryCode(e: React.ChangeEvent<HTMLInputElement>) {
    const cc = e.target.value.replace(/\D/g, "").slice(0, 4);
    setCountryCode(cc);
    saveValue(cc, local);
  }

  function handleLocal(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "");
    setLocal(raw);
    saveValue(countryCode, raw);
  }

  const display = formatLocalPhone(local, countryCode);
  const isBR    = countryCode === "55";

  return (
    <div className="flex gap-2">
      {/* Código do país */}
      <div className="relative flex shrink-0 items-center">
        <span className="pointer-events-none absolute left-3 select-none font-inter text-sm text-muted-foreground">+</span>
        <input
          type="text"
          inputMode="numeric"
          value={countryCode}
          onChange={handleCountryCode}
          placeholder="55"
          className={cn(className, "w-16 pl-6 text-center")}
          title="Código do país"
        />
      </div>
      {/* Número local */}
      <input
        type="tel"
        inputMode="numeric"
        value={display}
        onChange={handleLocal}
        placeholder={isBR ? "13 99999-9999" : "número"}
        className={cn(className, "flex-1")}
      />
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────────

type InitialData = PropertyFormData & { id: string };

interface PropertyFormProps {
  highlights:   CatalogItem[];
  amenities:    CatalogItem[];
  initialData?: InitialData;
}

export function PropertyForm({ highlights, amenities, initialData }: PropertyFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: initialData ?? {
      status:       PropertyStatus.DISPONIVEL,
      type:         PropertyType.APARTMENT,
      region:       Region.GUARUJA,
      isIsca:            false,
      featured:          false,
      showAddressNumber: false,
      highlightIds:      [],
      amenityIds:        [],
    },
  });

  // Auto-gera slug a partir do título (só no cadastro)
  const title = watch("title");
  useEffect(() => {
    if (!isEdit && title) setValue("slug", slugify(title), { shouldValidate: false });
  }, [title, setValue, isEdit]);

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
  const [selectedHighlights, setSelectedHighlights] = useState<string[]>(
    initialData?.highlightIds ?? []
  );
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    initialData?.amenityIds ?? []
  );

  const isIsca            = watch("isIsca");
  const featured          = watch("featured");
  const showAddressNumber = watch("showAddressNumber");
  const seoTitle       = watch("seoTitle") ?? "";
  const seoDescription = watch("seoDescription") ?? "";

  function onSubmit(data: PropertyFormData) {
    startTransition(async () => {
      const payload = { ...data, highlightIds: selectedHighlights, amenityIds: selectedAmenities };
      const result = isEdit
        ? await updateProperty(initialData.id, payload)
        : await createProperty(payload);
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
                placeholder="Preenchido via CEP"
                className={cn(inputCls, cepStatus === "loading" && "animate-pulse")}
              />
            </Field>
          </div>
        </FieldGroup>

        {/* Número + toggle público */}
        <FieldGroup cols={2}>
          <Field label="Número" hint="Ex: 123, s/n, Apto 42">
            <input
              {...register("addressNumber")}
              placeholder="123"
              className={inputCls}
            />
          </Field>
          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/50">
            <div>
              <p className="font-inter text-sm font-medium text-foreground">Exibir número no site</p>
              <p className="font-inter text-xs text-muted-foreground">
                Por padrão ocultado — ative para mostrar publicamente
              </p>
            </div>
            <Switch
              checked={showAddressNumber}
              onCheckedChange={(v) => setValue("showAddressNumber", v)}
            />
          </label>
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
            <CurrencyInput
              value={watch("priceAsk")}
              onChange={(v) => setValue("priceAsk", v, { shouldValidate: true })}
              placeholder="R$ 2.500.000"
              className={inputCls}
            />
          </Field>
          <Field label="Preço de Locação (R$)">
            <CurrencyInput
              value={watch("priceRent")}
              onChange={(v) => setValue("priceRent", v, { shouldValidate: false })}
              placeholder="R$ 12.000"
              className={inputCls}
            />
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

      {/* ── Proprietário (somente admin) ── */}
      <Section
        title="Proprietário"
        description="Dados internos do proprietário. Nunca exibidos no site público."
      >
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-400/20 dark:bg-amber-400/5">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 text-amber-600 dark:text-amber-400">
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 3a1 1 0 110 2 1 1 0 010-2zm0 3.5v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <p className="font-inter text-[11px] text-amber-700 dark:text-amber-400">
            Informações confidenciais — visíveis apenas no painel admin
          </p>
        </div>
        <FieldGroup cols={2}>
          <Field label="Nome do proprietário" error={errors.ownerName?.message}>
            <input
              {...register("ownerName")}
              placeholder="João Silva"
              className={inputCls}
            />
          </Field>
          <Field
            label="Telefone / WhatsApp"
            hint="Formato: +55 DDD número — ex: +55 13 99999-9999"
            error={errors.ownerPhone?.message}
          >
            <PhoneInput
              value={watch("ownerPhone")}
              onChange={(v) => setValue("ownerPhone", v)}
              className={inputCls}
            />
          </Field>
        </FieldGroup>
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
        description="Arraste ou selecione as fotos. A primeira será a capa."
      >
        <ImageUploader
          value={(watch("imagesRaw") ?? "").split("\n").filter(Boolean)}
          onChange={(urls) => setValue("imagesRaw", urls.join("\n"), { shouldValidate: false })}
        />
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
          {isPending ? "Salvando..." : isEdit ? "Salvar Alterações" : "Cadastrar Imóvel"}
        </Button>
      </div>
    </form>
  );
}
