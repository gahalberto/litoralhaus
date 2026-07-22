import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCidadeById, deleteCidade } from "@/actions/cidades";
import { CidadeForm } from "@/components/admin/CidadeForm";

export const metadata: Metadata = { title: "Editar Cidade" };

export default async function EditCidadePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cidade = await getCidadeById(id);
  if (!cidade) notFound();

  const initialData = {
    id:              cidade.id,
    nome:            cidade.nome,
    slug:            cidade.slug,
    uf:              cidade.uf,
    imagemUrl:       cidade.imagemUrl ?? "",
    textoIntro:      cidade.textoIntro ?? "",
    metaDescription: cidade.metaDescription ?? "",
    latitude:        cidade.latitude  != null ? String(cidade.latitude)  : "",
    longitude:       cidade.longitude != null ? String(cidade.longitude) : "",
    ativo:           cidade.ativo,
  };

  return (
    <div className="mx-auto max-w-2xl px-8 py-8 space-y-8">
      <nav className="flex items-center gap-2 font-inter text-xs text-muted-foreground">
        <Link href="/admin/cidades" className="hover:text-foreground">Cidades</Link>
        <span>/</span>
        <span className="text-foreground truncate max-w-xs">{cidade.nome}</span>
      </nav>

      <div>
        <h1 className="font-cormorant text-2xl font-light text-foreground">{cidade.nome}/{cidade.uf}</h1>
        <p className="mt-1 font-inter text-xs text-muted-foreground">
          {cidade._count.bairros} bairro{cidade._count.bairros !== 1 ? "s" : ""} · {cidade._count.properties} imóve{cidade._count.properties !== 1 ? "is" : "l"}
        </p>
      </div>

      <CidadeForm initialData={initialData} />

      <section className="border-t border-border pt-6">
        <p className="mb-3 font-inter text-xs text-muted-foreground">
          Só é possível excluir cidades sem bairros vinculados.
        </p>
        <form
          action={async () => {
            "use server";
            const res = await deleteCidade(id);
            if (res.success) redirect("/admin/cidades");
          }}
        >
          <button type="submit" className="font-inter text-xs text-destructive hover:underline transition-colors">
            Excluir cidade
          </button>
        </form>
      </section>
    </div>
  );
}
