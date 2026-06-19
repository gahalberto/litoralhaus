import type { Metadata } from "next";
import Link from "next/link";
import { OwnerForm } from "@/components/admin/OwnerForm";

export const metadata: Metadata = { title: "Novo Proprietário" };

export default function NewOwnerPage() {
  return (
    <div className="mx-auto max-w-2xl px-8 py-8">
      <nav className="mb-6 flex items-center gap-2 font-inter text-xs text-muted-foreground">
        <Link href="/admin/owners" className="hover:text-foreground">Proprietários</Link>
        <span>/</span>
        <span className="text-foreground">Novo</span>
      </nav>
      <h1 className="mb-8 font-cormorant text-2xl font-light text-foreground">Novo proprietário</h1>
      <OwnerForm />
    </div>
  );
}
