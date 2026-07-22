import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { getBairroById, deleteBairro } from "@/actions/bairros";
import { getCidades } from "@/actions/cidades";
import { BairroForm } from "@/components/admin/BairroForm";

export const metadata: Metadata = { title: "Editar Bairro" };

export default async function EditBairroPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [bairro, cidades] = await Promise.all([getBairroById(id), getCidades()]);
  if (!bairro) notFound();

  const initialData = {
    id:                  bairro.id,
    cidadeId:            bairro.cidadeId,
    nome:                bairro.nome,
    slug:                bairro.slug,
    textoMorar:          bairro.textoMorar ?? "",
    aluguelMedio:        bairro.aluguelMedio != null ? String(bairro.aluguelMedio) : "",
    vendaMedia:          bairro.vendaMedia   != null ? String(bairro.vendaMedia)   : "",
    metaTitle:           bairro.metaTitle ?? "",
    metaDescription:     bairro.metaDescription ?? "",
    latitude:            bairro.latitude  != null ? String(bairro.latitude)  : "",
    longitude:           bairro.longitude != null ? String(bairro.longitude) : "",
    ativo:               bairro.ativo,
    bairrosProximosIds:  bairro.bairrosProximos.map((b) => b.id),
  };

  return (
    <div className="mx-auto max-w-2xl px-8 py-8 space-y-8">
      <nav className="flex items-center gap-2 font-inter text-xs text-muted-foreground">
        <Link href="/admin/bairros" className="hover:text-foreground">Bairros</Link>
        <span>/</span>
        <span className="text-foreground truncate max-w-xs">{bairro.nome}</span>
      </nav>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-cormorant text-2xl font-light text-foreground">{bairro.nome}</h1>
          <p className="mt-1 font-inter text-xs text-muted-foreground">
            {bairro.cidade.nome} · {bairro._count.properties} imóve{bairro._count.properties !== 1 ? "is" : "l"} vinculado{bairro._count.properties !== 1 ? "s" : ""}
            {bairro.criadoAutomaticamente && " · Criado automaticamente"}
          </p>
        </div>
        {bairro.ativo ? (
          <Link
            href={`/regioes/${bairro.cidade.slug}/${bairro.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 font-inter text-xs text-foreground transition-colors hover:border-amber-400 hover:text-amber-600"
          >
            <ExternalLink size={13} />
            Ver página
          </Link>
        ) : (
          <span
            title="Ative o bairro para visualizar a página pública"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 font-inter text-xs text-muted-foreground/40"
          >
            <ExternalLink size={13} />
            Ver página
          </span>
        )}
      </div>

      <BairroForm cidades={cidades.map((c) => ({ id: c.id, nome: c.nome }))} initialData={initialData} />

      <section className="border-t border-border pt-6">
        <form action={async () => { "use server"; await deleteBairro(id); redirect("/admin/bairros"); }}>
          <button type="submit" className="font-inter text-xs text-destructive hover:underline transition-colors">
            Excluir bairro
          </button>
        </form>
      </section>
    </div>
  );
}
