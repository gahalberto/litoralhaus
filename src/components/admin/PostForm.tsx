"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Region } from "@prisma/client";
import { toast } from "sonner";

import { postFormSchema, type PostFormData } from "@/types/blog";
import { createPost, updatePost, deletePost } from "@/actions/blog";
import { slugify } from "@/lib/slugify";
import { REGION_LABELS } from "@/lib/property-config";
import { Button }   from "@/components/ui/button";
import { Label }    from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch }   from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { CoverImageUploader } from "@/components/admin/CoverImageUploader";
import { cn } from "@/lib/utils";
import { Loader2, Trash2, ExternalLink } from "lucide-react";

// ─── Layout helpers ───────────────────────────────────────────────────────────

function Section({ title, description, children }: {
  title: string; description?: string; children: React.ReactNode;
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

function Field({ label, error, children, hint }: {
  label: string; error?: string; children: React.ReactNode; hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="font-inter text-xs font-medium text-foreground">{label}</Label>
      {children}
      {hint && !error && <p className="font-inter text-[11px] text-muted-foreground">{hint}</p>}
      {error && <p className="font-inter text-[11px] text-destructive">{error}</p>}
    </div>
  );
}

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 font-inter text-sm shadow-xs transition-colors",
        "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface PostFormProps {
  initialData?: Partial<PostFormData> & { id?: string };
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function PostForm({ initialData }: PostFormProps) {
  const isEdit = !!initialData?.id;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const [slugEdited, setSlugEdited] = useState(isEdit);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      id:           initialData?.id ?? "",
      title:        initialData?.title ?? "",
      slug:         initialData?.slug ?? "",
      excerpt:      initialData?.excerpt ?? "",
      content:      initialData?.content ?? "",
      coverImage:   initialData?.coverImage ?? "",
      published:    initialData?.published ?? false,
      publishedAt:  initialData?.publishedAt ?? "",
      authorName:   initialData?.authorName ?? "Litoral Haus",
      region:       initialData?.region ?? null,
      city:         initialData?.city ?? "",
      neighborhood: initialData?.neighborhood ?? "",
      tagsRaw:      initialData?.tagsRaw ?? "",
      seoTitle:     initialData?.seoTitle ?? "",
      seoDescription: initialData?.seoDescription ?? "",
    },
  });

  const title     = watch("title");
  const published = watch("published");
  const slug      = watch("slug");

  // Auto-gera slug a partir do título (só quando não foi editado manualmente)
  useEffect(() => {
    if (!slugEdited && title) {
      setValue("slug", slugify(title), { shouldValidate: false });
    }
  }, [title, slugEdited, setValue]);

  function onSubmit(data: PostFormData) {
    startTransition(async () => {
      const result = isEdit ? await updatePost(data) : await createPost(data);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(isEdit ? "Post atualizado!" : "Post criado!");
      router.push("/admin/blog");
    });
  }

  function handleDelete() {
    if (!initialData?.id) return;
    if (!confirm("Excluir este post permanentemente?")) return;
    startDelete(async () => {
      await deletePost(initialData.id!);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      <input type="hidden" {...register("id")} />

      {/* ── Conteúdo ─────────────────────────────────────────────────────── */}
      <Section
        title="Conteúdo"
        description="Título, resumo e corpo do artigo."
      >
        <Field label="Título" error={errors.title?.message}>
          <Input
            {...register("title")}
            placeholder="Como é morar na Enseada, em Guarujá"
            autoFocus
          />
        </Field>

        <Field
          label="Slug (URL)"
          error={errors.slug?.message}
          hint={`/blog/${slug || "meu-artigo"}`}
        >
          <Input
            {...register("slug")}
            placeholder="como-e-morar-na-enseada-guaruja"
            onChange={(e) => {
              setSlugEdited(true);
              setValue("slug", e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
            }}
          />
        </Field>

        <Field label="Resumo (excerpt)" error={errors.excerpt?.message} hint="Aparece na listagem e nas meta tags. Máx. 160 caracteres ideal.">
          <Textarea
            {...register("excerpt")}
            rows={3}
            placeholder="Descubra como é a vida no bairro mais charmoso do Guarujá..."
            className="resize-y font-inter text-sm"
          />
        </Field>

        <Field
          label="Conteúdo HTML"
          error={errors.content?.message}
          hint="Cole o HTML do artigo. Use <h2>, <p>, <ul>, <blockquote> etc."
        >
          <Textarea
            {...register("content")}
            rows={20}
            placeholder="<h2>O bairro da Enseada</h2><p>...</p>"
            className="resize-y font-mono text-xs"
          />
        </Field>
      </Section>

      <Separator />

      {/* ── Mídia ────────────────────────────────────────────────────────── */}
      <Section
        title="Imagem de capa"
        description="Enviada para o Cloudinary. Proporção 16:9 (1200×630 px) recomendada."
      >
        <CoverImageUploader
          value={watch("coverImage") ?? ""}
          onChange={(url) => setValue("coverImage", url)}
        />
      </Section>

      <Separator />

      {/* ── Localização ──────────────────────────────────────────────────── */}
      <Section
        title="Localização"
        description="Associe o artigo a uma região ou bairro. Isso ativa o PropertyShowcase automático no final do post."
      >
        <Field label="Região" error={errors.region?.message}>
          <select
            {...register("region")}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 font-inter text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">— Nenhuma —</option>
            {Object.values(Region).map((r) => (
              <option key={r} value={r}>{REGION_LABELS[r]}</option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Cidade" error={errors.city?.message}>
            <Input {...register("city")} placeholder="Guarujá" />
          </Field>
          <Field label="Bairro" error={errors.neighborhood?.message}>
            <Input {...register("neighborhood")} placeholder="Enseada" />
          </Field>
        </div>
      </Section>

      <Separator />

      {/* ── Publicação ───────────────────────────────────────────────────── */}
      <Section title="Publicação" description="Controle de visibilidade e data de publicação.">
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 px-4 py-3">
          <Switch
            id="published"
            checked={published}
            onCheckedChange={(v) => setValue("published", v)}
          />
          <div>
            <Label htmlFor="published" className="cursor-pointer font-inter text-sm font-medium">
              {published ? "Publicado" : "Rascunho"}
            </Label>
            <p className="font-inter text-[11px] text-muted-foreground">
              {published ? "Visível no site público" : "Não aparece no site"}
            </p>
          </div>
        </div>

        <Field label="Data de publicação" hint="Deixe vazio para usar a data atual ao publicar.">
          <Input
            {...register("publishedAt")}
            type="datetime-local"
          />
        </Field>

        <Field label="Autor">
          <Input {...register("authorName")} placeholder="Litoral Haus" />
        </Field>
      </Section>

      <Separator />

      {/* ── Tags ─────────────────────────────────────────────────────────── */}
      <Section title="Tags" description="Separadas por vírgula. Ex: mercado imobiliário, dicas de compra, Guarujá">
        <Field label="Tags" error={errors.tagsRaw?.message}>
          <Input
            {...register("tagsRaw")}
            placeholder="guia de bairro, enseada, guarujá, investimento"
          />
        </Field>
      </Section>

      <Separator />

      {/* ── SEO ──────────────────────────────────────────────────────────── */}
      <Section
        title="SEO"
        description="Deixe vazio para usar o título e resumo do artigo como padrão."
      >
        <Field label="Title tag (override)" hint="Máx. 60 caracteres">
          <Input {...register("seoTitle")} placeholder="Como é morar na Enseada — Guia Litoral Haus" />
        </Field>
        <Field label="Meta description (override)" hint="Máx. 160 caracteres">
          <Textarea
            {...register("seoDescription")}
            rows={2}
            placeholder="Tudo sobre o bairro da Enseada no Guarujá: infraestrutura, praias, imóveis e qualidade de vida."
            className="resize-none font-inter text-sm"
          />
        </Field>
      </Section>

      {/* ── Ações ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-t border-border pt-6">
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isPending || isDeleting} className="gap-2">
            {isPending && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? "Salvar alterações" : "Criar post"}
          </Button>

          {isEdit && initialData?.slug && (
            <a
              href={`/blog/${initialData.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 font-inter text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <ExternalLink size={12} />
              Ver no site
            </a>
          )}
        </div>

        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting || isPending}
            className="flex items-center gap-1.5 font-inter text-xs text-destructive/70 transition-colors hover:text-destructive disabled:opacity-50"
          >
            {isDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
            Excluir post
          </button>
        )}
      </div>
    </form>
  );
}
