import type { Metadata } from "next";
import Link from "next/link";
import { CidadeForm } from "@/components/admin/CidadeForm";

export const metadata: Metadata = { title: "Nova Cidade" };

export default function NewCidadePage() {
  return (
    <div className="mx-auto max-w-2xl px-8 py-8">
      <nav className="mb-6 flex items-center gap-2 font-inter text-xs text-muted-foreground">
        <Link href="/admin/cidades" className="hover:text-foreground">Cidades</Link>
        <span>/</span>
        <span className="text-foreground">Nova</span>
      </nav>
      <h1 className="mb-8 font-cormorant text-2xl font-light text-foreground">Nova cidade</h1>
      <CidadeForm />
    </div>
  );
}
