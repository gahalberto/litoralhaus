import type { Metadata } from "next";
import Link from "next/link";
import { BairroForm } from "@/components/admin/BairroForm";
import { getCidades } from "@/actions/cidades";

export const metadata: Metadata = { title: "Novo Bairro" };

export default async function NewBairroPage() {
  const cidades = await getCidades();

  return (
    <div className="mx-auto max-w-2xl px-8 py-8">
      <nav className="mb-6 flex items-center gap-2 font-inter text-xs text-muted-foreground">
        <Link href="/admin/bairros" className="hover:text-foreground">Bairros</Link>
        <span>/</span>
        <span className="text-foreground">Novo</span>
      </nav>
      <h1 className="mb-8 font-cormorant text-2xl font-light text-foreground">Novo bairro</h1>
      {cidades.length === 0 ? (
        <p className="font-inter text-sm text-muted-foreground">
          Cadastre uma cidade antes de criar um bairro.
        </p>
      ) : (
        <BairroForm cidades={cidades.map((c) => ({ id: c.id, nome: c.nome }))} />
      )}
    </div>
  );
}
